import React from 'react';
import { Badge } from '@/components/ui/badge';

interface OrderStatusBadgeProps {
  status: string;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  switch (status) {
    case 'COMPLETED':
      return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none font-bold text-xs uppercase tracking-wider">Completed</Badge>;
    case 'PROCESSING':
    case 'PAYMENT_PENDING':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none font-bold text-xs uppercase tracking-wider">Processing</Badge>;
    case 'PENDING_KYC':
    case 'UNDER_REVIEW':
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none font-bold text-xs uppercase tracking-wider">Action Required</Badge>;
    case 'CANCELLED':
    case 'REJECTED':
      return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-none font-bold text-xs uppercase tracking-wider">Cancelled</Badge>;
    case 'PENDING':
    default:
      return <Badge variant="outline" className="font-bold text-xs uppercase tracking-wider">{status.replace(/_/g, ' ')}</Badge>;
  }
}
