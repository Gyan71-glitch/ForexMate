import { Controller, Sse, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { SyncService } from './sync.service';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Real-time Sync')
@ApiBearerAuth()
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @UseGuards(JwtAuthGuard)
  @Sse('events')
  @ApiOperation({ summary: 'Real-time server-sent events stream for portal synchronization' })
  sendEvents(@Request() req: any): Observable<any> {
    const user = req.user;
    return this.syncService.getSyncStream().pipe(
      filter((msg: any) => {
        const payload = msg.data?.payload;
        if (!payload) return true;

        const eventUserId = payload.userId || payload.user?.id || payload.profile?.userId;
        const eventBranchId = payload.branchId || payload.order?.branchId;

        // 1. Customers only get events for their own profile/user ID
        if (user.role === 'CUSTOMER') {
          return eventUserId === user.id;
        }

        // 2. Branch staff/managers get events scoped to their branch
        if (user.role !== 'SUPER_ADMIN' && user.role !== 'OPERATIONS_ADMIN') {
          if (eventBranchId) {
            return eventBranchId === user.branchId;
          }
        }

        // 3. Super Admins and Operations Admins receive all events
        return true;
      })
    );
  }
}
