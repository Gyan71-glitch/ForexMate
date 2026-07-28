import { QuotesService } from './quotes.service';
import { GenerateQuoteDto } from './dto/quote.dto';
export declare class QuotesController {
    private readonly quotesService;
    constructor(quotesService: QuotesService);
    generate(dto: GenerateQuoteDto, req: any): Promise<{
        quoteId: string;
        quoteNumber: string;
        currency: string;
        lockedInrRate: number;
        amountForeign: number;
        totalInr: number;
        expiresAt: Date;
        timeRemainingMinutes: number;
    }>;
}
