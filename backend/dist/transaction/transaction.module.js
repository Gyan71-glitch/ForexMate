"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionModule = void 0;
const common_1 = require("@nestjs/common");
const transaction_service_1 = require("./transaction.service");
const transaction_controller_1 = require("./transaction.controller");
const transaction_engine_service_1 = require("./transaction-engine.service");
const transaction_engine_controller_1 = require("./transaction-engine.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const auth_module_1 = require("../auth/auth.module");
const quotes_module_1 = require("../quotes/quotes.module");
let TransactionModule = class TransactionModule {
};
exports.TransactionModule = TransactionModule;
exports.TransactionModule = TransactionModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, auth_module_1.AuthModule, quotes_module_1.QuotesModule],
        providers: [transaction_service_1.TransactionService, transaction_engine_service_1.TransactionEngineService],
        controllers: [transaction_controller_1.TransactionController, transaction_engine_controller_1.TransactionEngineController],
        exports: [transaction_service_1.TransactionService, transaction_engine_service_1.TransactionEngineService],
    })
], TransactionModule);
//# sourceMappingURL=transaction.module.js.map