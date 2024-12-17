import React, { useState } from 'react';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useStores } from '../../../hooks/useStores';
import { FlowList } from './FlowList';
import { FlowEditor } from './FlowEditor';

interface WhatsAppFollowupViewProps {
  onBack: () => void;
}

type ViewState = 'list' | 'create' | 'edit';

export function WhatsAppFollowupView({ onBack }: WhatsAppFollowupViewProps) {
  const [selectedStore, setSelectedStore] = useState<string>('');
  const { stores } = useStores();
  const [view, setView] = useState<ViewState>('list');
  const [selectedFlowId, setSelectedFlowId] = useState<string | undefined>();

  const handleBack = () => {
    if (view === 'list') {
      onBack();
    } else {
      setView('list');
      setSelectedFlowId(undefined);
    }
  };

  const handleCreateFlow = () => {
    setSelectedFlowId(undefined);
    setView('create');
  };

  const handleEditFlow = (flowId: string) => {
    setSelectedFlowId(flowId);
    setView('edit');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {view === 'list' ? 'Tools' : 'Flows'}</span>
        </button>

        {view === 'list' ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">WhatsApp Follow-up</h1>
                <p className="mt-1 text-gray-500">
                  Create automated follow-up flows to engage with your customers
                </p>
              </div>

              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Select a store</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>

            {!selectedStore ? (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a Store
                </h3>
                <p className="text-gray-500">
                  Choose a store to view and manage its WhatsApp follow-up flows
                </p>
              </div>
            ) : (
              <FlowList
                storeId={selectedStore}
                onCreateFlow={handleCreateFlow}
                onEditFlow={handleEditFlow}
              />
            )}
          </>
        ) : (
          <FlowEditor
            storeId={selectedStore}
            flowId={selectedFlowId}
            onBack={() => setView('list')}
          />
        )}
      </div>
    </div>
  );
}