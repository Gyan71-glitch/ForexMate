import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export class ReviewKycDto {
  @ApiProperty({ example: 'APPROVED', description: 'The review outcome (APPROVED or REJECTED)' })
  @IsEnum(['APPROVED', 'REJECTED'])
  @IsNotEmpty()
  status: string;

  @ApiProperty({ example: 'Document verified against government DB.', required: false })
  @IsString()
  @IsOptional()
  remarks?: string;
}
