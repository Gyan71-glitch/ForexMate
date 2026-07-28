"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CashAllocationModule = void 0;
const common_1 = require("@nestjs/common");
const cash_allocation_service_1 = require("./cash-allocation.service");
const cash_allocation_controller_1 = require("./cash-allocation.controller");
const event_bus_module_1 = require("../common/event-bus/event-bus.module");
let CashAllocationModule = class CashAllocationModule {
};
exports.CashAllocationModule = CashAllocationModule;
exports.CashAllocationModule = CashAllocationModule = __decorate([
    (0, common_1.Module)({
        imports: [event_bus_module_1.EventBusModule],
        controllers: [cash_allocation_controller_1.CashAllocationController],
        providers: [cash_allocation_service_1.CashAllocationService],
        exports: [cash_allocation_service_1.CashAllocationService],
    })
], CashAllocationModule);
//# sourceMappingURL=cash-allocation.module.js.map