import { CityService } from './city.service';
export declare class CityController {
    private readonly cityService;
    constructor(cityService: CityService);
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
    }, req: any): Promise<{
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
