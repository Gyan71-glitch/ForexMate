export type TicketPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type TicketStatus = 'OPEN' | 'WAITING_FOR_CUSTOMER' | 'WAITING_FOR_SUPPORT' | 'IN_PROGRESS' | 'ESCALATED' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';
export type TicketDepartment = 'SUPPORT' | 'COMPLIANCE' | 'TREASURY' | 'DEALER' | 'IT' | 'FINANCE';
export type TicketMessageType = 'TEXT' | 'ATTACHMENT' | 'SYSTEM' | 'INTERNAL_NOTE';

export interface TicketCategory {
  id: string;
  name: string;
  icon: string | null;
  defaultPriority: TicketPriority;
  department: TicketDepartment;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string | null;
  type: TicketMessageType;
  message: string;
  createdAt: string;
  sender?: {
    fullName: string;
    roleRef?: { name: string } | null;
  } | null;
}

export interface TicketActivity {
  id: string;
  ticketId: string;
  actorId: string | null;
  action: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  subject: string;
  description: string | null;
  categoryId: string;
  priority: TicketPriority;
  status: TicketStatus;
  department: TicketDepartment;
  assignedToId: string | null;
  responseDue: string | null;
  resolutionDue: string | null;
  slaBreached: boolean;
  relatedOrderId: string | null;
  relatedCardId: string | null;
  relatedRemittanceId: string | null;
  createdAt: string;
  updatedAt: string;
  category: TicketCategory;
  messages?: TicketMessage[];
  activities?: TicketActivity[];
}
