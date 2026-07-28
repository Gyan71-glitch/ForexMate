import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsNumber } from 'class-validator';

export class InterbankTradeDto {
  @ApiProperty({ example: 'USD', description: 'Currency code' })
  @IsString()
  @IsNotEmpty()
  currencyCode: string;

  @ApiProperty({ example: 'BUY', description: 'Trade type (BUY or SELL)' })
  @IsEnum(['BUY', 'SELL'])
  @IsNotEmpty()
  tradeType: 'BUY' | 'SELL';

  @ApiProperty({ example: 10000, description: 'Amount traded' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: 83.50, description: 'Exchange rate' })
  @IsNumber()
  @IsNotEmpty()
  rate: number;

  @ApiProperty({ example: 'HDFC Bank', description: 'Counterparty bank' })
  @IsString()
  @IsNotEmpty()
  bankName: string;
}
