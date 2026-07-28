import React from 'react';
import { CheckCircle2, Circle, Clock, FileCheck, Shield, Sparkles, Inbox, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Order {
  status: string;
  complianceStatus?: string;
  currentStage?: string;
  deliveryMethod?: string;
  fulfillmentStatus?: string;
  requiresKyc?: boolean;
  requiresInventory?: boolean;
  requiresPickupHandover?: boolean;
  requiresDelivery?: boolean;
  history?: any[];
}

export function StatusTimeline({ order }: { order: Order }) {
  const currentStatus = order.status;
  const compliance = order.complianceStatus || 'PENDING';
  const stage = order.currentStage || 'KYC_STAGE';

  // 1. Determine KYC Status
  const kycCompleted = compliance === 'APPROVED' || compliance === 'VERIFIED' || stage !== 'KYC_STAGE';
  const kycCurrent = stage === 'KYC_STAGE' && !kycCompleted;

  // 2. Determine Compliance Review
  const complianceCompleted = compliance === 'APPROVED' || compliance === 'VERIFIED';
  const complianceCurrent = kycCompleted && !complianceCompleted;

  // 3. Determine Prep Status (only active if compliance is cleared)
  const prepCompleted = complianceCompleted && stage !== 'PREP_STAGE' && stage !== 'KYC_STAGE';
  const prepCurrent = complianceCompleted && stage === 'PREP_STAGE';

  // 4. Determine Handover Status
  const handoverCompleted = currentStatus === 'COMPLETED' || currentStatus === 'DELIVERED';
  const handoverCurrent = prepCompleted && !handoverCompleted && stage === 'FULFILLMENT_STAGE';

  // 5. Overall Completed
  const isCompleted = currentStatus === 'COMPLETED' || currentStatus === 'DELIVERED';

  const getFulfillmentDescription = () => {
    const isPickup = order.deliveryMethod === 'PICKUP' || order.deliveryMethod === 'STORE_PICKUP';
    
    if (stage === 'INVENTORY_STAGE') {
      return isPickup ? 'Preparing Cash' : 'Preparing Delivery';
    }
    
    if (stage === 'FULFILLMENT_STAGE') {
      if (isPickup) {
        return (order.fulfillmentStatus === 'ASSIGNED_TO_CASHIER' || (order as any).complianceLocked || (order as any).currentStage === 'BRANCH_EXECUTION_STAGE')
          ? 'Ready For Pickup' 
          : 'Preparing Cash';
      } else {
        return order.fulfillmentStatus === 'ASSIGNED_TO_DELIVERY' 
          ? 'Out For Delivery' 
          : 'Preparing Delivery';
      }
    }
    
    if (currentStatus === 'COMPLETED' || currentStatus === 'DELIVERED') {
      return 'Completed';
    }
    
    return isPickup ? 'Preparing Cash' : 'Preparing Delivery';
  };

  const isSell = order.status === 'CASH_SELL' || (order as any).productType === 'CASH_SELL';

  const steps = isSell ? [
    {
      label: 'Submitted & KYC',
      description: 'Order placed, awaiting customer identity verification',
      completed: kycCompleted,
      current: kycCurrent,
      icon: Inbox
    },
    {
      label: 'Compliance Review',
      description: 'Reviewing compliance documents and security regulations',
      completed: complianceCompleted,
      current: complianceCurrent,
      icon: Shield
    },
    {
      label: 'Fulfillment Handover',
      description: getFulfillmentDescription(),
      completed: handoverCompleted,
      current: handoverCurrent,
      icon: FileCheck
    },
    {
      label: 'Completed',
      description: 'Transaction fully settled and closed',
      completed: isCompleted,
      current: isCompleted,
      icon: Award
    }
  ] : [
    {
      label: 'Submitted & KYC',
      description: 'Order placed, awaiting customer identity verification',
      completed: kycCompleted,
      current: kycCurrent,
      icon: Inbox
    },
    {
      label: 'Compliance Review',
      description: 'Reviewing against LRS limits and security regulations',
      completed: complianceCompleted,
      current: complianceCurrent,
      icon: Shield
    },
    {
      label: 'Branch Prep & Allocation',
      description: 'Reserving physical currency notes / forex cards from branch inventory',
      completed: prepCompleted,
      current: prepCurrent,
      icon: Sparkles
    },
    {
      label: 'Fulfillment Handover',
      description: getFulfillmentDescription(),
      completed: handoverCompleted,
      current: handoverCurrent,
      icon: FileCheck
    },
    {
      label: 'Completed',
      description: 'Transaction fully settled and closed',
      completed: isCompleted,
      current: isCompleted,
      icon: Award
    }
  ];

  return (
    <div className="py-4">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-5 top-2.5 h-[90%] w-0.5 bg-gray-100" />
        
        <div className="space-y-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="relative flex gap-5 group">
                {/* Circle Icon Container */}
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center relative z-10 shrink-0 transition-all duration-300 shadow-sm",
                  step.completed 
                    ? "bg-emerald-500 text-white" 
                    : step.current 
                      ? "bg-blue-600 text-white ring-4 ring-blue-100" 
                      : "bg-white border-2 border-gray-200 text-gray-400 group-hover:border-gray-300"
                )}>
                  {step.completed ? (
                    <CheckCircle2 className="w-5.5 h-5.5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                {/* Step Metadata */}
                <div className="pt-0.5">
                  <p className={cn(
                    "text-sm font-bold transition-colors",
                    step.completed ? "text-emerald-700" : step.current ? "text-blue-600" : "text-gray-600"
                  )}>
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 font-medium leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

