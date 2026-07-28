import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Parses the JWT if present, but does not throw an error if missing or invalid.
 * Used for routes that can act both anonymously and authenticated.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    // Return user if valid, otherwise just return null instead of throwing
    return user || null;
  }
}
