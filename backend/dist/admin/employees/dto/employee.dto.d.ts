import { EmployeeRole, EmployeeStatus } from '@prisma/client';
export declare class CreateEmployeeDto {
    name: string;
    phone: string;
    email?: string;
    role: EmployeeRole;
    branchId: string;
    temporaryPassword?: string;
    status?: EmployeeStatus;
}
export declare class UpdateEmployeeDto {
    name?: string;
    phone?: string;
    email?: string;
    role?: EmployeeRole;
    branchId?: string;
    status?: EmployeeStatus;
}
export declare class ResetPasswordDto {
    temporaryPassword?: string;
}
export declare class UpdateEmployeeStatusDto {
    status: EmployeeStatus;
}
