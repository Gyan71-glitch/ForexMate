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
exports.SyncService = void 0;
const common_1 = require("@nestjs/common");
const domain_event_bus_service_1 = require("../event-bus/domain-event-bus.service");
const operators_1 = require("rxjs/operators");
let SyncService = class SyncService {
    eventBus;
    constructor(eventBus) {
        this.eventBus = eventBus;
    }
    getSyncStream() {
        return this.eventBus.stream$.pipe((0, operators_1.map)((event) => ({
            data: {
                type: event.type,
                payload: event.payload,
            },
        })));
    }
};
exports.SyncService = SyncService;
exports.SyncService = SyncService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [domain_event_bus_service_1.DomainEventBus])
], SyncService);
//# sourceMappingURL=sync.service.js.map