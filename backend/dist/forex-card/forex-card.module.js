"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForexCardModule = void 0;
const common_1 = require("@nestjs/common");
const forex_card_service_1 = require("./forex-card.service");
const forex_card_controller_1 = require("./forex-card.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const auth_module_1 = require("../auth/auth.module");
let ForexCardModule = class ForexCardModule {
};
exports.ForexCardModule = ForexCardModule;
exports.ForexCardModule = ForexCardModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, auth_module_1.AuthModule],
        providers: [forex_card_service_1.ForexCardService],
        controllers: [forex_card_controller_1.ForexCardController],
        exports: [forex_card_service_1.ForexCardService],
    })
], ForexCardModule);
//# sourceMappingURL=forex-card.module.js.map