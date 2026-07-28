"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const workflow_1 = require("../common/utils/workflow");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSummary(userId) {
        const profile = await this.prisma.customerProfile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Customer profile not found');
        }
        const profileId = profile.id;
        const [totalOrders, ordersByStatus, activeQuotes, lastOrder, recentOrders, lrsAggregation, activeForexCards] = await Promise.all([
            this.prisma.order.count({ where: { profileId } }),
            this.prisma.order.groupBy({
                by: ['status'],
                where: { profileId },
                _count: { _all: true }
            }),
            this.prisma.quote.count({
                where: {
                    profileId,
                    status: 'ACTIVE',
                    expiresAt: { gt: new Date() }
                }
            }),
            this.prisma.order.findFirst({
                where: { profileId },
                orderBy: { createdAt: 'desc' },
                select: { createdAt: true }
            }),
            this.prisma.order.findMany({
                where: { profileId },
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    branch: true,
                    quote: true,
                    tasks: true,
                    items: {
                        include: {
                            product: true,
                            currency: true
                        }
                    }
                }
            }),
            this.prisma.order.aggregate({
                where: {
                    profileId,
                    status: { notIn: ['CANCELLED', 'REJECTED'] }
                },
                _sum: { totalAmountInr: true }
            }),
            this.prisma.order.count({
                where: {
                    profileId,
                    status: 'COMPLETED',
                    items: {
                        some: {
                            product: { code: 'FOREX_CARD' }
                        }
                    }
                }
            })
        ]);
        const statusCounts = ordersByStatus.reduce((acc, curr) => {
            acc[curr.status] = curr._count._all;
            return acc;
        }, {});
        const pendingStatuses = ['PENDING', 'PAYMENT_PENDING', 'PROCESSING', 'PENDING_KYC', 'UNDER_REVIEW'];
        const pendingOrders = pendingStatuses.reduce((sum, status) => sum + (statusCounts[status] || 0), 0);
        const completedOrders = statusCounts['COMPLETED'] || 0;
        const mappedRecentOrders = recentOrders.map(o => ({
            ...o,
            status: (0, workflow_1.mapOrderStatus)(o)
        }));
        return {
            totalOrders,
            activeForexCards,
            lrsUsage: Number(lrsAggregation._sum.totalAmountInr || 0),
            kycStatus: profile.kycOverallStatus || 'PENDING',
            pendingOrders,
            completedOrders,
            activeQuotes,
            lastOrderDate: lastOrder?.createdAt || null,
            recentOrders: mappedRecentOrders
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map