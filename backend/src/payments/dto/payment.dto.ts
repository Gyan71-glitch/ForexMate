import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class InitializePaymentDto {
  @ApiProperty({ example: 'order-uuid', description: 'The Order ID to pay for' })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ example: 'provider-uuid', description: 'The Payment Provider ID (e.g., Razorpay, BillDesk)' })
  @IsString()
  @IsNotEmpty()
  providerId: string;
}

export class ConfirmPaymentDto {
  @ApiProperty({ example: 'pay_ABC123', description: 'Transaction ID from the payment gateway' })
  @IsString()
  @IsNotEmpty()
  gatewayTxnId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  razorpayOrderId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  razorpaySignature?: string;
}

