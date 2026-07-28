import { Module } from '@nestjs/common';
import { ForexCardService } from './forex-card.service';
import { ForexCardController } from './forex-card.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ForexCardService],
  controllers: [ForexCardController],
  exports: [ForexCardService],
})
export class ForexCardModule {}
