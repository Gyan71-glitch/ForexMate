'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTicketDetails, useAddTicketMessage, useUpdateTicketStatus } from '../../features/support/hooks/useSupport';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Send, Clock, Paperclip, AlertCircle, Info, Lock, Link as LinkIcon, CheckCircle2, ChevronLeft, Building, User } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function TicketChat({ ticketId }: { ticketId: string }) {
  const { data: ticket, isLoading } = useTicketDetails(ticketId);
  const addMessageMutation = useAddTicketMessage();
  const updateStatusMutation = useUpdateTicketStatus();
  const router = useRouter();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse text-gray-500">Loading Case Details...</div>;
  }

  if (!ticket) return <div className="p-8 text-center text-red-500">Case not found</div>;

  const handleSend = () => {
    if (!message.trim()) return;
    addMessageMutation.mutate({ ticketId, message }, {
      onSuccess: () => setMessage('')
    });
  };

  const handleClose = () => {
    updateStatusMutation.mutate({ ticketId, status: 'CLOSED' });
  };

  const isResolved = ticket.status === 'CLOSED' || ticket.status === 'RESOLVED';

  // Combine messages and activities into a single timeline stream
  const timelineItems = [
    ...(ticket.messages || []).map(m => ({ ...m, type: m.type as 'TEXT'|'SYSTEM'|'INTERNAL_NOTE', date: new Date(m.createdAt), isMessage: true })),
    ...(ticket.activities || []).map(a => ({ ...a, type: 'SYSTEM' as const, date: new Date(a.createdAt), isMessage: false }))
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 md:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.push('/dashboard/support')} className="p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            {ticket.subject}
            <span className="text-sm font-mono bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{ticket.ticketNumber}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">{ticket.category.name} Case</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Left: Chat & Timeline */}
        <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden h-full">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50/50">
            {timelineItems.map((item, idx) => {
              if (!item.isMessage) {
                // Render Activity (System message)
                return (
                  <div key={`act-${item.id}`} className="flex justify-center">
                    <div className="bg-gray-100/80 backdrop-blur text-gray-500 text-xs font-semibold px-4 py-1.5 rounded-full flex items-center shadow-sm">
                      <Info className="w-3.5 h-3.5 mr-1.5" />
                      {(item as any).action} • {format(item.date, 'MMM d, h:mm a')}
                    </div>
                  </div>
                );
              }

              const msg = item as any;
              
              if (msg.type === 'SYSTEM') {
                return (
                  <div key={`msg-${msg.id}`} className="flex justify-center">
                    <div className="bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold px-4 py-1.5 rounded-full flex items-center shadow-sm">
                      <Building className="w-3.5 h-3.5 mr-1.5" />
                      {msg.message} • {format(item.date, 'MMM d, h:mm a')}
                    </div>
                  </div>
                );
              }

              if (msg.type === 'INTERNAL_NOTE') {
                // Only show if user is admin/staff (for now just hide or show differently)
                if (user?.role !== 'ADMIN') return null;
                return (
                  <div key={`msg-${msg.id}`} className="flex justify-center">
                    <div className="bg-yellow-50 text-yellow-800 border border-yellow-200 text-xs font-semibold px-4 py-2 rounded-lg flex items-center shadow-sm max-w-md w-full">
                      <Lock className="w-4 h-4 mr-2 text-yellow-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-[10px] uppercase opacity-70 mb-0.5">Internal Note</p>
                        <p>{msg.message}</p>
                      </div>
                    </div>
                  </div>
                );
              }

              const isMe = msg.senderId === ticket.userId;

              return (
                <div key={`msg-${msg.id}`} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                  <div className="flex items-end gap-2 max-w-[85%] md:max-w-[70%]">
                    {!isMe && (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mb-1 border border-blue-200">
                        {msg.sender ? <span className="text-xs font-bold text-blue-700">{msg.sender.fullName[0]}</span> : <Building className="w-4 h-4 text-blue-600"/>}
                      </div>
                    )}
                    
                    <div>
                      {!isMe && msg.sender && (
                        <p className="text-[11px] text-gray-500 font-medium mb-1 ml-1">{msg.sender.fullName} ({msg.sender.roleRef?.name || 'Support'})</p>
                      )}
                      <div className={cn(
                        "px-4 py-3 rounded-2xl shadow-sm text-sm whitespace-pre-wrap",
                        isMe ? "bg-blue-600 text-white rounded-br-sm" : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                      )}>
                        {msg.message}
                      </div>
                      <p className={cn("text-[10px] text-gray-400 mt-1", isMe ? "text-right" : "text-left")}>
                        {format(item.date, 'h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-200 flex items-end gap-3">
            {isResolved ? (
              <div className="flex-1 bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 text-center font-semibold flex flex-col items-center justify-center">
                <CheckCircle2 className="w-6 h-6 mb-2 text-green-600" />
                This case has been marked as resolved.
                <Button variant="outline" className="mt-4 bg-white">Reopen Case</Button>
              </div>
            ) : (
              <>
                <button className="p-3 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <Input 
                    placeholder="Type your message here..." 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="w-full h-12 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4"
                  />
                </div>
                <Button 
                  onClick={handleSend}
                  disabled={!message.trim() || addMessageMutation.isPending}
                  className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md font-bold"
                >
                  <Send className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Reply</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Right: Metadata */}
        <div className="lg:w-80 flex-shrink-0 space-y-6 overflow-y-auto">
          {/* Status Card */}
          <Card className="border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-100 p-4">
              <h3 className="font-bold text-gray-900 text-sm tracking-wide uppercase">Case Status</h3>
            </div>
            <CardContent className="p-5 space-y-5">
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1 uppercase">Current Status</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  {ticket.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1 uppercase">Priority</p>
                <span className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border",
                  ticket.priority === 'CRITICAL' ? "bg-red-100 text-red-800 border-red-200" :
                  ticket.priority === 'HIGH' ? "bg-orange-100 text-orange-800 border-orange-200" :
                  "bg-yellow-100 text-yellow-800 border-yellow-200"
                )}>
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {ticket.priority}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1 uppercase">Department</p>
                <div className="flex items-center text-sm font-semibold text-gray-900">
                  <Building className="w-4 h-4 mr-2 text-gray-400" />
                  {ticket.department} Team
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SLA Card */}
          <Card className="border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-100 p-4">
              <h3 className="font-bold text-gray-900 text-sm tracking-wide uppercase flex items-center">
                <Clock className="w-4 h-4 mr-2 text-gray-500" /> SLA Tracker
              </h3>
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Created</span>
                <span className="text-sm font-medium text-gray-900">{format(new Date(ticket.createdAt), 'MMM d, h:mm a')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Response Due</span>
                <span className="text-sm font-medium text-blue-600">{ticket.responseDue ? format(new Date(ticket.responseDue), 'MMM d, h:mm a') : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Resolution Due</span>
                <span className="text-sm font-medium text-gray-900">{ticket.resolutionDue ? formatDistanceToNow(new Date(ticket.resolutionDue)) : 'N/A'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Links Card */}
          {ticket.relatedOrderId && (
            <Card className="border border-blue-200 shadow-sm rounded-2xl overflow-hidden bg-blue-50/50">
              <div className="p-4">
                <h3 className="font-bold text-blue-900 text-sm tracking-wide flex items-center mb-2">
                  <LinkIcon className="w-4 h-4 mr-2" /> Related Order
                </h3>
                <div className="bg-white border border-blue-100 p-3 rounded-xl flex items-center justify-between cursor-pointer hover:border-blue-300">
                  <span className="text-sm font-bold text-gray-900">{ticket.relatedOrderId}</span>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">View</span>
                </div>
              </div>
            </Card>
          )}

          {!isResolved && (
            <Button variant="outline" onClick={handleClose} className="w-full border-red-200 text-red-600 hover:bg-red-50 font-bold bg-white">
              Mark as Resolved
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
