import React from 'react';
import { MessageCircle, Clock, ChevronRight } from 'lucide-react';
import type { WhatsAppFlow } from '../../../types/whatsapp';

interface FlowCardProps {
  flow: WhatsAppFlow;
  onClick: () => void;
}

const triggerTypeLabels = {
  new_customer: 'New Customer',
  pending_payment: 'Pending Payment',
  abandoned_cart: 'Abandoned Cart'
};

export function FlowCard({ flow, onClick }: FlowCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-left group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <MessageCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{flow.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {triggerTypeLabels[flow.trigger_type]}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3.5 h-3.5" />
                {flow.steps?.length || 0} steps
              </span>
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
      </div>
    </button>
  );
}