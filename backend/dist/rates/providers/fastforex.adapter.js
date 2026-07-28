"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FastForexAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FastForexAdapter = void 0;
const common_1 = require("@nestjs/common");
let FastForexAdapter = FastForexAdapter_1 = class FastForexAdapter {
    logger = new common_1.Logger(FastForexAdapter_1.name);
    async fetchLiveRates() {
        const mockMode = global.devRateMode || 'NORMAL';
        if (mockMode === 'API_OFFLINE' || mockMode === 'PROVIDER_ERROR') {
            throw new Error('Simulated FastForex API Offline / Provider Error.');
        }
        if (mockMode === 'PROVIDER_TIMEOUT') {
            this.logger.warn('Simulated FastForex API Timeout (10 seconds delay starting)...');
            await new Promise(resolve => setTimeout(resolve, 10000));
            throw new Error('Simulated FastForex API Timeout.');
        }
        if (mockMode === 'SLOW_PROVIDER') {
            this.logger.log('Simulated FastForex Slow Provider delay (4 seconds)...');
            await new Promise(resolve => setTimeout(resolve, 4000));
        }
        if (mockMode !== 'NORMAL' && mockMode !== 'SLOW_PROVIDER') {
            this.logger.log(`Pricing Engine: Using dev override mode: ${mockMode}`);
            const baseRates = {
                'USD': 83.50,
                'EUR': 89.20,
                'GBP': 105.10,
                'AED': 22.73,
                'AUD': 54.80,
                'SGD': 61.80,
                'CAD': 61.20,
                'THB': 2.45,
            };
            if (mockMode === 'CRASH_EUR') {
                baseRates['EUR'] = 62.44;
            }
            if (mockMode === 'INCREASE_USD') {
                baseRates['USD'] = 96.02;
            }
            if (mockMode === 'RANDOMIZE') {
                baseRates['USD'] = +(baseRates['USD'] + (Math.random() - 0.5) * 4).toFixed(2);
                baseRates['EUR'] = +(baseRates['EUR'] + (Math.random() - 0.5) * 4).toFixed(2);
                baseRates['GBP'] = +(baseRates['GBP'] + (Math.random() - 0.5) * 4).toFixed(2);
            }
            if (mockMode === 'WEEKEND_RATES' || mockMode === 'MARKET_CLOSED') {
                return baseRates;
            }
            return baseRates;
        }
        const apiKey = process.env.FASTFOREX_API_KEY;
        if (!apiKey) {
            this.logger.warn('FASTFOREX_API_KEY missing. Simulating fallback rates.');
            return this.getFallbackMockRates();
        }
        try {
            const response = await fetch(`https://api.fastforex.io/fetch-all?from=INR&api_key=${apiKey}`);
            if (!response.ok) {
                this.logger.warn(`FastForex API returned status ${response.status} ${response.statusText}. Falling back to simulated mock rates.`);
                return this.getFallbackMockRates();
            }
            const data = await response.json();
            if (!data || !data.results) {
                throw new Error('Invalid FastForex structure.');
            }
            const internalRates = {};
            for (const [code, rateToInr] of Object.entries(data.results)) {
                const rateNum = rateToInr;
                if (rateNum && rateNum > 0) {
                    internalRates[code] = +(1 / rateNum).toFixed(4);
                }
            }
            return internalRates;
        }
        catch (error) {
            this.logger.error(`Adapter failed: ${error.message}. Using simulated rates fallback.`);
            return this.getFallbackMockRates();
        }
    }
    getFallbackMockRates() {
        return {
            'USD': 83.50,
            'EUR': 89.20,
            'GBP': 105.10,
            'AED': 22.73,
            'AUD': 54.80,
            'SGD': 61.80,
            'CAD': 61.20,
            'THB': 2.45,
        };
    }
};
exports.FastForexAdapter = FastForexAdapter;
exports.FastForexAdapter = FastForexAdapter = FastForexAdapter_1 = __decorate([
    (0, common_1.Injectable)()
], FastForexAdapter);
//# sourceMappingURL=fastforex.adapter.js.map