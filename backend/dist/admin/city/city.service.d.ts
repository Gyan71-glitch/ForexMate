import { PrismaService } from '../../prisma/prisma.service';
export declare class CityService {
  private prisma;
  constructor(prisma: PrismaService);
  getAllCities(): Promise<
    ({
      branches: {
        id: string;
        status: string;
        branchCode: string;
        branchName: string;
      }[];
    } & {
      country: string;
      id: string;
      createdAt: Date;
      name: string;
      status: string;
      updatedAt: Date;
      state: string;
      createdById: string | null;
    })[]
  >;
  createCity(
    dto: {
      name: string;
      state: string;
      country?: string;
    },
    userId?: string,
  ): Promise<{
    country: string;
    id: string;
    createdAt: Date;
    name: string;
    status: string;
    updatedAt: Date;
    state: string;
    createdById: string | null;
  }>;
  updateCity(
    id: string,
    dto: {
      name?: string;
      state?: string;
      status?: string;
    },
  ): Promise<{
    country: string;
    id: string;
    createdAt: Date;
    name: string;
    status: string;
    updatedAt: Date;
    state: string;
    createdById: string | null;
  }>;
  deleteCity(id: string): Promise<{
    success: boolean;
  }>;
}
