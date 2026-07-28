import { Controller, Post, Get, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { DevToolsGuard } from './devtools.guard';
import { DevAuthService } from './services/dev-auth.service';
import { DevKycService, MockDocumentOptions } from './services/dev-kyc.service';
import { DevPaymentService } from './services/dev-payment.service';
import { DevSeedService } from './services/dev-seed.service';
import { DevRateService } from './services/dev-rate.service';
import { DevEventsService } from './services/dev-events.service';
import { DevSystemService } from './services/dev-system.service';
import { PrismaService } from '../prisma/prisma.service';
import { IntegrityCheckerService } from '../common/services/integrity-checker.service';

@UseGuards(DevToolsGuard)
@Controller('dev')
export class DevToolsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly devAuthService: DevAuthService,
    private readonly devKycService: DevKycService,
    private readonly devPaymentService: DevPaymentService,
    private readonly devSeedService: DevSeedService,
    private readonly devRateService: DevRateService,
    private readonly devEventsService: DevEventsService,
    private readonly devSystemService: DevSystemService,
    private readonly integrityService: IntegrityCheckerService,
  ) {}

  @Post('login/:role')
  async quickLogin(@Param('role') role: string) {
    const email = role === 'admin' ? 'admin@forexmate.com' : 'customer@forexmate.com';
    const roleOverride = role === 'admin' ? 'SUPER_ADMIN' : 'CUSTOMER';
    const result = await this.devAuthService.generateImpersonationToken(email, roleOverride);
    this.devEventsService.emit('DevQuickLogin', { role, email });
    return result;
  }

  @Post('impersonate')
  async impersonate(@Body() body: { email: string; role?: string }) {
    const result = await this.devAuthService.generateImpersonationToken(body.email, body.role);
    this.devEventsService.emit('DevImpersonation', { email: body.email, role: body.role });
    return result;
  }

  @Get('users')
  async getUsersList() {
    return this.devAuthService.getSessions();
  }

  @Post('kyc-preset')
  async applyKycPreset(@Body() body: { userId: string; preset: string }) {
    const result = await this.devKycService.applyKycPreset(body.userId, body.preset);
    this.devEventsService.emit('KycPresetApplied', { userId: body.userId, preset: body.preset });
    return result;
  }

  /**
   * Upload a mock KYC document directly without multipart file upload.
   * Used by dev/E2E test scripts to bypass the real upload endpoint.
   * Body: { userId, docType, documentNumber?, fullName?, dob?, confidence?, nameMatched?, expiryValid? }
   */
  @Post('kyc/upload-mock')
  async uploadMockKycDocument(@Body() body: { userId: string } & MockDocumentOptions) {
    const { userId, ...options } = body;
    const result = await this.devKycService.seedMockDocument(userId, options);
    this.devEventsService.emit('KycMockDocumentUploaded', { userId, docType: options.docType });
    return result;
  }

  @Post('mock-pay-order/:orderId')
  async mockPayOrder(@Param('orderId') orderId: string, @Body() body: { scenario: string }) {
    const result = await this.devPaymentService.mockPayOrder(orderId, body.scenario);
    this.devEventsService.emit('PaymentScenarioTriggered', { orderId, scenario: body.scenario });
    return result;
  }

  @Post('seed-preset')
  async seedPreset(@Body() body: { presetName: string }) {
    const result = await this.devSeedService.seedProfile(body.presetName);
    this.devEventsService.emit('DbSeedPresetApplied', { presetName: body.presetName });
    return result;
  }

  @Post('reset-database')
  async resetDatabase(@Body() body: { confirmation: string }) {
    const result = await this.devSeedService.factoryReset(body.confirmation);
    this.devEventsService.emit('DbFactoryReset', { confirmation: body.confirmation });
    return result;
  }

  @Post('rate-control')
  async setRateMode(@Body() body: { action: string }) {
    const result = await this.devRateService.setRateMode(body.action);
    this.devEventsService.emit('RatesOverrideChanged', { action: body.action });
    return result;
  }

  @Get('rates-mode')
  async getRatesMode() {
    return this.devRateService.getRateMode();
  }

  @Get('events')
  async getEvents(@Query('filter') filter?: string, @Query('search') search?: string) {
    return this.devEventsService.getEvents(filter, search);
  }

  @Post('events/replay/:id')
  async replayEvent(@Param('id') eventId: string) {
    const result = await this.devEventsService.replayEvent(eventId);
    this.devEventsService.emit('EventReplayed', { replayedEventId: eventId });
    return result;
  }

  @Post('events/clear')
  async clearEvents() {
    return this.devEventsService.clearEvents();
  }

  @Get('queues')
  async getQueues() {
    return this.devSystemService.getQueueData();
  }

  @Post('queues/action')
  async executeQueueAction(@Body() body: { action: string }) {
    const result = await this.devSystemService.executeQueueAction(body.action);
    this.devEventsService.emit('QueueActionExecuted', { action: body.action });
    return result;
  }

  @Get('performance')
  async getPerformance() {
    return this.devSystemService.getPerformanceMetrics();
  }

  @Get('health')
  async getHealth() {
    return this.devSystemService.getSystemHealth();
  }

  @Post('error-injection')
  async injectError(@Body() body: { flag: string; state: boolean }) {
    const result = await this.devSystemService.injectError(body.flag, body.state);
    this.devEventsService.emit('ErrorInjected', { flag: body.flag, state: body.state });
    return result;
  }

  @Get('error-injection')
  async getInjectedErrors() {
    return this.devSystemService.getInjectedErrors();
  }

  @Post('feature-flag')
  async setFeatureFlag(@Body() body: { flag: string; state: boolean }) {
    const result = await this.devSystemService.setFeatureFlag(body.flag, body.state);
    this.devEventsService.emit('FeatureFlagOverridden', { flag: body.flag, state: body.state });
    return result;
  }

  @Get('feature-flags')
  async getFeatureFlags() {
    return this.devSystemService.getFeatureFlags();
  }

  @Post('mock-time')
  async setMockTime(@Body() body: { date: string | null }) {
    const result = await this.devSystemService.setMockTime(body.date);
    this.devEventsService.emit('MockTimeOverridden', { date: body.date });
    return result;
  }

  @Get('mock-time')
  async getMockTime() {
    return this.devSystemService.getMockTime();
  }

  @Get('table/:tableName')
  async getTableRows(@Param('tableName') tableName: string) {
    return this.devSystemService.getTableRows(tableName);
  }

  @Get('session/:id/order')
  async getSessionOrder(@Param('id') sessionId: string) {
    const order = await this.prisma.order.findFirst({
      where: { sessionId },
      include: { payments: true }
    });
    return order;
  }

  @Post('log-action')
  async logAction(@Body() body: { action: string; email?: string }) {
    await this.prisma.auditLog.create({
      data: {
        action: 'DEV_ACTION',
        newData: { description: `DevTools Action: ${body.action}`, actor: body.email || 'Anonymous Dev' },
        ipAddress: '127.0.0.1'
      }
    });
    return { success: true };
  }

  @Get('integrity-check')
  async checkIntegrity() {
    return this.integrityService.runIntegrityChecks();
  }
}
