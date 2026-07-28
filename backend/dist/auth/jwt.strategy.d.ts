import { Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(payload: {
        sub: string;
        sessionId: string;
    }): Promise<{
        id: string;
        email: string;
        fullName: string | null;
        mobile: string | null;
        role: string;
        roleId: number | null;
        sessionId: string;
        branchId: string | null;
    } | null>;
}
export {};
