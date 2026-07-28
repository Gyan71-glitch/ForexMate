import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { InvoiceService } from './invoice.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, InvoiceService]
})
export class DocumentsModule {}
