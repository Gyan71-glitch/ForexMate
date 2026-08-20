import { PrismaService } from '../../prisma/prisma.service';
export declare class CityService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllCities(): Promise<{
        branches: {
            id: string;
            status: string;
            branchCode: string;
            branchName: string;
            branchCity: string;
            cityId: string | null;
        }[];
        id: string;
        name: string;
        state: string;
        country: string;
        status: string;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createCity(dto: {
        name: string;
        state: string;
        country?: string;
    }, userId?: string): Promise<{
        id: string;
        name: string;
        state: string;
        country: string;
        status: string;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateCity(id: string, dto: {
        name?: string;
        state?: string;
        status?: string;
    }): Promise<{
        id: string;
        name: string;
        state: string;
        country: string;
        status: string;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteCity(id: string): Promise<{
        success: boolean;
    }>;
}
