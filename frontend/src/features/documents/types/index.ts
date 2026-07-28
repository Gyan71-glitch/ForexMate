import { Order } from '@/features/orders/types';

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  amount: number | string;
}

export interface InvoiceReceipt {
  id: string;
  invoiceId: string;
  receiptNo: string;
  amountPaid: number | string;
  paymentMode: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  orderId: string;
  invoiceNumber: string;
  netAmount: number | string;
  createdAt: string;
  items?: InvoiceItem[];
  receipts?: InvoiceReceipt[];
  order?: Order;
}
