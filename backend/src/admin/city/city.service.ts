import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CityService {
  constructor(private prisma: PrismaService) {}

  async getAllCities() {
    const [cities, allBranches] = await Promise.all([
      this.prisma.city.findMany({
        orderBy: { name: 'asc' },
      }),
      this.prisma.branch.findMany({
        select: {
          id: true,
          branchName: true,
          branchCode: true,
          branchCity: true,
          cityId: true,
          status: true,
        },
      }),
    ]);

    return cities.map((c) => {
      const cityBranches = allBranches.filter(
        (b) =>
          b.cityId === c.id ||
          b.branchCity?.toLowerCase() === c.name.toLowerCase() ||
          (b.branchCity?.toLowerCase().includes('beng') && c.name.toLowerCase().includes('beng'))
      );
      return {
        ...c,
        branches: cityBranches,
      };
    });
  }

  async createCity(dto: { name: string; state: string; country?: string }, userId?: string) {
    const existing = await this.prisma.city.findUnique({ where: { name: dto.name } });
    if (existing) {
      throw new BadRequestException(`City '${dto.name}' already exists.`);
    }

    const city = await this.prisma.city.create({
      data: {
        name: dto.name,
        state: dto.state,
        country: dto.country || 'India',
        createdById: userId,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'CITY_CREATED',
        entityName: 'City',
        entityId: city.id,
        newData: { name: city.name, state: city.state },
      },
    });

    return city;
  }

  async updateCity(id: string, dto: { name?: string; state?: string; status?: string }) {
    const city = await this.prisma.city.findUnique({ where: { id } });
    if (!city) {
      throw new NotFoundException('City not found');
    }

    const updated = await this.prisma.city.update({
      where: { id },
      data: dto,
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'CITY_UPDATED',
        entityName: 'City',
        entityId: id,
        oldData: { name: city.name, status: city.status },
        newData: dto,
      },
    });

    return updated;
  }

  async deleteCity(id: string) {
    const city = await this.prisma.city.findUnique({
      where: { id },
      include: { _count: { select: { branches: true } } },
    });

    if (!city) {
      throw new NotFoundException('City not found');
    }

    if (city._count.branches > 0) {
      throw new BadRequestException('Cannot delete city that has active branches assigned.');
    }

    await this.prisma.city.delete({ where: { id } });

    await this.prisma.auditLog.create({
      data: {
        action: 'CITY_DELETED',
        entityName: 'City',
        entityId: id,
        oldData: { name: city.name },
      },
    });

    return { success: true };
  }
}
