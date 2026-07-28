"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatCurrencyINR, formatDate } from '@/lib/utils';
import { OrderStatusBadge } from './OrderStatusBadge';
import { PackageOpen } from 'lucide-react';

interface RecentOrdersTableProps {
  orders: any[];
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  return (
    <Card className="border-gray-200 shadow-sm overflow-hidden">
      <CardHeader className="bg-gray-50/50 flex flex-row items-center justify-between pb-4 border-b border-gray-100">
        <CardTitle className="text-lg font-extrabold text-gray-900">Recent Transactions</CardTitle>
        <Button variant="link" className="text-blue-600 font-bold px-0 h-auto" onClick={() => window.location.href = '/dashboard/orders'}>
          View All Orders
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
              <PackageOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Transactions Yet</h3>
            <p className="text-gray-500 max-w-sm mb-6">
              You haven't placed any orders yet. Start by exploring our services.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700 font-bold" onClick={() => window.location.href = '/buy-forex'}>
              Explore Services
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                <TableHead className="font-bold text-gray-500 uppercase tracking-wider text-xs">Order ID</TableHead>
                <TableHead className="font-bold text-gray-500 uppercase tracking-wider text-xs">Date</TableHead>
                <TableHead className="font-bold text-gray-500 uppercase tracking-wider text-xs">Product</TableHead>
                <TableHead className="font-bold text-gray-500 uppercase tracking-wider text-xs">Amount (INR)</TableHead>
                <TableHead className="font-bold text-gray-500 uppercase tracking-wider text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const productName = order.items?.[0]?.product?.name || 'Unknown Product';
                return (
                  <TableRow key={order.id} className="cursor-pointer hover:bg-blue-50/50 transition-colors" onClick={() => window.location.href = `/dashboard/orders/${order.id}`}>
                    <TableCell className="font-bold text-blue-600">{order.orderNumber}</TableCell>
                    <TableCell className="text-gray-600 font-medium">{formatDate(order.createdAt)}</TableCell>
                    <TableCell className="font-bold text-gray-900">{productName}</TableCell>
                    <TableCell className="font-bold text-gray-900">{formatCurrencyINR(order.totalAmountInr)}</TableCell>
                    <TableCell><OrderStatusBadge status={order.status} /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
