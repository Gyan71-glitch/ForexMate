import React from 'react';
import TicketChat from '@/components/support/TicketChat';

export const metadata = {
  title: 'Case Details | Forexmate Support',
};

export default function TicketPage({ params }: { params: { id: string } }) {
  return <TicketChat ticketId={params.id} />;
}
