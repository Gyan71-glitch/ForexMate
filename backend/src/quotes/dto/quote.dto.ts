import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class GenerateQuoteDto {
  @ApiProperty({ example: 'USD', description: 'The currency code' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ example: 'CASH', description: 'Product type (CASH, CARD, REMITTANCE)' })
  @IsString()
  @IsNotEmpty()
  product: string;

  @ApiProperty({ example: 1000, description: 'Amount in foreign currency' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: 'branch-uuid', description: 'The branch ID where order will be fulfilled' })
  @IsString()
  @IsNotEmpty()
  branchId: string;

  @ApiProperty({ example: 'session-uuid', description: 'Transaction session id', required: false })
  @IsString()
  @IsOptional()
  sessionId?: string;
}
