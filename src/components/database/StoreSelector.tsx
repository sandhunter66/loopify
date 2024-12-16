import React from 'react';
import { Store } from 'lucide-react';
import { useStores } from '../../hooks/useStores';

interface StoreSelectorProps {
  selectedStore: string;
  onStoreChange: (store: string) => void;
}

export function StoreSelector({ selectedStore, onStoreChange }: StoreSelectorProps) {
  const { stores, isLoading, error } = useStores();

  return (
    <div className="relative w-full sm:w-64">
      <div className="flex items-center">
        <Store className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3" />
        <select
          disabled={isLoading}
          value={selectedStore}
          onChange={(e) => onStoreChange(e.target.value)}
          className="pl-9 sm:pl-10 pr-4 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white w-full"
        >
          <option value="">Select a store</option>
          {!isLoading && stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="mt-1.5 text-xs sm:text-sm text-red-500">{error}</p>}
    </div>
  );
}