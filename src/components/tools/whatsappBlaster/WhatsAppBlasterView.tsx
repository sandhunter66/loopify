import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, Store, Send } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useCustomers } from '../../../hooks/useCustomers';
import { sendTextMessage } from '../../../services/onsendService';
import toast from 'react-hot-toast';

interface WhatsAppBlasterViewProps {
  onBack: () => void;
}

export function WhatsAppBlasterView({ onBack }: WhatsAppBlasterViewProps) {
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [stores, setStores] = useState<Array<{
    id: string, 
    name: string, 
    api_key?: string,
    whatsapp_interval: number
  }>>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { customers, isLoading } = useCustomers(selectedStore, '');
  const [messageInterval, setMessageInterval] = useState<30 | 60>(30);
  const [formData, setFormData] = useState({
    message: '',
  });
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    // Update interval when store is selected
    const store = stores.find(s => s.id === selectedStore);
    if (store?.whatsapp_interval) {
      setMessageInterval(store.whatsapp_interval);
    }
  }, [selectedStore, stores]);

  const fetchStores = async () => {
    try {
      const { data: storesData, error } = await supabase
        .from('stores')
        .select('id, name, api_key, whatsapp_interval')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStores(storesData?.map(store => ({
        ...store,
        whatsapp_interval: store.whatsapp_interval || 30
      })) || []);
      
      // Auto-select first store if only one exists
      if (storesData?.length === 1) {
        setSelectedStore(storesData[0].id);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Failed to load stores');
    }
  };

  const filteredCustomers = customers.filter(customer => {
    if (!startDate && !endDate) return true;
    
    if (!customer.last_order_date) return false;
    
    // Convert to UTC+8 (Kuala Lumpur timezone)
    const orderDate = new Date(customer.last_order_date);
    orderDate.setHours(orderDate.getHours() + 8);
    const orderDateStr = orderDate.toISOString().slice(0, 10);
    
    // Compare date strings (YYYY-MM-DD format)
    return (!startDate || orderDateStr >= startDate) && 
           (!endDate || orderDateStr <= endDate);
  });

  const handleIntervalChange = async (interval: 30 | 60) => {
    if (!selectedStore) return;
    
    try {
      const { error } = await supabase
        .from('stores')
        .update({ whatsapp_interval: interval })
        .eq('id', selectedStore);

      if (error) throw error;
      setMessageInterval(interval);

      setStores(prev => prev.map(store => 
        store.id === selectedStore 
          ? { ...store, whatsapp_interval: interval }
          : store
      ));

      toast.success('Message interval updated');
    } catch (error) {
      console.error('Error updating interval:', error);
      toast.error('Failed to update message interval');
      // Revert on error
      setMessageInterval(stores.find(s => s.id === selectedStore)?.whatsapp_interval || 30);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!selectedStore) {
      toast.error('Please select a store');
      return;
    }

    const store = stores.find(s => s.id === selectedStore);
    if (!store?.api_key) {
      toast.error('Please configure WhatsApp API key in Settings first');
      return;
    }

    if (!formData.message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (filteredCustomers.length === 0) {
      toast.error('No customers selected');
      return;
    }

    setIsSending(true);
    let currentCustomer = 1;
    const totalCustomers = filteredCustomers.length;

    try {
      let successCount = 0;
      let failCount = 0;

      for (const customer of filteredCustomers) {
        try {
          // Update progress
          toast.loading(
            `Sending message ${currentCustomer} of ${totalCustomers}...`,
            { id: 'progress' }
          );

          const apiKey = store.api_key;
          await sendTextMessage(apiKey, customer.phone, formData.message);
          currentCustomer++;

          // Wait for the configured interval before sending next message
          await new Promise(resolve => setTimeout(resolve, messageInterval * 1000));
          
          // Dismiss the progress toast
          toast.dismiss('progress');
          successCount++;
        } catch (error) {
          console.error(`Failed to send message to ${customer.phone}:`, error);
          failCount++;
          currentCustomer++;
        }
      }

      // Show final results
      if (successCount > 0) {
        toast.success(`Successfully sent ${successCount} messages`);
      }
      if (failCount > 0) {
        toast.error(`Failed to send ${failCount} messages`);
      }

      setFormData({ message: '' });
    } catch (error) {
      console.error('Error sending messages:', error);
      toast.error('Failed to send messages');
    } finally {
      setIsSending(false);
      toast.dismiss('progress');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tools</span>
        </button>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <h1 className="text-xl font-semibold">WhatsApp Blaster</h1>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Store *
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
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Interval
              </label>
              <div className="flex gap-4">
                <label className="flex-1">
                  <input
                    type="radio"
                    name="interval"
                    className="sr-only peer"
                    checked={messageInterval === 30}
                    onChange={() => handleIntervalChange(30)} />
                  <div className="p-4 text-center border rounded-lg cursor-pointer peer-checked:border-green-600 peer-checked:bg-green-50 peer-checked:text-green-600 hover:bg-gray-50">
                    <div className="font-medium">30 Seconds</div>
                    <div className="text-sm text-gray-500">Recommended for small batches</div>
                  </div>
                </label>
                <label className="flex-1">
                  <input
                    type="radio"
                    name="interval"
                    className="sr-only peer"
                    checked={messageInterval === 60}
                    onChange={() => handleIntervalChange(60)} />
                  <div className="p-4 text-center border rounded-lg cursor-pointer peer-checked:border-green-600 peer-checked:bg-green-50 peer-checked:text-green-600 hover:bg-gray-50">
                    <div className="font-medium">60 Seconds</div>
                    <div className="text-sm text-gray-500">Safer for large batches</div>
                  </div>
                </label>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Choose a longer interval to reduce the risk of WhatsApp temporary blocks
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600">
                <span className="font-medium">Selected Recipients:</span>{' '}
                {isLoading ? (
                  'Loading...'
                ) : (
                  <>
                    {filteredCustomers.length} customer{filteredCustomers.length === 1 ? '' : 's'}
                    {(startDate || endDate) && (
                      <span className="block mt-1 text-xs">
                        Orders between {startDate || 'any date'} and {endDate || 'any date'} (UTC+8)
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message Content *
                </label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-[200px]"
                  placeholder="Enter your WhatsApp message here..."
                />
                <p className="mt-1 text-sm text-gray-500">
                  Available variables: {'{first_name}'}, {'{last_name}'}, {'{phone}'}
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSending || filteredCustomers.length === 0 || !selectedStore}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send WhatsApp Messages</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}