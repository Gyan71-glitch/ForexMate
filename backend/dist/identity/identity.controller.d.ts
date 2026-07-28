import { IdentityService } from './identity.service';
export declare class IdentityController {
    private readonly identityService;
    constructor(identityService: IdentityService);
    getRoles(): Promise<{
        success: boolean;
        data: ({
            permissions: ({
                permission: {
                    id: number;
                    action: string;
                };
            } & {
                roleId: number;
                permissionId: number;
            })[];
        } & {
            id: number;
            name: string;
        })[];
    }>;
}
