import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ComplianceService } from './compliance.service';
import { ReviewKycDto } from './dto/compliance.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Compliance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('compliance')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  // ─── Customer Self-Service Endpoints ─────────────────────────────────────

  @Get('rules')
  @ApiOperation({ summary: 'Get dynamic KYC rules based on product and purpose' })
  getKycRules(@Request() req: any) {
    const { product, purpose } = req.query;
    return this.complianceService.getKycRules(product, purpose);
  }

  @Get('kyc/documents')
  @ApiOperation({ summary: 'Get all KYC documents and status for the logged-in user' })
  getMyKycDocuments(@Request() req: any) {
    return this.complianceService.getMyKycDocuments(req.user.id);
  }

  @Get('kyc/eligibility')
  @ApiOperation({ summary: 'Evaluate customer KYC eligibility for Cash Buy' })
  getKycEligibility(@Request() req: any) {
    return this.complianceService.evaluateCashBuyKycEligibility(req.user.id);
  }

  @Post('kyc/documents')
  @ApiOperation({ summary: 'Upload a new KYC document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'The KYC document image (PNG/JPG)' },
        docType: { type: 'string', example: 'PAN', description: 'Document type (e.g., PAN, PASSPORT)' },
        knownDocNumber: { type: 'string', example: 'CQDPV9729A', description: 'Optional: document number already known (helps OCR fallback)' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  uploadKycDocument(
    @Request() req: any,
    @Body('docType') docType: string,
    @Body('knownDocNumber') knownDocNumber: string,
    @Body('knownDob') knownDob: string,
    @Body('knownName') knownName: string,
    @Body('knownExpiryDate') knownExpiryDate: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    if (!docType) {
      throw new BadRequestException('docType is required');
    }
    return this.complianceService.uploadKycDocument(
      req.user.id, docType, file.path,
      undefined,
      knownDocNumber || undefined,
      knownDob || undefined,
      knownName || undefined,
      knownExpiryDate || undefined,
    );
  }

  @Delete('kyc/documents/:id')
  @ApiOperation({ summary: 'Delete a pending KYC document before submission' })
  deleteKycDocument(@Param('id') id: string, @Request() req: any) {
    return this.complianceService.deleteKycDocument(req.user.id, id);
  }

  @Post('kyc/submit')
  @ApiOperation({ summary: 'Submit all pending documents for compliance review' })
  submitKyc(@Request() req: any) {
    return this.complianceService.submitKyc(req.user.id);
  }

  // ─── Staff / Admin Endpoints ──────────────────────────────────────────────

  @UseGuards(PermissionsGuard)
  @Permissions('kyc:review:all')
  @Get('kyc-pending')
  @ApiOperation({ summary: 'List all pending KYC documents (Staff Only)' })
  @ApiResponse({ status: 200, description: 'Pending KYC documents retrieved' })
  getPendingKyc() {
    return this.complianceService.getPendingKyc();
  }

  @UseGuards(PermissionsGuard)
  @Permissions('kyc:review:all')
  @Post('kyc/:id/review')
  @ApiOperation({ summary: 'Approve or Reject a KYC document (Staff Only)' })
  @ApiResponse({ status: 200, description: 'KYC reviewed successfully' })
  reviewKyc(@Param('id') docId: string, @Body() dto: ReviewKycDto, @Request() req: any) {
    return this.complianceService.reviewKyc(docId, dto, req.user.id);
  }
}
