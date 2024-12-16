import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, Clock, Store } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useStores } from '../../../hooks/useStores';
import toast from 'react-hot-toast';
import { FollowupSettings } from './FollowupSettings';
import { MessagePreview } from './MessagePreview';

interface WhatsAppFollowupViewProps {
  onBack: () => void;
}

export interface FollowupConfig {
  store_id: string;
  new_customer_enabled: boolean;
  new_customer_delay: number;
  new_customer_message: string;
  pending_payment_enabled: boolean;
  pending_payment_delay: number;
  pending_payment_message: string;
}

export function WhatsAppFollowupView({ onBack }: WhatsAppFollowupViewProps) {
  const { stores } = useStores();
  const [selectedStore, setSelectedStore] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState<FollowupConfig>({
    store_id: '',
    new_customer_enabled: false,
    new_customer_delay: 1,
    new_customer_message: 'Hi {first_name}, thank you for your purchase! We hope you enjoy your items.',
    pending_payment_enabled: false,
    pending_payment_delay: 1,
    pending_payment_message: 'Hi {first_name}, we noticed your payment is still pending. Need help?'
  });

  useEffect(() => {
    if (selectedStore) {
      fetchConfig();
    }
  }, [selectedStore]);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_followup_config')
        .select('*')
        .eq('store_id', selectedStore)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No config found, create default
          const { data: newConfig, error: insertError } = await supabase
            .from('whatsapp_followup_config')
            .insert({
              store_id: selectedStore,
              new_customer_enabled: false,
              new_customer_delay: 1,
              new_customer_message: 'Hi {first_name}, thank you for your purchase! We hope you enjoy your items.',
              pending_payment_enabled: false,
              pending_payment_delay: 1,
              pending_payment_message: 'Hi {first_name}, we noticed your payment is still pending. Need help?'
            })
            .select()
            .single();

          if (insertError) throw insertError;
          setConfig(newConfig);
        } else {
          throw error;
        }
      } else {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error fetching followup config:', error);
      toast.error('Failed to load configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedStore) {
      toast.error('Please select a store');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('whatsapp_followup_config')
        .upsert({
          ...config,
          store_id: selectedStore,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving followup config:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
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
            <h1 className="text-xl font-semibold">WhatsApp Auto-followup</h1>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Store *
              </label>
              <div className="relative">
                <Store className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
            </div>

            {selectedStore && !isLoading && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* New Customer Settings */}
                  <FollowupSettings
                    title="New Customer Follow-up"
                    description="Send a welcome message to new customers"
                    config={{
                      enabled: config.new_customer_enabled,
                      delay: config.new_customer_delay,
                      message: config.new_customer_message
                    }}
                    onChange={(newConfig) => setConfig(prev => ({
                      ...prev,
                      new_customer_enabled: newConfig.enabled,
                      new_customer_delay: newConfig.delay,
                      new_customer_message: newConfig.message
                    }))}
                  />

                  {/* Pending Payment Settings */}
                  <FollowupSettings
                    title="Pending Payment Follow-up"
                    description="Send a reminder for pending payments"
                    config={{
                      enabled: config.pending_payment_enabled,
                      delay: config.pending_payment_delay,
                      message: config.pending_payment_message
                    }}
                    onChange={(newConfig) => setConfig(prev => ({
                      ...prev,
                      pending_payment_enabled: newConfig.enabled,
                      pending_payment_delay: newConfig.delay,
                      pending_payment_message: newConfig.message
                    }))}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Message Previews */}
                  {config.new_customer_enabled && (
                    <MessagePreview
                      title="New Customer Message Preview"
                      message={config.new_customer_message}
                      delay={config.new_customer_delay}
                    />
                  )}
                  {config.pending_payment_enabled && (
                    <MessagePreview
                      title="Pending Payment Message Preview"
                      message={config.pending_payment_message}
                      delay={config.pending_payment_delay}
                    />
                  )}
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4" />
                        <span>Save Auto-followup Settings</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}