import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, Key, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';

interface WhatsAppApiViewProps {
  onBack: () => void;
}

export function WhatsAppApiView({ onBack }: WhatsAppApiViewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedStore, setSelectedStore] = useState('');
  const [stores, setStores] = useState<Array<{id: string, name: string, api_key?: string}>>([]);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const { data: storesData, error } = await supabase
        .from('stores')
        .select('id, name, api_key');

      if (error) throw error;
      setStores(storesData || []);
      
      // Auto-select first store if only one exists
      if (storesData?.length === 1) {
        setSelectedStore(storesData[0].id);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Failed to load stores');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStore) {
      toast.error('Please select a store');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const apiKey = formData.get('apiKey') as string;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('stores')
        .update({ api_key: apiKey })
        .eq('id', selectedStore);

      if (error) throw error;

      toast.success('WhatsApp API key updated successfully');
      await fetchStores(); // Refresh stores data
    } catch (error) {
      console.error('Error updating API key:', error);
      toast.error('Failed to update API key');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedStoreData = stores.find(store => store.id === selectedStore);

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="max-w-2xl mx-auto p-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Settings</span>
        </button>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <h1 className="text-xl font-semibold">WhatsApp API Settings</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Store
              </label>
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="">Choose a store</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OnSend.io API Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showApiKey ? 'text' : 'password'}
                  name="apiKey"
                  required
                  defaultValue={selectedStoreData?.api_key || ''}
                  className="w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your OnSend.io API key"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showApiKey ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Get your API key from <a href="https://onsend.io/r/loopify" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700">OnSend.io</a>
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900">Important Notes:</h3>
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                <li>• Your API key is securely stored and encrypted</li>
                <li>• Required for sending WhatsApp messages through the platform</li>
                <li>• Message charges are based on OnSend.io's pricing</li>
              </ul>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !selectedStore}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  'Save API Key'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}