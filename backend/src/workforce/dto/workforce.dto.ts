import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WorkforceLoginDto {
  @ApiProperty({ example: 'EMP-000001' })
  @IsString()
  @IsNotEmpty()
  employeeCode: string;

  @ApiProperty({ example: 'Temp@1234' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class WorkforceChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  newPassword: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}

export class SendCustomerOtpDto {
  @ApiProperty({ example: '+919876543210', description: 'Customer phone or email' })
  @IsString()
  @IsNotEmpty()
  recipient: string;
}

export class VerifyCustomerOtpDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  recipient: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class CompleteDeliveryDto {
  @ApiProperty({ description: 'Base64 encoded customer signature' })
  @IsString()
  @IsNotEmpty()
  signatureData: string;

  @ApiProperty({ description: 'Base64 encoded delivery photo' })
  @IsString()
  @IsNotEmpty()
  photoData: string;

  @ApiProperty({ description: 'Customer OTP verified' })
  @IsOptional()
  otpVerified?: boolean;
}

export class CompleteCashSellDto {
  @ApiProperty({ description: 'Confirm INR received from customer' })
  @IsOptional()
  notes?: string;
}

export class ReassignBranchDto {
  @ApiProperty({ description: 'Target branch ID inside the same city' })
  @IsString()
  @IsNotEmpty()
  targetBranchId: string;

  @ApiProperty({ description: 'Reason for reassigning order' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class AssignDeliveryPartnerDto {
  @ApiProperty({ description: 'Delivery partner employee ID or ID' })
  @IsString()
  @IsNotEmpty()
  deliveryPartnerId: string;
}

export class ManagerCompletePickupDto {
  @ApiProperty({ description: 'Verified customer OTP' })
  @IsString()
  @IsNotEmpty()
  otp: string;

  @ApiProperty({ description: 'Customer photo with received cash' })
  @IsString()
  @IsOptional()
  photoUrl?: string;

  @ApiProperty({ description: 'Manager handover remarks' })
  @IsString()
  @IsOptional()
  remarks?: string;
}

export class ReceiveBranchInventoryDto {
  @ApiProperty({ example: 'USD' })
  @IsString()
  @IsNotEmpty()
  currencyCode: string;

  @ApiProperty({ example: 5000 })
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: 'HQ_TREASURY_TRANSFER' })
  @IsString()
  @IsNotEmpty()
  sourceType: string;

  @ApiProperty({ example: 'TRE-2026-000234' })
  @IsString()
  @IsNotEmpty()
  referenceNumber: string;

  @ApiProperty({ example: '2026-07-22' })
  @IsOptional()
  @IsString()
  receivedDate?: string;

  @ApiProperty({ example: 'Stock replenishment for Indiranagar Branch Vault' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Base64/URL photo of Treasury Slip' })
  @IsOptional()
  @IsString()
  treasurySlipPhotoUrl?: string;

  @ApiProperty({ description: 'Base64/URL photo of Currency Bundle' })
  @IsOptional()
  @IsString()
  currencyBundlePhotoUrl?: string;

  @ApiProperty({ description: 'Base64/URL photo of Vault Shelf' })
  @IsOptional()
  @IsString()
  vaultShelfPhotoUrl?: string;
}
