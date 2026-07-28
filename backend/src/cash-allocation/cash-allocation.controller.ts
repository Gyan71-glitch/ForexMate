import { Controller, Post, Get, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CashAllocationService } from './cash-allocation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Cash Allocation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ops/cash-allocation')
export class CashAllocationController {
  constructor(private readonly cashAllocationService: CashAllocationService) {}

  @Post()
  @ApiOperation({ summary: 'Submit denomination allocation for customer cash buy order' })
  @ApiResponse({ status: 201, description: 'Cash allocation locked and reserved successfully' })
  @ApiResponse({ status: 400, description: 'Incorrect allocation amounts or insufficient note counts' })
  create(
    @Body() body: { orderId: string; items: { denomination: number; quantity: number }[] },
    @Request() req: any,
  ) {
    const userId = req.user.id;
    const role = req.user.role;
    return this.cashAllocationService.createAllocation(userId, role, body.orderId, body.items);
  }

  @Get(':orderId')
  @ApiOperation({ summary: 'Get cash allocation details for an order' })
  @ApiResponse({ status: 200, description: 'Cash allocation details retrieved' })
  findOne(@Param('orderId') orderId: string) {
    return this.cashAllocationService.getAllocation(orderId);
  }
}
