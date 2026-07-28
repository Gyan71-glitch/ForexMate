import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Protects any route that requires a valid JWT Bearer token.
 * Usage: @UseGuards(JwtAuthGuard) on a controller or method.
 * On success, attaches the validated user object to req.user.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
