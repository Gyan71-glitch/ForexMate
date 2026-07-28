import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto, CreateCurrencyDto } from './dto/master-data.dto';

@Injectable()
export class MasterDataService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetches the entire aggregated Master Data Layer.
   * This is called by the frontend on app initialization to populate Redux/Context.
   */
  async getAggregatedMasterData() {
    const [
      currencies,
      countries,
      branches,
      products,
      purposeCodes,
      taxes,
      fees,
      marginRules
    ] = await Promise.all([
      this.prisma.currency.findMany({ where: { isActive: true } }),
      this.prisma.country.findMany(),
      this.prisma.branch.findMany(),
      this.prisma.forexProduct.findMany({ where: { isActive: true } }),
      this.prisma.purposeCode.findMany({ include: { complianceRules: true } }),
      this.prisma.taxRule.findMany({ where: { isActive: true } }),
      this.prisma.feeStructure.findMany({ where: { isActive: true } }),
      this.prisma.exchangeRateMarginRule.findMany(),
    ]);

    return {
      currencies,
      countries,
      branches,
      products,
      purposeCodes,
      taxes,
      fees,
      marginRules
    };
  }

  async addBranch(dto: CreateBranchDto) {
    const existing = await this.prisma.branch.findUnique({
      where: { branchCode: dto.code }
    });

    if (existing) {
      throw new BadRequestException('Branch code already exists');
    }

    const defaultCompany = await this.prisma.company.findFirst();
    if (!defaultCompany) throw new BadRequestException('No company configured in system');

    return this.prisma.branch.create({
      data: {
        companyId: defaultCompany.id,
        branchName: dto.name,
        branchCode: dto.code,
        branchAddress: 'TBD',
        branchCity: 'TBD',
      }
    });
  }

  async addCurrency(dto: CreateCurrencyDto) {
    const existing = await this.prisma.currency.findUnique({
      where: { code: dto.code }
    });

    if (existing) {
      throw new BadRequestException('Currency code already exists');
    }

    return this.prisma.currency.create({
      data: {
        code: dto.code,
        name: dto.name,
        symbol: dto.code, // Provide a default symbol since schema requires it
        isActive: true,
      }
    });
  }
}
