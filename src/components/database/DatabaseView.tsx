import React, { useState } from 'react';
import { Search, Store, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { CustomerTable } from './CustomerTable';
import { StoreSelector } from './StoreSelector';
import { AddCustomerModal } from './AddCustomerModal';

export function DatabaseView() {
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Customer Database</h1>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Customer</span>
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search customers..."
                className="pl-10 pr-4 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 top-3" />
            </div>
            
            <StoreSelector
              selectedStore={selectedStore}
              onStoreChange={setSelectedStore}
            />
          </div>
        </div>

        <CustomerTable storeFilter={selectedStore} searchQuery={searchQuery} />
        
        <AddCustomerModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            // Force re-render of CustomerTable by changing the key
            setSearchQuery(prev => prev + ' ');
            setTimeout(() => setSearchQuery(prev => prev.trim()), 100);
          }}
        />
      </div>
    </div>
  );
}