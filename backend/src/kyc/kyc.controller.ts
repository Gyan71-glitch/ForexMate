import { Controller, Get, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('KYC')
@Controller('kyc')
export class KycController {
  constructor(private readonly prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Get('requirements')
  @ApiOperation({ summary: 'Get dynamic KYC requirements for an order' })
  @ApiResponse({ status: 200, description: 'Required documents returned' })
  async getRequirements(@Query('orderId') orderId: string) {
    if (!orderId) {
      return { requiredDocuments: [] };
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { profile: true }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.productType === 'REMITTANCE') {
      const rd = await this.prisma.remittanceDetail.findFirst({
        where: { orderItem: { orderId } },
        include: { purpose: { include: { documentRequirements: true } } }
      });
      const dbDocs = rd?.purpose?.documentRequirements?.map((d: any) => d.docType) || [];
      if (dbDocs.length > 0) {
        return { requiredDocuments: dbDocs };
      }
      return {
        requiredDocuments: ['PAN', 'PASSPORT', 'VISA', 'ADMISSION_INVOICE', 'BANK_STATEMENT', 'FORM_A2']
      };
    }

    const purpose = order.profile?.travelPurpose || 'TOURISM';

    // Fetch dynamic KYC rules
    let rules = await this.prisma.kycVerificationRule.findMany({
      where: {
        isActive: true,
        required: true,
        OR: [
          { product: null },
          { product: order.productType }
        ],
        AND: [
          {
            OR: [
              { purpose: null },
              { purpose }
            ]
          }
        ]
      }
    });

    // Special bypass filter for CASH_SELL orders (only PAN and PASSPORT are required)
    if (order.productType === 'CASH_SELL') {
      rules = rules.filter(r => r.docType === 'PAN' || r.docType === 'PASSPORT');
    }

    return {
      requiredDocuments: rules.map(r => r.docType)
    };
  }
}
