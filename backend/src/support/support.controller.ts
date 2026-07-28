import { Controller, Get, Post, Body, Param, UseGuards, Put, Req } from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('support')
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get('categories')
  getCategories() {
    return this.supportService.getCategories();
  }

  @Get('my-tickets')
  getMyTickets(@Req() req: any) {
    return this.supportService.getUserTickets(req.user.id);
  }

  @Get('tickets/:id')
  getTicketDetails(@Param('id') id: string, @Req() req: any) {
    return this.supportService.getTicketDetails(id, req.user.id);
  }

  @Post('tickets')
  createTicket(@Req() req: any, @Body() data: any) {
    return this.supportService.createTicket(req.user.id, data);
  }

  @Post('tickets/:id/message')
  addMessage(@Param('id') id: string, @Req() req: any, @Body() data: { message: string, type?: string }) {
    return this.supportService.addMessage(id, req.user.id, data);
  }

  @Put('tickets/:id/status')
  updateStatus(@Param('id') id: string, @Req() req: any, @Body() data: { status: string }) {
    return this.supportService.updateStatus(id, req.user.id, data.status);
  }
}
