import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsNumber, IsOptional } from 'class-validator';

export class CreateJournalEntryDto {
  @ApiProperty({ example: 'ledger-uuid', description: 'General Ledger ID' })
  @IsString()
  @IsNotEmpty()
  ledgerId: string;

  @ApiProperty({ example: 'CREDIT', description: 'Entry type (DEBIT or CREDIT)' })
  @IsEnum(['DEBIT', 'CREDIT'])
  @IsNotEmpty()
  type: 'DEBIT' | 'CREDIT';

  @ApiProperty({ example: 5000.0, description: 'Amount' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: 'Customer Payment Received', description: 'Description' })
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class CreateLedgerDto {
  @ApiProperty({ example: 'Operating Account', description: 'Name of the ledger account' })
  @IsString()
  @IsNotEmpty()
  accountName: string;
}
