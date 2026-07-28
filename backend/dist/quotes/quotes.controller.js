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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const quotes_service_1 = require("./quotes.service");
const quote_dto_1 = require("./dto/quote.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let QuotesController = class QuotesController {
    quotesService;
    constructor(quotesService) {
        this.quotesService = quotesService;
    }
    async generate(dto, req) {
        return this.quotesService.generateQuote(req.user.id, dto);
    }
};
exports.QuotesController = QuotesController;
__decorate([
    (0, common_1.Post)('generate'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate a locked quote for an order' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Quote generated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quote_dto_1.GenerateQuoteDto, Object]),
    __metadata("design:returntype", Promise)
], QuotesController.prototype, "generate", null);
exports.QuotesController = QuotesController = __decorate([
    (0, swagger_1.ApiTags)('Quotes'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('quotes'),
    __metadata("design:paramtypes", [quotes_service_1.QuotesService])
], QuotesController);
//# sourceMappingURL=quotes.controller.js.map