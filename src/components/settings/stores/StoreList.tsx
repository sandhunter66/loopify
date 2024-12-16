import React, { useState } from 'react';
import { Edit2, Trash2, Store as StoreIcon } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useStores } from '../../../hooks/useStores';
import type { Store } from '../../../types/store';
import { StoreModal } from './StoreModal';
import toast from 'react-hot-toast';

export function StoreList() {
  const { stores, isLoading, error, refetch, canAddStore, storeLimit } = useStores();
  const [selectedStore, setSelectedStore] = useState<Store | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = async (storeId: string) => {
    if (!confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', storeId);

      if (error) throw error;
      toast.success('Store deleted successfully');
      refetch();
    } catch (error) {
      console.error('Error deleting store:', error);
      toast.error('Failed to delete store');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white p-4 rounded-xl shadow-sm">
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
        Error loading stores: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => {
          if (!canAddStore) {
            toast.error(`Your plan allows a maximum of ${storeLimit} store${storeLimit === 1 ? '' : 's'}. Please upgrade to add more stores.`);
            return;
          }
          setSelectedStore(undefined);
          setIsModalOpen(true);
        }}
        className={`w-full bg-white p-4 rounded-xl shadow-sm transition-all duration-200 border-2 border-dashed ${
          canAddStore 
            ? 'hover:shadow-md border-gray-300 hover:border-blue-500 cursor-pointer' 
            : 'border-red-200 cursor-not-allowed opacity-75'
        } text-center`}
        disabled={!canAddStore}
      >
        <div className="flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600">
          <StoreIcon className="w-5 h-5" />
          <span className="font-medium">
            {canAddStore ? 'Add New Store' : `Store Limit Reached (${stores.length}/${storeLimit})`}
          </span>
        </div>
      </button>

      {stores.map((store) => (
        <div key={store.id} className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{store.name}</h3>
              {store.url && (
                <a
                  href={store.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline mt-1 block"
                >
                  {store.url}
                </a>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedStore(store);
                  setIsModalOpen(true);
                }}
                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(store.id)}
                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {isModalOpen && (
        <StoreModal
          store={selectedStore}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}