"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevSeedService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const SALT_ROUNDS = 10;
let DevSeedService = class DevSeedService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async factoryReset(confirmation) {
        if (confirmation !== 'RESET') {
            throw new common_1.BadRequestException('Confirmation key mismatch. Type RESET to confirm database wipe.');
        }
        let backupFile = '';
        try {
            backupFile = await this.backupDatabase();
        }
        catch (err) {
            console.error('Backup failed:', err);
        }
        await this.clearDatabase();
        await this.seedBaseData();
        const health = await this.runHealthChecks();
        if (!health.healthy) {
            throw new common_1.InternalServerErrorException({
                message: 'Factory Reset failed: Post-seed database integrity check failed.',
                errors: health.errors,
            });
        }
        return {
            success: true,
            message: 'Factory reset completed and database integrity verified successfully.',
            backupFile,
            health,
        };
    }
    async seedProfile(profileName) {
        let customerCount = 0;
        let orderCount = 0;
        let cardCount = 0;
        let remittanceCount = 0;
        let ticketCount = 0;
        let notificationCount = 0;
        switch (profileName) {
            case 'EMPTY':
                await this.clearDatabase();
                await this.seedBaseData();
                return { success: true, profile: profileName, seeded: {} };
            case 'SMALL_STARTUP':
                customerCount = 5;
                orderCount = 10;
                cardCount = 2;
                remittanceCount = 1;
                ticketCount = 2;
                notificationCount = 10;
                break;
            case 'MEDIUM_BUSINESS':
                customerCount = 20;
                orderCount = 50;
                cardCount = 15;
                remittanceCount = 10;
                ticketCount = 10;
                notificationCount = 50;
                break;
            case 'LARGE_ENTERPRISE':
                customerCount = 100;
                orderCount = 200;
                cardCount = 50;
                remittanceCount = 30;
                ticketCount = 30;
                notificationCount = 200;
                break;
            case 'STRESS_TEST':
                customerCount = 500;
                orderCount = 2000;
                cardCount = 500;
                remittanceCount = 100;
                ticketCount = 50;
                notificationCount = 500;
                break;
            case 'DEMO_DAY':
                customerCount = 200;
                orderCount = 500;
                cardCount = 100;
                remittanceCount = 50;
                ticketCount = 80;
                notificationCount = 1000;
                break;
            case 'CONFERENCE_DEMO':
                customerCount = 50;
                orderCount = 150;
                cardCount = 30;
                remittanceCount = 15;
                ticketCount = 20;
                notificationCount = 100;
                break;
            default:
                throw new common_1.BadRequestException(`Unknown seed profile: ${profileName}`);
        }
        const seeded = await this.generateMockEntities(customerCount, orderCount, cardCount, remittanceCount, ticketCount, notificationCount);
        return {
            success: true,
            profile: profileName,
            seeded,
        };
    }
    async runHealthChecks() {
        const errors = [];
        const roles = await this.prisma.role.findMany({});
        if (roles.length < 8)
            errors.push(`Expected at least 8 roles, found ${roles.length}`);
        const branches = await this.prisma.branch.findMany({});
        if (branches.length === 0)
            errors.push('No branches seeded.');
        const currencies = await this.prisma.currency.findMany({});
        if (currencies.length === 0)
            errors.push('No currencies seeded.');
        const vaults = await this.prisma.branchVault.findMany({});
        if (vaults.length === 0)
            errors.push('No note vaults seeded.');
        const admin = await this.prisma.user.findUnique({ where: { email: 'admin@forexmate.com' } });
        if (!admin)
            errors.push('Default admin user missing.');
        const customer = await this.prisma.user.findUnique({ where: { email: 'customer@forexmate.com' } });
        if (!customer)
            errors.push('Default customer user missing.');
        const ticketCats = await this.prisma.ticketCategory.findMany({});
        if (ticketCats.length === 0)
            errors.push('No support ticket categories seeded.');
        return {
            healthy: errors.length === 0,
            errors,
            counts: {
                roles: roles.length,
                branches: branches.length,
                currencies: currencies.length,
                vaults: vaults.length,
                ticketCategories: ticketCats.length,
            },
        };
    }
    async backupDatabase() {
        const tables = [
            'user',
            'customerProfile',
            'order',
            'payment',
            'supportTicket',
            'forexCard',
            'branch',
        ];
        const backupData = {};
        for (const t of tables) {
            try {
                backupData[t] = await this.prisma[t].findMany({});
            }
            catch (err) {
                backupData[t] = [];
            }
        }
        const scratchDir = path.join('/Users/gyanvaibhav/Desktop/forex/Forexmate-v2', 'scratch');
        if (!fs.existsSync(scratchDir)) {
            fs.mkdirSync(scratchDir, { recursive: true });
        }
        const backupPath = path.join(scratchDir, `backup_${Date.now()}.json`);
        fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
        return backupPath;
    }
    async clearDatabase() {
        await this.prisma.$executeRawUnsafe(`
      TRUNCATE TABLE
        "BranchTask",
        "InventoryReservation",
        "InventoryMovement",
        "OrderStatusHistory",
        "InvoiceReceipt",
        "InvoiceItem",
        "Invoice",
        "OrderDelivery",
        "Refund",
        "PaymentAttempt",
        "Payment",
        "PurposeDocumentRequirement",
        "RemittanceDetail",
        "TransferFeeConfiguration",
        "CountryConfiguration",
        "TransferPurpose",
        "Beneficiary",
        "OrderItem",
        "CashAllocationItem",
        "CashAllocation",
        "Order",
        "Quote",
        "TransactionSession",
        "KycReview",
        "DocumentOcrData",
        "KycDocument",
        "KycCase",
        "ComplianceAlert",
        "TicketAttachment",
        "TicketMessage",
        "TicketActivity",
        "TicketRating",
        "SupportTicket",
        "TicketCategory",
        "CardTransaction",
        "CardWallet",
        "ForexCard",
        "DailyVaultReconciliation",
        "InventoryTransfer",
        "VaultTransaction",
        "VaultDenomination",
        "BranchVault",
        "BranchInventory",
        "PickupHandover",
        "DeliveryJob",
        "LrsLimitTracker",
        "CustomerBank",
        "CustomerAddress",
        "CustomerProfile",
        "AuditLog",
        "NotificationQueue",
        "InAppNotification",
        "GeneralLedger",
        "JournalEntry",
        "Expense",
        "WorkflowHistory",
        "WorkflowExecution",
        "WorkflowStep",
        "Workflow",
        "ApprovalStep",
        "Approval",
        "UserSession",
        "UserDevice",
        "TrustedDevice",
        "LoginAttempt",
        "OtpVerification",
        "PasswordResetToken",
        "EmailVerificationToken",
        "PhoneVerificationToken",
        "BranchStaff",
        "Cashier",
        "DeliveryPartner",
        "User"
      RESTART IDENTITY CASCADE
    `);
    }
    async seedBaseData() {
        const ROLES = ['CUSTOMER', 'AGENT', 'STAFF', 'BRANCH_MANAGER', 'COMPLIANCE', 'DEALER', 'ACCOUNTANT', 'SUPER_ADMIN'];
        const dbRoles = {};
        for (const name of ROLES) {
            let r = await this.prisma.role.findUnique({ where: { name } });
            if (!r) {
                r = await this.prisma.role.create({ data: { name } });
            }
            dbRoles[name] = r;
        }
        let company = await this.prisma.company.findFirst();
        if (!company) {
            company = await this.prisma.company.create({
                data: {
                    name: 'Forexmate Global Services Pvt Ltd',
                    gst: '07AAAAA1111A1Z1',
                    cin: 'U11111DL2026PTC111111',
                    address: '101-104, Connaught Place, New Delhi, 110001',
                    licenseNumber: 'RBI-FFMC-2026-0001',
                    email: 'hq@forexmate.com',
                    phone: '+911145678900',
                },
            });
        }
        const branches = [
            { code: 'DEL-01', name: 'Delhi CP Main Vault Branch', city: 'Delhi', address: 'Connaught Place' },
            { code: 'BOM-01', name: 'Mumbai BKC Corporate Branch', city: 'Mumbai', address: 'Bandra Kurla Complex' },
            { code: 'BLR-01', name: 'Bengaluru Indiranagar Hub', city: 'Bengaluru', address: 'Indiranagar' },
        ];
        const dbBranches = [];
        for (const b of branches) {
            let br = await this.prisma.branch.findUnique({ where: { branchCode: b.code } });
            if (!br) {
                br = await this.prisma.branch.create({
                    data: {
                        companyId: company.id,
                        branchCode: b.code,
                        branchName: b.name,
                        branchAddress: b.address,
                        branchCity: b.city,
                    },
                });
            }
            dbBranches.push(br);
        }
        const delhiBranch = dbBranches[0];
        const cashiersToSeed = [
            { name: 'Rahul Sharma', employeeCode: 'CASHIER-001' },
            { name: 'Mohit Kumar', employeeCode: 'CASHIER-002' },
        ];
        for (const c of cashiersToSeed) {
            let cashier = await this.prisma.cashier.findUnique({ where: { employeeCode: c.employeeCode } });
            if (!cashier) {
                await this.prisma.cashier.create({
                    data: {
                        name: c.name,
                        employeeCode: c.employeeCode,
                        branchId: delhiBranch.id,
                    },
                });
            }
        }
        const deliveryPartnersToSeed = [
            { name: 'Rohit Singh', employeeCode: 'DEL-PARTNER-001' },
            { name: 'Aman Verma', employeeCode: 'DEL-PARTNER-002' },
            { name: 'Pawan Gupta', employeeCode: 'DEL-PARTNER-003' },
            { name: 'Sandeep Yadav', employeeCode: 'DEL-PARTNER-004' },
            { name: 'Rakesh Kumar', employeeCode: 'DEL-PARTNER-005' },
        ];
        for (const dp of deliveryPartnersToSeed) {
            let partner = await this.prisma.deliveryPartner.findUnique({ where: { employeeCode: dp.employeeCode } });
            if (!partner) {
                await this.prisma.deliveryPartner.create({
                    data: {
                        name: dp.name,
                        employeeCode: dp.employeeCode,
                        branchId: delhiBranch.id,
                    },
                });
            }
        }
        const currencies = [
            { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimals: 2 },
            { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2 },
            { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
            { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2 },
            { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimals: 2 },
            { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimals: 2 },
        ];
        const dbCurrencies = {};
        for (const c of currencies) {
            let curr = await this.prisma.currency.findUnique({ where: { code: c.code } });
            if (!curr) {
                curr = await this.prisma.currency.create({ data: c });
            }
            dbCurrencies[c.code] = curr;
        }
        const products = [
            { name: 'Foreign Currency Cash', code: 'CASH' },
            { name: 'Multi-Currency Forex Card', code: 'FOREX_CARD' },
            { name: 'Outward Remittance Wire', code: 'REMITTANCE' },
            { name: 'Foreign Currency Cash Sell', code: 'CASH_SELL' },
        ];
        for (const p of products) {
            let prod = await this.prisma.forexProduct.findUnique({ where: { code: p.code } });
            if (!prod) {
                await this.prisma.forexProduct.create({ data: p });
            }
        }
        const notes = [100, 50, 20, 10, 5, 2, 1];
        const mainBranch = dbBranches[0];
        for (const code of ['USD', 'EUR', 'GBP']) {
            const curr = dbCurrencies[code];
            let vault = await this.prisma.branchVault.findFirst({
                where: { branchId: mainBranch.id, currencyId: curr.id }
            });
            if (!vault) {
                vault = await this.prisma.branchVault.create({
                    data: { branchId: mainBranch.id, currencyId: curr.id, totalAmount: 50000.0 },
                });
            }
            for (const n of notes) {
                let denom = await this.prisma.vaultDenomination.findFirst({
                    where: { vaultId: vault.id, denomination: n }
                });
                if (!denom) {
                    await this.prisma.vaultDenomination.create({
                        data: { vaultId: vault.id, denomination: n, noteCount: 100 },
                    });
                }
            }
        }
        const categories = [
            { name: 'Forex Currency', icon: 'coins', defaultPriority: client_1.TicketPriority.MEDIUM, department: client_1.TicketDepartment.SUPPORT },
            { name: 'Forex Card', icon: 'credit-card', defaultPriority: client_1.TicketPriority.MEDIUM, department: client_1.TicketDepartment.SUPPORT },
            { name: 'Card Reload', icon: 'refresh-cw', defaultPriority: client_1.TicketPriority.HIGH, department: client_1.TicketDepartment.SUPPORT },
            { name: 'Card Refund', icon: 'undo', defaultPriority: client_1.TicketPriority.HIGH, department: client_1.TicketDepartment.FINANCE },
            { name: 'Remittance', icon: 'send', defaultPriority: client_1.TicketPriority.HIGH, department: client_1.TicketDepartment.TREASURY },
            { name: 'Order Issue', icon: 'alert-circle', defaultPriority: client_1.TicketPriority.HIGH, department: client_1.TicketDepartment.SUPPORT },
            { name: 'Payment Issue', icon: 'alert-triangle', defaultPriority: client_1.TicketPriority.CRITICAL, department: client_1.TicketDepartment.FINANCE },
            { name: 'KYC Verification', icon: 'file-check', defaultPriority: client_1.TicketPriority.MEDIUM, department: client_1.TicketDepartment.COMPLIANCE },
            { name: 'Document Verification', icon: 'file-search', defaultPriority: client_1.TicketPriority.MEDIUM, department: client_1.TicketDepartment.COMPLIANCE },
            { name: 'Branch Support', icon: 'building', defaultPriority: client_1.TicketPriority.LOW, department: client_1.TicketDepartment.SUPPORT },
            { name: 'Corporate Forex', icon: 'briefcase', defaultPriority: client_1.TicketPriority.HIGH, department: client_1.TicketDepartment.DEALER },
            { name: 'Complaint', icon: 'frown', defaultPriority: client_1.TicketPriority.HIGH, department: client_1.TicketDepartment.SUPPORT },
            { name: 'Technical Issue', icon: 'monitor-off', defaultPriority: client_1.TicketPriority.MEDIUM, department: client_1.TicketDepartment.IT },
            { name: 'General Query', icon: 'help-circle', defaultPriority: client_1.TicketPriority.LOW, department: client_1.TicketDepartment.SUPPORT },
            { name: 'Feedback', icon: 'message-square', defaultPriority: client_1.TicketPriority.LOW, department: client_1.TicketDepartment.SUPPORT }
        ];
        const existingCategoryCount = await this.prisma.ticketCategory.count();
        if (existingCategoryCount === 0) {
            await this.prisma.ticketCategory.createMany({ data: categories });
        }
        const passHash = await bcrypt.hash('admin123', SALT_ROUNDS);
        await this.prisma.user.upsert({
            where: { email: 'admin@forexmate.com' },
            update: { roleId: dbRoles['SUPER_ADMIN'].id },
            create: {
                email: 'admin@forexmate.com',
                password: passHash,
                fullName: 'System Administrator',
                roleId: dbRoles['SUPER_ADMIN'].id,
                isEmailVerified: true,
            },
        });
        const cust = await this.prisma.user.upsert({
            where: { email: 'customer@forexmate.com' },
            update: { roleId: dbRoles['CUSTOMER'].id },
            create: {
                email: 'customer@forexmate.com',
                password: passHash,
                fullName: 'John Doe',
                roleId: dbRoles['CUSTOMER'].id,
                isEmailVerified: true,
            },
        });
        await this.prisma.customerProfile.upsert({
            where: { userId: cust.id },
            update: {},
            create: { userId: cust.id, riskCategory: 'LOW' },
        });
        const teller = await this.prisma.user.upsert({
            where: { email: 'teller@forexmate.com' },
            update: { roleId: dbRoles['STAFF'].id },
            create: {
                email: 'teller@forexmate.com',
                password: passHash,
                fullName: 'CP Branch Teller',
                roleId: dbRoles['STAFF'].id,
                isEmailVerified: true,
            },
        });
        await this.prisma.branchStaff.upsert({
            where: { userId: teller.id },
            update: { branchId: mainBranch.id },
            create: {
                userId: teller.id,
                branchId: mainBranch.id,
                designation: 'TELLER',
            },
        });
        const managerHash = await bcrypt.hash('Manager@123!', SALT_ROUNDS);
        const manager = await this.prisma.user.upsert({
            where: { email: 'manager@forexmate.com' },
            update: { roleId: dbRoles['BRANCH_MANAGER'].id },
            create: {
                email: 'manager@forexmate.com',
                password: managerHash,
                fullName: 'Branch Manager',
                roleId: dbRoles['BRANCH_MANAGER'].id,
                isEmailVerified: true,
            },
        });
        await this.prisma.branchStaff.upsert({
            where: { userId: manager.id },
            update: { branchId: mainBranch.id },
            create: {
                userId: manager.id,
                branchId: mainBranch.id,
                designation: 'BRANCH_MANAGER',
            },
        });
        await this.prisma.user.upsert({
            where: { email: 'dealer@forexmate.com' },
            update: { roleId: dbRoles['DEALER'].id },
            create: {
                email: 'dealer@forexmate.com',
                password: passHash,
                fullName: 'Treasury Dealer',
                roleId: dbRoles['DEALER'].id,
                isEmailVerified: true,
            },
        });
        await this.prisma.user.upsert({
            where: { email: 'compliance@forexmate.com' },
            update: { roleId: dbRoles['COMPLIANCE'].id },
            create: {
                email: 'compliance@forexmate.com',
                password: passHash,
                fullName: 'Compliance Officer',
                roleId: dbRoles['COMPLIANCE'].id,
                isEmailVerified: true,
            },
        });
        const purposes = [
            { code: 'EDUCATION', name: 'Overseas Education', description: 'Pay university tuition fees directly or send living expenses to student accounts.', tcsRate: 0.5, tcsThreshold: 700000, tcsRateAbove: 0.5, tcsRateBelow: 0.0, docs: ['PAN', 'PASSPORT', 'UNIVERSITY_OFFER', 'FEE_INVOICE', 'VISA'] },
            { code: 'MEDICAL', name: 'Medical Treatment', description: 'Transfer money to foreign hospitals or for patient\'s living expenses.', tcsRate: 5.0, tcsThreshold: 700000, tcsRateAbove: 5.0, tcsRateBelow: 0.0, docs: ['PAN', 'PASSPORT', 'HOSPITAL_ESTIMATE', 'DOCTOR_LETTER'] },
            { code: 'GIFT', name: 'Gift / Donation', description: 'Send monetary gifts to friends or relatives abroad.', tcsRate: 5.0, tcsThreshold: 700000, tcsRateAbove: 20.0, tcsRateBelow: 5.0, docs: ['PAN', 'PASSPORT'] },
            { code: 'FAMILY', name: 'Family Maintenance', description: 'Send funds to close relatives staying abroad for daily living expenses.', tcsRate: 5.0, tcsThreshold: 700000, tcsRateAbove: 20.0, tcsRateBelow: 5.0, docs: ['PAN', 'PASSPORT'] },
            { code: 'TRAVEL', name: 'Travel Abroad', description: 'Remit funds to foreign travel agents or hotels for personal/business travel.', tcsRate: 5.0, tcsThreshold: 700000, tcsRateAbove: 20.0, tcsRateBelow: 5.0, docs: ['PAN', 'PASSPORT'] },
            { code: 'OTHER', name: 'Other Permissible Purposes', description: 'Any other remittance purpose permitted under LRS.', tcsRate: 5.0, tcsThreshold: 700000, tcsRateAbove: 20.0, tcsRateBelow: 5.0, docs: ['PAN', 'PASSPORT'] }
        ];
        for (const p of purposes) {
            const tp = await this.prisma.transferPurpose.upsert({
                where: { code: p.code },
                update: {
                    name: p.name,
                    description: p.description,
                    tcsRate: p.tcsRate,
                    tcsThreshold: p.tcsThreshold,
                    tcsRateAbove: p.tcsRateAbove,
                    tcsRateBelow: p.tcsRateBelow,
                },
                create: {
                    code: p.code,
                    name: p.name,
                    description: p.description,
                    tcsRate: p.tcsRate,
                    tcsThreshold: p.tcsThreshold,
                    tcsRateAbove: p.tcsRateAbove,
                    tcsRateBelow: p.tcsRateBelow,
                }
            });
            await this.prisma.purposeDocumentRequirement.deleteMany({
                where: { purposeId: tp.id }
            });
            for (const doc of p.docs) {
                await this.prisma.purposeDocumentRequirement.create({
                    data: {
                        purposeId: tp.id,
                        docType: doc,
                        required: true
                    }
                });
            }
        }
        const countries = [
            { code: 'US', name: 'United States', currency: 'USD' },
            { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
            { code: 'EU', name: 'Europe', currency: 'EUR' },
            { code: 'AU', name: 'Australia', currency: 'AUD' },
            { code: 'SG', name: 'Singapore', currency: 'SGD' }
        ];
        for (const c of countries) {
            const cc = await this.prisma.countryConfiguration.upsert({
                where: { countryCode: c.code },
                update: { countryName: c.name, currencyCode: c.currency },
                create: { countryCode: c.code, countryName: c.name, currencyCode: c.currency }
            });
            await this.prisma.transferFeeConfiguration.deleteMany({
                where: { countryId: cc.id }
            });
            await this.prisma.transferFeeConfiguration.create({
                data: {
                    countryId: cc.id,
                    minAmountInr: 0,
                    maxAmountInr: 500000,
                    feeAmountInr: 500,
                    feePercentage: 0
                }
            });
            await this.prisma.transferFeeConfiguration.create({
                data: {
                    countryId: cc.id,
                    minAmountInr: 500001,
                    maxAmountInr: 10000000,
                    feeAmountInr: 1000,
                    feePercentage: 0
                }
            });
        }
    }
    async generateMockEntities(customerCount, orderCount, cardCount, remittanceCount, ticketCount, notificationCount) {
        const seeded = {
            customers: 0,
            orders: 0,
            cards: 0,
            remittances: 0,
            tickets: 0,
            notifications: 0,
        };
        const passHash = await bcrypt.hash('admin123', 5);
        const customerRole = await this.prisma.role.findFirst({ where: { name: 'CUSTOMER' } });
        if (!customerRole)
            return seeded;
        const branches = await this.prisma.branch.findMany({});
        const currencies = await this.prisma.currency.findMany({ where: { code: { not: 'INR' } } });
        const products = await this.prisma.forexProduct.findMany({});
        const categories = await this.prisma.ticketCategory.findMany({});
        const profiles = [];
        for (let i = 0; i < customerCount; i++) {
            const email = `customer.dev.${i}_${Date.now()}@forexmate.dev`;
            const name = `Demo User ${i}`;
            const user = await this.prisma.user.create({
                data: {
                    email,
                    password: passHash,
                    fullName: name,
                    roleId: customerRole.id,
                    isEmailVerified: true,
                },
            });
            const profile = await this.prisma.customerProfile.create({
                data: {
                    userId: user.id,
                    riskCategory: i % 10 === 0 ? 'HIGH' : 'LOW',
                    panNumber: `PANMOCK${1000 + i}C`,
                    passportNo: `PASSMOCK${1000 + i}`,
                },
            });
            await this.prisma.kycDocument.create({
                data: {
                    userId: user.id,
                    docType: 'PAN',
                    filePath: 'pan.jpg',
                    status: 'APPROVED',
                },
            });
            profiles.push(profile);
            seeded.customers++;
        }
        const cards = [];
        const forexCardProduct = products.find(p => p.code === 'FOREX_CARD');
        for (let i = 0; i < cardCount; i++) {
            const targetProfile = profiles[i % profiles.length];
            const cardNum = `43152400${1000 + i}${Math.floor(1000 + Math.random() * 9000)}`;
            const card = await this.prisma.forexCard.create({
                data: {
                    userId: targetProfile.userId,
                    cardNumber: cardNum,
                    cardVendor: 'VISA',
                    cardStatus: client_1.CardStatus.ACTIVE,
                },
            });
            cards.push(card);
            seeded.cards++;
            const usdCurr = currencies.find(c => c.code === 'USD');
            if (usdCurr) {
                await this.prisma.cardWallet.create({
                    data: {
                        cardId: card.id,
                        currencyId: usdCurr.id,
                        balance: 500.0,
                    },
                });
            }
        }
        const orderStatuses = [client_1.OrderStatus.PENDING, client_1.OrderStatus.PAYMENT_COMPLETED, client_1.OrderStatus.DELIVERED, client_1.OrderStatus.CANCELLED];
        for (let i = 0; i < orderCount; i++) {
            const targetProfile = profiles[i % profiles.length];
            const targetBranch = branches[i % branches.length];
            const targetProd = products[i % products.length];
            const targetCurr = currencies[i % currencies.length];
            const rate = 83.5 + (i % 5);
            const amount = 500 + (i % 20) * 100;
            const totalInr = amount * rate;
            const order = await this.prisma.order.create({
                data: {
                    orderNumber: `ORD-${Date.now()}-${i}`,
                    profileId: targetProfile.id,
                    branchId: targetBranch.id,
                    totalAmountInr: totalInr,
                    deliveryMethod: i % 2 === 0 ? 'PICKUP' : 'HOME_DELIVERY',
                    status: orderStatuses[i % orderStatuses.length],
                    items: {
                        create: {
                            productId: targetProd.id,
                            currencyId: targetCurr.id,
                            amount: amount,
                            rate: rate,
                            inrSubtotal: totalInr,
                        },
                    },
                },
            });
            if (targetProd.code === 'REMITTANCE' && seeded.remittances < remittanceCount) {
                await this.prisma.remittanceDetail.create({
                    data: {
                        orderItemId: (await this.prisma.orderItem.findFirst({ where: { orderId: order.id } })).id,
                        beneficiaryName: `Beneficiary Name ${i}`,
                        beneficiaryBank: 'JP Morgan Chase',
                        swiftCode: 'CHASEUS33XXX',
                        ibanOrAccountNumber: `IBAN${Date.now()}${i}`,
                        beneficiaryAddress: 'New York City, NY',
                    },
                });
                seeded.remittances++;
            }
            seeded.orders++;
        }
        for (let i = 0; i < ticketCount; i++) {
            const targetProfile = profiles[i % profiles.length];
            const targetCat = categories[i % categories.length];
            await this.prisma.supportTicket.create({
                data: {
                    ticketNumber: `SUP-${new Date().getFullYear()}-${100000 + i}`,
                    userId: targetProfile.userId,
                    subject: `${targetCat.name} Issue - ${i}`,
                    description: `This is a developer seeded mock description for ticket ${i}`,
                    categoryId: targetCat.id,
                    priority: i % 3 === 0 ? client_1.TicketPriority.HIGH : client_1.TicketPriority.MEDIUM,
                    status: 'OPEN',
                },
            });
            seeded.tickets++;
        }
        for (let i = 0; i < notificationCount; i++) {
            const targetProfile = profiles[i % profiles.length];
            await this.prisma.notificationQueue.create({
                data: {
                    channel: 'EMAIL',
                    recipient: `user_${i}@example.com`,
                    subject: `Forex Notification ${i}`,
                    body: `This is simulated notification body for index ${i}.`,
                    status: i % 5 === 0 ? 'FAILED' : 'PROCESSED',
                    priority: 'MEDIUM',
                },
            });
            seeded.notifications++;
        }
        return seeded;
    }
};
exports.DevSeedService = DevSeedService;
exports.DevSeedService = DevSeedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DevSeedService);
//# sourceMappingURL=dev-seed.service.js.map