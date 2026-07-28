import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TransactionEngineService } from './transaction-engine.service';
import { TransactionEngineController } from './transaction-engine.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { QuotesModule } from '../quotes/quotes.module';

@Module({
  imports: [PrismaModule, AuthModule, QuotesModule],
  providers: [TransactionService, TransactionEngineService],
  controllers: [TransactionController, TransactionEngineController],
  exports: [TransactionService, TransactionEngineService],
})
export class TransactionModule {}
