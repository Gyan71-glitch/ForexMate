export declare class InterbankTradeDto {
    currencyCode: string;
    tradeType: 'BUY' | 'SELL';
    amount: number;
    rate: number;
    bankName: string;
}
