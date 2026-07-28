import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { InitializePaymentDto, ConfirmPaymentDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('providers')
  @ApiOperation({ summary: 'Get active payment providers' })
  @ApiResponse({ status: 200, description: 'Active payment providers retrieved successfully' })
  getProviders() {
    return this.paymentsService.getProviders();
  }

  @UseGuards(JwtAuthGuard)
  @Post('initialize')
  @ApiOperation({ summary: 'Initialize a new payment for an order' })
  @ApiResponse({ status: 201, description: 'Payment initialized successfully' })
  @ApiResponse({ status: 400, description: 'Order not found or invalid' })
  initialize(@Body() dto: InitializePaymentDto, @Request() req: any) {
    return this.paymentsService.initializePayment(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm a payment with the gateway transaction ID' })
  @ApiResponse({ status: 200, description: 'Payment confirmed successfully' })
  confirm(@Param('id') paymentId: string, @Body() dto: ConfirmPaymentDto) {
    return this.paymentsService.confirmPayment(paymentId, dto);
  }
}

