import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';
import { PrismaService } from '../prisma/prisma.service';

import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AddBankDto, AddAddressDto } from './dto/user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
  ) {}

  // ─── Staff only: get all users ──────────────────────────────────────────
  @UseGuards(PermissionsGuard)
  @Permissions('kyc:review:all')
  @Get()
  @ApiOperation({ summary: 'List all users (Staff Only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  // ─── Get profile — user can only access their own, staff can access any ──
  @Get(':id')
  @ApiOperation({ summary: 'Get user profile and KYC status' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden access to profile' })
  async getProfile(@Param('id') id: string, @Request() req: any) {
    const requestedId = id;

    // Resolve user's dynamic permissions
    const userRole = await this.prisma.role.findUnique({
      where: { id: req.user.roleId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    const userPermissions = userRole?.permissions.map(
      (rp) => rp.permission.action,
    ) || [];

    const canReviewKyc = userPermissions.includes('kyc:review:all');
    const canManageUsers = userPermissions.includes('users:manage:all');
    const isOwnProfile = req.user.id === requestedId;

    if (!canReviewKyc && !canManageUsers && !isOwnProfile) {
      throw new ForbiddenException('You do not have permission to access this profile.');
    }

    return this.userService.getUserProfile(requestedId);
  }

  @Post(':id/profile') // Using POST or PUT, Next JS API usually expects typical REST, we will use PUT
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@Param('id') id: string, @Body() data: any, @Request() req: any) {
    if (req.user.id !== id) {
      throw new ForbiddenException('You do not have permission to update this profile.');
    }
    return this.userService.updateProfile(id, data);
  }
  
  @Put(':id/profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfilePut(@Param('id') id: string, @Body() data: any, @Request() req: any) {
    if (req.user.id !== id) {
      throw new ForbiddenException('You do not have permission to update this profile.');
    }
    return this.userService.updateProfile(id, data);
  }

  // ─── Banks ──────────────────────────────────────────────────────────────
  @Post(':id/banks')
  @ApiOperation({ summary: 'Add a bank account to a user profile' })
  @ApiResponse({ status: 201, description: 'Bank added successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  addBank(@Param('id') id: string, @Body() data: AddBankDto, @Request() req: any) {
    const requestedId = id;
    if (req.user.id !== requestedId) {
      throw new ForbiddenException('Unauthorized bank access.');
    }
    return this.userService.addBank(requestedId, data);
  }

  @Delete(':id/banks/:bankId')
  @ApiOperation({ summary: 'Delete a user bank account' })
  @ApiResponse({ status: 200, description: 'Bank deleted successfully' })
  deleteBank(
    @Param('id') id: string,
    @Param('bankId') bankId: string,
    @Request() req: any,
  ) {
    if (req.user.id !== id) {
      throw new ForbiddenException('Unauthorized bank access.');
    }
    return this.userService.deleteBank(bankId);
  }

  // ─── Addresses ──────────────────────────────────────────────────────────
  @Post(':id/addresses')
  @ApiOperation({ summary: 'Add an address to a user profile' })
  @ApiResponse({ status: 201, description: 'Address added successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  addAddress(
    @Param('id') id: string,
    @Body() data: AddAddressDto,
    @Request() req: any,
  ) {
    const requestedId = id;
    if (req.user.id !== requestedId) {
      throw new ForbiddenException('Unauthorized address access.');
    }
    return this.userService.addAddress(requestedId, data);
  }

  @Put(':id/addresses/:addressId')
  @ApiOperation({ summary: 'Update a user address' })
  @ApiResponse({ status: 200, description: 'Address updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  updateAddress(
    @Param('id') id: string,
    @Param('addressId') addressId: string,
    @Body() data: AddAddressDto,
    @Request() req: any,
  ) {
    if (req.user.id !== id) {
      throw new ForbiddenException('Unauthorized address access.');
    }
    return this.userService.updateAddress(addressId, data);
  }

  @Delete(':id/addresses/:addressId')
  @ApiOperation({ summary: 'Delete a user address' })
  @ApiResponse({ status: 200, description: 'Address deleted successfully' })
  deleteAddress(
    @Param('id') id: string,
    @Param('addressId') addressId: string,
    @Request() req: any,
  ) {
    if (req.user.id !== id) {
      throw new ForbiddenException('Unauthorized address access.');
    }
    return this.userService.deleteAddress(addressId);
  }

  // ─── KYC Documents ──────────────────────────────────────────────────────
  @UseGuards(PermissionsGuard)
  @Permissions('kyc:upload:own')
  @Post(':id/kyc')
  @ApiOperation({ summary: 'Upload KYC Document (Passport/Aadhaar)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'The KYC document image or PDF' },
        lockStatus: { type: 'string', example: 'PASSPORT', description: 'Document type (e.g., PASSPORT, AADHAAR)' },
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
  addKycDocument(
    @Param('id') id: string,
    @Body('lockStatus') lockStatus: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    const requestedId = id;
    if (req.user.id !== requestedId) {
      throw new ForbiddenException('Unauthorized document upload.');
    }

    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!lockStatus) {
      throw new BadRequestException('Document type (lockStatus) is required');
    }

    return this.userService.addKycDocument(requestedId, {
      lockStatus,
      imageOne: file.filename,
    });
  }
}
