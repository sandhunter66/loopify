import React, { useState, useEffect } from 'react';
import { ArrowLeft, Link, Store, RefreshCw } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { fetchWooCommerceCustomers, syncCustomersToSupabase } from '../../../services/wooCommerceService';
import toast from 'react-hot-toast';

interface WooCommerceIntegrationViewProps {
  onBack: () => void;
}

export function WooCommerceIntegrationView({ onBack }: WooCommerceIntegrationViewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedStore, setSelectedStore] = useState('');
  const [stores, setStores] = useState<Array<{
    id: string;
    name: string;
    url?: string;
    woo_consumer_key?: string;
    woo_consumer_secret?: string;
  }>>([]);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const { data: storesData, error } = await supabase
        .from('stores')
        .select('id, name, url, woo_consumer_key, woo_consumer_secret');

      if (error) throw error;
      setStores(storesData || []);
      
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
    const url = formData.get('url') as string;
    const consumerKey = formData.get('consumerKey') as string;
    const consumerSecret = formData.get('consumerSecret') as string;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('stores')
        .update({
          url,
          woo_consumer_key: consumerKey,
          woo_consumer_secret: consumerSecret
        })
        .eq('id', selectedStore);

      if (error) throw error;

      toast.success('WooCommerce settings updated successfully');
      await fetchStores();
    } catch (error) {
      console.error('Error updating WooCommerce settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSync = async () => {
    const store = stores.find(s => s.id === selectedStore);
    if (!store?.url || !store?.woo_consumer_key || !store?.woo_consumer_secret) {
      toast.error('Please configure WooCommerce settings first');
      return;
    }

    setIsSyncing(true);
    let toastId = toast.loading('Starting sync...');

    try {
      const customers = await fetchWooCommerceCustomers({
        url: store.url,
        consumerKey: store.woo_consumer_key,
        consumerSecret: store.woo_consumer_secret
      });

      toast.loading('Fetched customers, syncing to database...', { id: toastId });

      await syncCustomersToSupabase(store.id, customers);
      toast.success(`Successfully synced ${customers.length} customers`, { id: toastId });
    } catch (error) {
      console.error('Error syncing customers:', error);
      toast.error('Failed to sync customers: ' + (error instanceof Error ? error.message : 'Unknown error'), { id: toastId });
    } finally {
      setIsSyncing(false);
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
            <div className="p-2 bg-blue-100 rounded-lg">
              <Link className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-xl font-semibold">WooCommerce Integration</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Store
              </label>
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                WooCommerce Store URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Store className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  name="url"
                  required
                  defaultValue={selectedStoreData?.url || ''}
                  className="w-full pl-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://your-store.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Consumer Key
              </label>
              <input
                type="text"
                name="consumerKey"
                required
                defaultValue={selectedStoreData?.woo_consumer_key || ''}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your WooCommerce consumer key"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Consumer Secret
              </label>
              <input
                type="password"
                name="consumerSecret"
                required
                defaultValue={selectedStoreData?.woo_consumer_secret || ''}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your WooCommerce consumer secret"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900">Integration Steps:</h3>
              <ol className="mt-2 text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Go to WooCommerce → Settings → Advanced → REST API</li>
                <li>Click "Add Key" to create new API credentials</li>
                <li>Set permissions to "Read" if you only want to sync customers</li>
                <li>Copy the Consumer Key and Consumer Secret</li>
                <li>Paste them in the fields above</li>
              </ol>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !selectedStore}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  'Save Settings'
                )}
              </button>

              <button
                type="button"
                onClick={handleSync}
                disabled={isSyncing || !selectedStoreData?.url}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSyncing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>Syncing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    <span>Sync Customers</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}