import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateStaffDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: 'Role name, e.g., MANAGER, TELLER' })
  @IsString()
  roleName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  branchId?: string;
}

export class CreateBranchAdminDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  branchCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  branchName: string;

  @ApiProperty()
  @IsString()
  branchAddress: string;

  @ApiProperty()
  @IsString()
  branchCity: string;
}
