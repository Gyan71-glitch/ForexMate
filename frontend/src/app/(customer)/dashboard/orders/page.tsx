"use client";

import React from 'react';
import { OrdersList } from '@/features/orders/components/OrdersList';

export default function OrdersPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Track Orders</h1>
          <p className="text-gray-500 font-medium mt-1">View and manage all your active and past orders.</p>
        </div>
      </div>

      <OrdersList />
    </div>
  );
}
