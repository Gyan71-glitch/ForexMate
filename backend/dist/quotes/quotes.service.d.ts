import { PrismaService } from '../prisma/prisma.service';
import { GenerateQuoteDto } from './dto/quote.dto';
export declare class QuotesService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    generateQuote(userId: string, dto: GenerateQuoteDto): Promise<{
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
