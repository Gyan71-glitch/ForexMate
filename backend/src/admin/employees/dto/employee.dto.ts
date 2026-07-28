import { IsEnum, IsNotEmpty, IsOptional, IsString, IsEmail } from 'class-validator';
import { EmployeeRole, EmployeeStatus } from '@prisma/client';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(EmployeeRole)
  role: EmployeeRole;

  @IsString()
  @IsNotEmpty()
  branchId: string;

  @IsString()
  @IsOptional()
  temporaryPassword?: string;

  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus;
}

export class UpdateEmployeeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(EmployeeRole)
  @IsOptional()
  role?: EmployeeRole;

  @IsString()
  @IsOptional()
  branchId?: string;

  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus;
}

export class ResetPasswordDto {
  @IsString()
  @IsOptional()
  temporaryPassword?: string;
}

export class UpdateEmployeeStatusDto {
  @IsEnum(EmployeeStatus)
  status: EmployeeStatus;
}
