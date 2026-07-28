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
exports.DevEventsService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
let DevEventsService = class DevEventsService {
    events = [];
    constructor() {
        this.emit('SystemStarted', { nodeVersion: process.version, env: process.env.NODE_ENV });
    }
    emit(name, payload) {
        const event = {
            id: crypto.randomUUID(),
            name,
            payload,
            timestamp: new Date(),
        };
        this.events.unshift(event);
        if (this.events.length > 200) {
            this.events.pop();
        }
        return event;
    }
    getEvents(filter, search) {
        let filtered = [...this.events];
        if (filter && filter !== 'ALL') {
            filtered = filtered.filter(e => e.name.toLowerCase().includes(filter.toLowerCase()));
        }
        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter(e => e.name.toLowerCase().includes(q) ||
                JSON.stringify(e.payload).toLowerCase().includes(q));
        }
        return filtered;
    }
    replayEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) {
            throw new Error(`Event with ID ${eventId} not found.`);
        }
        return this.emit(`${event.name}:REPLAYED`, {
            originalEventId: event.id,
            replayedAt: new Date(),
            payload: event.payload
        });
    }
    clearEvents() {
        this.events = [];
        return { success: true };
    }
};
exports.DevEventsService = DevEventsService;
exports.DevEventsService = DevEventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], DevEventsService);
//# sourceMappingURL=dev-events.service.js.map