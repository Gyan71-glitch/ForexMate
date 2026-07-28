'use client';

import React, { useState } from 'react';
import { useMyTickets } from '../../features/support/hooks/useSupport';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, Plus, Clock, MessageSquare, AlertCircle, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useRouter } from 'next/navigation';
import CreateTicketModal from './CreateTicketModal';
import { TicketStatus, TicketPriority } from '../../features/support/types';
import { cn } from '@/lib/utils';

export default function SupportHub() {
  const { data: tickets, isLoading } = useMyTickets();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const router = useRouter();

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'WAITING_FOR_SUPPORT': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'WAITING_FOR_CUSTOMER': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'IN_PROGRESS': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ESCALATED': return 'bg-red-100 text-red-800 border-red-200';
      case 'RESOLVED': case 'CLOSED': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: TicketPriority) => {
    switch (priority) {
      case 'CRITICAL': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'HIGH': return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case 'MEDIUM': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'LOW': return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default: return null;
    }
  };

  const activeTickets = tickets?.filter(t => !['CLOSED', 'CANCELLED', 'RESOLVED'].includes(t.status)) || [];
  const pastTickets = tickets?.filter(t => ['CLOSED', 'CANCELLED', 'RESOLVED'].includes(t.status)) || [];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Support Center</h1>
          <p className="text-gray-500 mt-1">Manage your support tickets and find answers quickly.</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-blue-600/20">
          <Plus className="w-5 h-5 mr-2" />
          Create Ticket
        </Button>
      </div>

      {/* FAQ Search Bar */}
      <Card className="border-none shadow-xl shadow-gray-200/50 bg-gradient-to-br from-blue-600 to-blue-800 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <CardContent className="p-8 md:p-12 text-center relative z-10">
          <HelpCircle className="w-12 h-12 mx-auto mb-4 text-blue-200" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">How can we help you today?</h2>
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
            <Input 
              className="w-full h-14 pl-12 pr-4 rounded-full bg-white text-gray-900 text-lg shadow-2xl focus:ring-4 focus:ring-blue-400/50 border-0" 
              placeholder="Search for articles, e.g. 'How to reload card'..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
          Active Cases ({activeTickets.length})
        </h3>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1,2].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse"></div>)}
          </div>
        ) : activeTickets.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-gray-900 font-bold text-lg mb-1">No active support cases</p>
              <p className="text-gray-500">You're all caught up! If you need help, feel free to create a ticket.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {activeTickets.map(ticket => (
              <div 
                key={ticket.id} 
                onClick={() => router.push(`/dashboard/support/${ticket.id}`)}
                className="group bg-white border border-gray-200 hover:border-blue-300 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{ticket.ticketNumber}</span>
                      <span className={cn("text-xs font-bold px-2.5 py-0.5 rounded-full border", getStatusColor(ticket.status))}>
                        {ticket.status.replace(/_/g, ' ')}
                      </span>
                      {getPriorityIcon(ticket.priority)}
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{ticket.subject}</h4>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{ticket.category.name} • {ticket.description}</p>
                  </div>
                  <div className="flex items-center gap-6 md:border-l md:pl-6 border-gray-100">
                    <div className="text-right">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Last Updated</p>
                      <p className="text-sm font-medium text-gray-900 flex items-center justify-end">
                        <Clock className="w-4 h-4 mr-1 text-gray-400" />
                        {formatDistanceToNow(new Date(ticket.updatedAt))} ago
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pastTickets.length > 0 && (
        <div className="space-y-6 pt-8 border-t border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 flex items-center opacity-70">
            <CheckCircle2 className="w-5 h-5 mr-2 text-gray-500" />
            Resolved Cases ({pastTickets.length})
          </h3>
          <div className="grid gap-3 opacity-70 hover:opacity-100 transition-opacity">
            {pastTickets.map(ticket => (
              <div 
                key={ticket.id} 
                onClick={() => router.push(`/dashboard/support/${ticket.id}`)}
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-500">{ticket.ticketNumber}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs font-medium text-gray-600">{format(new Date(ticket.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">{ticket.subject}</h4>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <CreateTicketModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setCreateModalOpen(false)} 
        />
      )}
    </div>
  );
}
