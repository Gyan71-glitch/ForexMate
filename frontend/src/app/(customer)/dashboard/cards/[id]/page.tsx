'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCard } from '@/features/cards/hooks/useCards';
import { CardDisplay } from '@/features/cards/components/CardDisplay';
import { CardTransactionHistory } from '@/features/cards/components/CardTransactionHistory';
import { Coins } from 'lucide-react';

export default function CardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: card, isLoading, error } = useCard(id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Card not found or you don't have access to it.</p>
        <button onClick={() => router.back()} className="mt-4 text-blue-600 font-medium hover:underline">
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 transition-colors">
          ← Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Card Details</h1>
          <p className="text-gray-400 text-sm font-mono">{card.cardNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card Visual */}
        <div>
          <CardDisplay card={card} />
        </div>

        {/* Wallet Balances */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-semibold text-gray-900">Currency Wallets</h3>
          </div>
          {card.wallets.length === 0 ? (
            <div className="px-6 py-10 text-center text-gray-400">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-100">
                <Coins className="w-6 h-6 text-blue-600" />
              </div>
              <p>No currency wallets loaded yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {card.wallets.map(wallet => (
                <div key={wallet.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm">
                      {wallet.currency.code.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{wallet.currency.code}</p>
                      <p className="text-xs text-gray-400">{wallet.currency.name}</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {wallet.currency.symbol || wallet.currency.code} {Number(wallet.balance).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full Transaction History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-semibold text-gray-900">Transaction History</h3>
          <p className="text-sm text-gray-400 mt-0.5">Last 50 transactions on this card</p>
        </div>
        <CardTransactionHistory transactions={card.transactions} />
      </div>
    </div>
  );
}
