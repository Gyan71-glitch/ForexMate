export declare class CreateJournalEntryDto {
    ledgerId: string;
    type: 'DEBIT' | 'CREDIT';
    amount: number;
    description: string;
}
export declare class CreateLedgerDto {
    accountName: string;
}
