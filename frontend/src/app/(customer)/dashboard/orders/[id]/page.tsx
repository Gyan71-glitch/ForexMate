"use client";

import React, { use } from 'react';
import { OrderDetails } from '@/features/orders/components/OrderDetails';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // Use React 19 `use` hook to unwrap params
  const { id } = use(params);
  
  return (
    <div className="max-w-5xl mx-auto">
      <OrderDetails id={id} />
    </div>
  );
}
