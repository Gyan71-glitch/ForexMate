export interface CardWallet {
  id: string;
  cardId: string;
  currencyId: string;
  balance: number | string;
  currency: {
    id: string;
    code: string;
    name: string;
    symbol: string;
    flagEmoji?: string;
  };
}

export interface CardTransaction {
  id: string;
  cardId: string;
  amount: number | string;
  currencyId: string;
  merchant: string;
  status: string;
  createdAt: string;
  currency: {
    code: string;
    symbol: string;
  };
  card?: {
    cardNumber: string;
    cardVendor: string;
  };
}

export type CardStatus = 'INACTIVE' | 'ACTIVE' | 'BLOCKED';

export interface ForexCard {
  id: string;
  userId: string;
  cardNumber: string;
  cardVendor: string;
  cardStatus: CardStatus;
  createdAt: string;
  provider?: {
    id: string;
    name: string;
  };
  wallets: CardWallet[];
  transactions: CardTransaction[];
}
