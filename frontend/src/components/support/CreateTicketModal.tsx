'use client';

import React, { useState } from 'react';
import { useTicketCategories, useCreateTicket } from '../../features/support/hooks/useSupport';
import { X, Search, Coins, CreditCard, RefreshCw, Undo, Send, AlertCircle, AlertTriangle, FileCheck, FileSearch, Building, Briefcase, Frown, MonitorOff, HelpCircle, MessageSquare } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

// Icon mapping helper
const getIcon = (iconName: string | null) => {
  const icons: Record<string, any> = {
    'coins': Coins, 'credit-card': CreditCard, 'refresh-cw': RefreshCw, 'undo': Undo, 'send': Send,
    'alert-circle': AlertCircle, 'alert-triangle': AlertTriangle, 'file-check': FileCheck, 'file-search': FileSearch,
    'building': Building, 'briefcase': Briefcase, 'frown': Frown, 'monitor-off': MonitorOff, 'help-circle': HelpCircle, 'message-square': MessageSquare
  };
  const Icon = iconName && icons[iconName] ? icons[iconName] : HelpCircle;
  return <Icon className="w-5 h-5" />;
};

export default function CreateTicketModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { data: categories, isLoading: catsLoading } = useTicketCategories();
  const createMutation = useCreateTicket();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    categoryId: '',
    subject: '',
    description: '',
    relatedOrderId: '',
  });

  const [faqSearch, setFaqSearch] = useState('');

  if (!isOpen) return null;

  const handleCreate = () => {
    createMutation.mutate(formData, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col relative animate-in slide-in-from-bottom-8 duration-500">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50 sticky top-0 z-10 rounded-t-3xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create Support Case</h2>
            <p className="text-sm text-gray-500 mt-1">Our enterprise support team is here to help.</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-blue-900 mb-2">Search Knowledge Base</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5" />
                  <Input 
                    placeholder="Search FAQs before creating a ticket..." 
                    className="w-full bg-white border-blue-200 pl-10 h-12 focus:ring-blue-500 focus:border-blue-500"
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Select Category</h3>
                {catsLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>)}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categories?.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => {
                          setFormData({ ...formData, categoryId: cat.id });
                          setStep(2);
                        }}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 text-center ${formData.categoryId === cat.id ? 'border-blue-600 bg-blue-50/50' : 'border-gray-100 hover:border-blue-300 hover:bg-gray-50'}`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${formData.categoryId === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                          {getIcon(cat.icon)}
                        </div>
                        <span className={`font-semibold text-sm ${formData.categoryId === cat.id ? 'text-blue-900' : 'text-gray-700'}`}>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <button onClick={() => setStep(1)} className="text-sm font-semibold text-blue-600 hover:underline flex items-center mb-4">
                ← Back to Categories
              </button>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">Subject</label>
                  <Input 
                    placeholder="Brief summary of the issue" 
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="h-12 border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5 flex justify-between">
                    <span>Link an Order (Optional)</span>
                    <span className="text-xs font-normal text-gray-400">Helps us resolve faster</span>
                  </label>
                  <select 
                    className="w-full h-12 rounded-lg border border-gray-200 bg-white px-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={formData.relatedOrderId}
                    onChange={e => setFormData({ ...formData, relatedOrderId: e.target.value })}
                  >
                    <option value="">-- Do not link an order --</option>
                    <option value="FX202600045">Order FX202600045 - USD 1,000</option>
                    <option value="FX202600042">Order FX202600042 - EUR 500</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">Description</label>
                  <Textarea 
                    placeholder="Please provide as much detail as possible..." 
                    className="min-h-[150px] border-gray-200 focus:ring-blue-500 focus:border-blue-500 resize-none p-4"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                <Button variant="outline" onClick={onClose} className="h-12 px-6">Cancel</Button>
                <Button 
                  onClick={handleCreate} 
                  disabled={!formData.subject || !formData.description || createMutation.isPending}
                  className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  {createMutation.isPending ? 'Creating...' : 'Submit Case'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
