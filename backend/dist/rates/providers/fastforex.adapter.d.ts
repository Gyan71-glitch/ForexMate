export interface RateProviderResponse {
    [currencyCode: string]: number;
}
export declare class FastForexAdapter {
    private readonly logger;
    fetchLiveRates(): Promise<RateProviderResponse>;
    private getFallbackMockRates;
}
