"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CityService = class CityService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllCities() {
        return this.prisma.city.findMany({
            include: {
                branches: {
                    select: {
                        id: true,
                        branchName: true,
                        branchCode: true,
                        status: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
    }
    async createCity(dto, userId) {
        const existing = await this.prisma.city.findUnique({ where: { name: dto.name } });
        if (existing) {
            throw new common_1.BadRequestException(`City '${dto.name}' already exists.`);
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
    async updateCity(id, dto) {
        const city = await this.prisma.city.findUnique({ where: { id } });
        if (!city) {
            throw new common_1.NotFoundException('City not found');
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
    async deleteCity(id) {
        const city = await this.prisma.city.findUnique({
            where: { id },
            include: { _count: { select: { branches: true } } },
        });
        if (!city) {
            throw new common_1.NotFoundException('City not found');
        }
        if (city._count.branches > 0) {
            throw new common_1.BadRequestException('Cannot delete city that has active branches assigned.');
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
};
exports.CityService = CityService;
exports.CityService = CityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CityService);
//# sourceMappingURL=city.service.js.map