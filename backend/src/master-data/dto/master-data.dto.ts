import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateBranchDto {
  @ApiProperty({ example: 'Delhi HQ', description: 'Branch Name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'IND-DL', description: 'Branch Code' })
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class CreateCurrencyDto {
  @ApiProperty({ example: 'USD', description: 'Currency Code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'US Dollar', description: 'Currency Name' })
  @IsString()
  @IsNotEmpty()
  name: string;

}
