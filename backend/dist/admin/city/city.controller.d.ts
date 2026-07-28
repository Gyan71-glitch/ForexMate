import { CityService } from './city.service';
export declare class CityController {
  private readonly cityService;
  constructor(cityService: CityService);
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
    req: any,
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
