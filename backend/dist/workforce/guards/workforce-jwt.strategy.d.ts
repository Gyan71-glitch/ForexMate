import { Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
declare const WorkforceJwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class WorkforceJwtStrategy extends WorkforceJwtStrategy_base {
    private prisma;
    constructor(prisma: PrismaService);
    validate(payload: any): Promise<{
        id: string;
        employeeCode: string;
        name: string;
        role: import(".prisma/client").$Enums.EmployeeRole;
        branchId: string;
        branchName: string;
    }>;
}
export {};
