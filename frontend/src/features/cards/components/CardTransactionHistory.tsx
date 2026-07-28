'use client';

import React from 'react';
import { CardTransaction } from '../types';

const STATUS_COLORS: Record<string, string> = {
  APPROVED: 'text-green-600 bg-green-50',
  DECLINED: 'text-red-600 bg-red-50',
  PENDING: 'text-yellow-600 bg-yellow-50',
};

interface CardTransactionHistoryProps {
  transactions: CardTransaction[];
}

export const CardTransactionHistory: React.FC<CardTransactionHistoryProps> = ({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-3">💳</p>
        <p className="font-medium">No card transactions yet.</p>
        <p className="text-sm mt-1">Use your Forex Card at a merchant and transactions will appear here.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-50">
      {transactions.map((txn) => (
        <div key={txn.id} className="flex items-center justify-between py-4 px-6 hover:bg-gray-50/50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
              {txn.currency.code.slice(0, 2)}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{txn.merchant || 'Unknown Merchant'}</p>
              <p className="text-xs text-gray-400">
                {txn.card ? `${txn.card.cardVendor} •••• ${txn.card.cardNumber.slice(-4)}` : ''}
                {' · '}
                {new Date(txn.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-900">
              {txn.currency.symbol || txn.currency.code} {Number(txn.amount).toLocaleString()}
            </p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[txn.status] || 'text-gray-500 bg-gray-100'}`}>
              {txn.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
