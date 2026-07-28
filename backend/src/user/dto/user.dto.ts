import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddBankDto {
  @ApiProperty({ example: 'HDFC Bank' })
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  holderName: string;

  @ApiProperty({ example: '50100123456789' })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty({ example: 'HDFC0001234' })
  @IsString()
  @IsNotEmpty()
  ifscCode: string;

  @ApiProperty({ example: 'Connaught Place Branch', required: false })
  @IsString()
  @IsOptional()
  bankAddress?: string;
}

export class AddAddressDto {
  @ApiProperty({ example: '110001' })
  @IsString()
  @IsNotEmpty()
  pin: string;

  @ApiProperty({ example: 'New Delhi' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Delhi' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: '123 Main Street' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Near Metro Station', required: false })
  @IsString()
  @IsOptional()
  landmark?: string;

  @ApiProperty({ example: 'Home', required: false })
  @IsString()
  @IsOptional()
  addressType?: string;
}
