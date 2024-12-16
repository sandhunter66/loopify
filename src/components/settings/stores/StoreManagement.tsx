import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { StoreList } from './StoreList';

interface StoreManagementProps {
  onBack: () => void;
}

export function StoreManagement({ onBack }: StoreManagementProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-8 pb-32">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Settings</span>
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Store Management</h1>
          <p className="text-gray-500 mt-2">
            Add, edit, or remove your store locations and manage their WooCommerce integrations.
          </p>
        </div>

        <StoreList />
      </div>
    </div>
  );
}