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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const serverless_1 = require("@neondatabase/serverless");
const adapter_neon_1 = require("@prisma/adapter-neon");
const ws_1 = __importDefault(require("ws"));
serverless_1.neonConfig.webSocketConstructor = ws_1.default;
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    logger = new common_1.Logger(PrismaService_1.name);
    constructor() {
        const connectionString = process.env.DATABASE_URL;
        const pool = new serverless_1.Pool({ connectionString });
        const adapter = new adapter_neon_1.PrismaNeon(pool);
        super({ adapter });
    }
    async onModuleInit() {
        let retries = 5;
        while (retries > 0) {
            try {
                await this.$connect();
                this.logger.log('✅ Database connection established (via Neon WebSocket over Port 443).');
                return;
            }
            catch (error) {
                retries--;
                this.logger.warn(`⚠️  Database connection failed (${5 - retries}/5): ${error.message}. Retrying in 3s...`);
                if (retries === 0) {
                    this.logger.error('❌ Could not connect to the database after 5 retries.');
                    throw error;
                }
                await new Promise((resolve) => setTimeout(resolve, 3000));
            }
        }
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
    async executeWithReconnect(operation, retries = 3) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                const isConnectionError = error.message?.includes("Can't reach database server") ||
                    error.message?.includes('Server has closed the connection') ||
                    error.message?.includes('connection reset') ||
                    error.message?.includes('socket hang up') ||
                    error.code === 'P1001' ||
                    error.code === 'P1002' ||
                    error.code === 'P1008';
                if (isConnectionError && attempt < retries) {
                    this.logger.warn(`🔄 DB connection error (attempt ${attempt}/${retries}), reconnecting... Error: ${error.message}`);
                    try {
                        await this.$disconnect();
                    }
                    catch { }
                    await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
                    try {
                        await this.$connect();
                    }
                    catch (reconnErr) {
                        this.logger.warn(`Reconnect attempt failed: ${reconnErr.message}`);
                    }
                    continue;
                }
                throw error;
            }
        }
        throw new Error('executeWithReconnect: exhausted all retries');
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map