import React from 'react';

import { Download, FileText } from 'lucide-react';

interface DocumentListProps {
  documents: any[];
  title: string;
  type: 'invoice' | 'receipt';
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents, title, type }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          {title}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-gray-500 text-sm border-b">
              <th className="px-6 py-4 font-medium">Document ID</th>
              <th className="px-6 py-4 font-medium">Order Ref</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  No {type}s found.
                </td>
              </tr>
            ) : (
              documents.map((doc: any) => (
                <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-gray-900 font-medium">
                    {type === 'invoice' ? doc.invoiceNumber : doc.receiptNo}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {type === 'invoice' ? doc.order?.orderNumber : doc.invoice?.order?.orderNumber}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {new Date(doc.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    ₹{Number(type === 'invoice' ? doc.netAmount : doc.amountPaid).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                      <Download className="w-4 h-4 mr-1.5" />
                      Download PDF
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
