"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const admin_controller_1 = require("./admin.controller");
const admin_service_1 = require("./admin.service");
const employees_controller_1 = require("./employees/employees.controller");
const employees_service_1 = require("./employees/employees.service");
const city_controller_1 = require("./city/city.controller");
const city_service_1 = require("./city/city.service");
const vault_transfer_controller_1 = require("./vault-transfer/vault-transfer.controller");
const vault_transfer_service_1 = require("./vault-transfer/vault-transfer.service");
const prisma_module_1 = require("../prisma/prisma.module");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [
            admin_controller_1.AdminController,
            employees_controller_1.EmployeesController,
            city_controller_1.CityController,
            vault_transfer_controller_1.VaultTransferController,
        ],
        providers: [
            admin_service_1.AdminService,
            employees_service_1.EmployeesService,
            city_service_1.CityService,
            vault_transfer_service_1.VaultTransferService,
        ],
        exports: [employees_service_1.EmployeesService, city_service_1.CityService, vault_transfer_service_1.VaultTransferService],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map