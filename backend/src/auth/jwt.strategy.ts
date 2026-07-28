import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => {
          return req?.query?.token || null;
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-jwt-key',

    });
  }

  /**
   * Called by Passport after the token is verified.
   * The payload here is the decoded JWT (what we put in on sign).
   * We attach the full user object to the request.
   */
  async validate(payload: { sub: string; sessionId: string }) {
    return this.authService.validatePayload(payload);
  }
}
