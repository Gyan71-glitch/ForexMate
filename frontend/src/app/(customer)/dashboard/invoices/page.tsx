"use client";

import React from 'react';
import { useInvoices } from '@/features/documents/hooks/useDocuments';
import { DocumentList } from '@/features/documents/components/DocumentList';

export default function InvoicesPage() {
  const { data: invoices, isLoading, error } = useInvoices();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        Failed to load invoices. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tax Invoices</h1>
        <p className="text-gray-500">View and download invoices for all your completed orders.</p>
      </div>

      <DocumentList 
        documents={invoices || []} 
        title="Recent Invoices" 
        type="invoice" 
      />
    </div>
  );
}
