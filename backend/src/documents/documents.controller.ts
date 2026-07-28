import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('invoices')
  getInvoices(@Request() req: any) {
    return this.documentsService.getInvoices(req.user.id);
  }

  @Get('invoices/:id')
  getInvoiceById(@Param('id') id: string, @Request() req: any) {
    return this.documentsService.getInvoiceById(id, req.user.id);
  }

  @Get('receipts')
  getReceipts(@Request() req: any) {
    return this.documentsService.getReceipts(req.user.id);
  }
}
