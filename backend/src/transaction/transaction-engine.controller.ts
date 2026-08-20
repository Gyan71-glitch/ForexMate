import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TransactionEngineService } from './transaction-engine.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Transaction Engine (V2)')
@Controller('transaction-engine')
export class TransactionEngineController {
  constructor(private readonly engineService: TransactionEngineService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Post('session')
  @ApiOperation({ summary: 'Initialize a new transaction session (Draft)' })
  @ApiResponse({ status: 201, description: 'Session created' })
  createSession(@Request() req: any) {
    // Optionally take user ID if authenticated, else anonymous session
    const userId = req.user?.id || null;
    return this.engineService.createSession(userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Put('session/:id/draft')
  @ApiOperation({ summary: 'Update Draft State' })
  @ApiResponse({ status: 200, description: 'Draft updated' })
  updateDraft(@Request() req: any, @Param('id') id: string, @Body() draftState: any) {
    return this.engineService.updateDraftState(id, draftState, req.user?.id);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('session/:id/workflow')
  @ApiOperation({ summary: 'Get next allowed steps from Workflow Engine' })
  @ApiResponse({ status: 200, description: 'Workflow state returned' })
  getWorkflowNextStep(@Request() req: any, @Param('id') id: string) {
    return this.engineService.getWorkflowNextStep(id, req.user?.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('session/:id/quote')
  @ApiOperation({ summary: 'Generate and lock a quote for this session' })
  generateAndLockQuote(
    @Param('id') id: string,
    @Body() dto: { currency: string; product: string; amount: number; branchId: string }
  ) {
    return this.engineService.generateAndLockQuote(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('session/:id/checkout')
  @ApiOperation({ summary: 'Checkout and convert session to order (Idempotent)' })
  checkout(
    @Param('id') id: string,
    @Body() body: { idempotencyKey: string }
  ) {
    return this.engineService.checkout(id, body.idempotencyKey);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('session/:id/order')
  @ApiOperation({ summary: 'Get order associated with session' })
  getSessionOrder(@Param('id') sessionId: string) {
    return this.engineService.getSessionOrder(sessionId);
  }
}
