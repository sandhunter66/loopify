import React from 'react';
import { Plus, MessageCircle } from 'lucide-react';
import { useWhatsAppFlows } from '../../../hooks/useWhatsAppFlows';
import { useStores } from '../../../hooks/useStores';
import { FlowCard } from './FlowCard';

interface FlowListProps {
  storeId: string;
  onCreateFlow: () => void;
  onEditFlow: (flowId: string) => void;
}

export function FlowList({ storeId, onCreateFlow, onEditFlow }: FlowListProps) {
  const { flows, isLoading, error } = useWhatsAppFlows(storeId);
  const { stores } = useStores();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white p-6 rounded-lg shadow-sm">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        Error loading flows: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={onCreateFlow}
        className="w-full bg-white p-6 rounded-lg shadow-sm border-2 border-dashed border-gray-300 hover:border-blue-500 hover:shadow-md transition-all duration-200"
      >
        <div className="flex flex-col items-center gap-2 text-gray-600 hover:text-blue-600">
          <Plus className="w-8 h-8" />
          <span className="font-medium">Create New Flow</span>
        </div>
      </button>

      {flows.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Follow-up Flows Yet
          </h3>
          <p className="text-gray-500 mb-6">
            Create your first WhatsApp follow-up flow to start engaging with customers automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {flows.map((flow) => (
            <FlowCard
              key={flow.id}
              flow={flow}
              onClick={() => onEditFlow(flow.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}