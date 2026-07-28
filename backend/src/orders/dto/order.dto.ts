import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 'quote-uuid', description: 'The generated quote ID' })
  @IsString()
  @IsNotEmpty()
  quoteId: string;

  @ApiProperty({ example: 'branch-uuid', description: 'The branch ID where order will be fulfilled' })
  @IsString()
  @IsNotEmpty()
  branchId: string;

  @ApiProperty({ example: 'STORE_PICKUP', description: 'Delivery method (STORE_PICKUP, HOME_DELIVERY)' })
  @IsString()
  @IsNotEmpty()
  deliveryMethod: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ example: 'PROCESSING', description: 'New order status' })
  @IsString()
  @IsNotEmpty()
  status: string;
}
