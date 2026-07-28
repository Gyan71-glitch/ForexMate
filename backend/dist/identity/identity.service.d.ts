import { PrismaService } from '../prisma/prisma.service';
export declare class IdentityService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getRolesWithPermissions(): Promise<({
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
    })[]>;
}
