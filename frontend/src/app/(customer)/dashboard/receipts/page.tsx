"use client";

import React from 'react';
import { useReceipts } from '@/features/documents/hooks/useDocuments';
import { DocumentList } from '@/features/documents/components/DocumentList';

export default function ReceiptsPage() {
  const { data: receipts, isLoading, error } = useReceipts();

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
        Failed to load receipts. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Receipts</h1>
        <p className="text-gray-500">View and download receipts for all your payments.</p>
      </div>

      <DocumentList 
        documents={receipts || []} 
        title="Recent Receipts" 
        type="receipt" 
      />
    </div>
  );
}
