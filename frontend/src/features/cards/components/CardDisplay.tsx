'use client';

import React from 'react';
import Link from 'next/link';
import { ForexCard } from '../types';
import { useFreezeCard, useUnfreezeCard } from '../hooks/useCards';

const VENDOR_GRADIENT: Record<string, string> = {
  VISA: 'from-slate-800 via-slate-700 to-slate-900',
  MASTERCARD: 'from-red-800 via-red-700 to-rose-900',
  AMEX: 'from-emerald-800 via-teal-700 to-emerald-900',
};

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: 'bg-green-500/20 text-green-400 border border-green-500/30',
  INACTIVE: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  BLOCKED: 'bg-red-500/20 text-red-400 border border-red-500/30',
};

interface CardDisplayProps {
  card: ForexCard;
  compact?: boolean;
}

export const CardDisplay: React.FC<CardDisplayProps> = ({ card, compact = false }) => {
  const gradient = VENDOR_GRADIENT[card.cardVendor] || VENDOR_GRADIENT.VISA;
  const freeze = useFreezeCard();
  const unfreeze = useUnfreezeCard();

  const totalBalanceUsd = card.wallets.reduce((acc, w) => acc + Number(w.balance), 0);
  const maskedNumber = card.cardNumber.replace(/^(FXC-)(\d{4})(\d+)(\d{4})$/, '$1 $2 •••• $4');

  return (
    <div className={`rounded-2xl bg-gradient-to-br ${gradient} p-6 text-white shadow-2xl relative overflow-hidden ${compact ? '' : 'max-w-sm'}`}>
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/5" />

      <div className="relative z-10">
        {/* Top row */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-xs font-medium text-white/60 uppercase tracking-widest">Forexmate</p>
            <p className="text-lg font-bold">{card.cardVendor} Forex Card</p>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[card.cardStatus]}`}>
            {card.cardStatus}
          </span>
        </div>

        {/* Card number */}
        <p className="font-mono text-xl tracking-[0.2em] mb-6">{maskedNumber}</p>

        {/* Wallets summary */}
        <div className="mb-5">
          {card.wallets.length === 0 ? (
            <p className="text-sm text-white/50">No wallets loaded</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {card.wallets.slice(0, 4).map(w => (
                <div key={w.id} className="bg-white/10 rounded-lg px-3 py-1.5 text-sm">
                  <span className="font-bold">{w.currency.code}</span>{' '}
                  <span className="text-white/80">{Number(w.balance).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/50">Issued</p>
            <p className="text-sm font-medium">
              {new Date(card.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
            </p>
          </div>
          {!compact && (
            <div className="flex gap-2">
              {card.cardStatus === 'BLOCKED' ? (
                <button
                  onClick={() => unfreeze.mutate(card.id)}
                  disabled={unfreeze.isPending}
                  className="text-xs font-semibold bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 text-green-300 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {unfreeze.isPending ? '...' : 'Unfreeze'}
                </button>
              ) : (
                <button
                  onClick={() => freeze.mutate(card.id)}
                  disabled={freeze.isPending}
                  className="text-xs font-semibold bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {freeze.isPending ? '...' : 'Freeze'}
                </button>
              )}
              <Link
                href={`/dashboard/cards/${card.id}`}
                className="text-xs font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                Details →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
