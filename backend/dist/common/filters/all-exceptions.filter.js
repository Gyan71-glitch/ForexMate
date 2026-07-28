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
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
let AllExceptionsFilter = class AllExceptionsFilter {
    httpAdapterHost;
    constructor(httpAdapterHost) {
        this.httpAdapterHost = httpAdapterHost;
    }
    catch(exception, host) {
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();
        let httpStatus = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let details = [];
        let code = 'INTERNAL_ERROR';
        if (exception instanceof common_1.HttpException) {
            httpStatus = exception.getStatus();
            const res = exception.getResponse();
            message = typeof res === 'string' ? res : (res.message || res.error || message);
            if (Array.isArray(res.message)) {
                details = res.message;
                message = 'Validation failed';
                code = 'VALIDATION_ERROR';
            }
            else {
                code = res.error ? res.error.toUpperCase().replace(/\s+/g, '_') : 'HTTP_ERROR';
            }
        }
        else if (exception instanceof Error) {
            message = exception.message;
        }
        const responseBody = {
            success: false,
            error: {
                code,
                message,
                details,
                path: httpAdapter.getRequestUrl(ctx.getRequest()),
                timestamp: new Date().toISOString(),
            },
        };
        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [core_1.HttpAdapterHost])
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map