export interface RemittanceDetail {
  id: string;
  orderItemId: string;
  beneficiaryName: string;
  beneficiaryBank: string;
  swiftCode: string;
  ibanOrAccountNumber: string;
  beneficiaryAddress: string;
  partner?: {
    id: string;
    name: string;
    isActive: boolean;
  };
}

export interface RemittanceOrderItem {
  id: string;
  orderId: string;
  amount: number | string;
  rate: number | string;
  inrSubtotal: number | string;
  currency: {
    id: string;
    code: string;
    name: string;
    symbol: string;
  };
  product: {
    id: string;
    name: string;
  };
  remittance: RemittanceDetail;
}

export type RemittanceStatus =
  | 'PENDING'
  | 'PENDING_KYC'
  | 'KYC_SUBMITTED'
  | 'COMPLIANCE_REVIEW'
  | 'READY_TO_FORWARD'
  | 'PROCESSING'
  | 'FORWARDED_TO_PARTNER'
  | 'PARTNER_PROCESSING'
  | 'TRANSFER_PROCESSING'
  | 'TRANSFER_COMPLETED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

export interface RemittanceOrder {
  id: string;
  orderNumber: string;
  totalAmountInr: number | string;
  status: RemittanceStatus;
  complianceStatus?: string;
  deliveryMethod: string;
  createdAt: string;
  updatedAt: string;
  items: RemittanceOrderItem[];
  branch?: {
    branchName: string;
    branchCity: string;
    branchCode: string;
  };
}

export interface RemittancePartner {
  id: string;
  name: string;
  isActive: boolean;
}
