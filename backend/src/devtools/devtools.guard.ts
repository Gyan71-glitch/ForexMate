import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class DevToolsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const isDev = process.env.NODE_ENV !== 'production';
    const enabled = process.env.ENABLE_DEV_TOOLS === 'true';

    if (!isDev && !enabled) {
      throw new ForbiddenException('Developer tools are disabled in this environment.');
    }
    return true;
  }
}
