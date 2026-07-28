import { Injectable, Logger } from '@nestjs/common';

export interface RateProviderResponse {
  [currencyCode: string]: number; // INR relative price
}

@Injectable()
export class FastForexAdapter {
  private readonly logger = new Logger(FastForexAdapter.name);

  /**
   * Fetches the latest live rates from the FastForex API.
   * Maps the third-party response into a standard internal format (Anti-Corruption Layer).
   */
  async fetchLiveRates(): Promise<RateProviderResponse> {
    const mockMode = (global as any).devRateMode || 'NORMAL';

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
      const baseRates: RateProviderResponse = {
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
        // Return static mock rates immediately
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
      
      // Convert mapping from (1 INR = X foreign) to (1 foreign = X INR)
      const internalRates: RateProviderResponse = {};
      for (const [code, rateToInr] of Object.entries(data.results)) {
        const rateNum = rateToInr as number;
        if (rateNum && rateNum > 0) {
          internalRates[code] = +(1 / rateNum).toFixed(4);
        }
      }
      
      return internalRates;
    } catch (error: any) {
      this.logger.error(`Adapter failed: ${error.message}. Using simulated rates fallback.`);
      return this.getFallbackMockRates();
    }
  }

  private getFallbackMockRates(): RateProviderResponse {
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
}


