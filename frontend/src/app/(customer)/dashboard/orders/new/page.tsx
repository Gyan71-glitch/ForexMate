import React from 'react';
import { OrderWizard } from '@/components/orders/OrderWizard';

export default function NewOrderPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-extrabold text-blue-900">New Order</h1>
        <p className="text-gray-500 mt-2">Buy currency notes, reload forex cards, or send wire transfers.</p>
      </div>

      <OrderWizard />
    </div>
  );
}
