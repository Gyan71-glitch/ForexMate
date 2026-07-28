import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('In-App Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get unread/recent in-app notifications for the logged-in user' })
  async getNotifications(@Request() req: any) {
    return this.notificationService.getInAppNotifications(req.user.id);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark a specific notification as read' })
  async readNotification(@Param('id') id: string, @Request() req: any) {
    return this.notificationService.markAsRead(id, req.user.id);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all unread notifications as read' })
  async readAllNotifications(@Request() req: any) {
    return this.notificationService.markAllAsRead(req.user.id);
  }
}
