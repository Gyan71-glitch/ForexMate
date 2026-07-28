import { Controller, Post, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { QuotesService } from './quotes.service';
import { GenerateQuoteDto } from './dto/quote.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Quotes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a locked quote for an order' })
  @ApiResponse({ status: 201, description: 'Quote generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async generate(@Body() dto: GenerateQuoteDto, @Request() req: any) {
    // Generate quote for the logged-in user
    return this.quotesService.generateQuote(req.user.id, dto);
  }
}
