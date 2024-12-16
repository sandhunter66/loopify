import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useStores } from '../../../hooks/useStores';
import { useLoyaltyStampCards } from '../../../hooks/useLoyaltyStampCards';
import toast from 'react-hot-toast';
import { StampCard } from './StampCard';
import { StampSetupForm } from './StampSetupForm';

interface LoyaltyStampViewProps {
  onBack: () => void;
}

export interface StampCardConfig {
  totalStamps: number;
  minSpendPerStamp: number;
  reward: string;
  terms: string;
  eventName: string;
  eventLocation: string;
  startDate: string;
  endDate: string;
}

export function LoyaltyStampView({ onBack }: LoyaltyStampViewProps) {
  const { stores } = useStores();
  const [selectedStore, setSelectedStore] = useState<string>('');
  const { cards, refetch } = useLoyaltyStampCards(selectedStore);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState<StampCardConfig | null>(null);


  const isFormValid = Boolean(
    selectedStore &&
    config?.eventName &&
    config?.reward &&
    config?.startDate &&
    config?.endDate
  );

  // Load existing card configuration when store is selected
  useEffect(() => {
    if (selectedStore && cards.length > 0) {
      const existingCard = cards[0]; // Get the most recent card
      setConfig({
        totalStamps: existingCard.total_stamps,
        minSpendPerStamp: existingCard.min_spend_per_stamp || 0,
        minSpendPerStamp: existingCard.min_spend_per_stamp || 0,
        eventName: existingCard.promotion_name,
        eventLocation: existingCard.tagline || '',
        reward: existingCard.reward,
        terms: existingCard.terms || '',
        startDate: existingCard.start_date || '',
        endDate: existingCard.end_date || ''
      });
    } else {
      // Set empty values with null for new cards
      setConfig({
        totalStamps: 12, // Default to 12 stamps
        minSpendPerStamp: 0,
        minSpendPerStamp: 0,
        reward: '',
        terms: '',
        eventName: '',
        eventLocation: '',
        startDate: '',
        endDate: ''
      });
    }
  }, [selectedStore, cards]);

  const handleSave = async () => {
    if (!selectedStore || !config) {
      toast.error('Please select a store');
      return;
    }

    // Validate total stamps before saving
    const totalStamps = parseInt(config.totalStamps as any) || 12;
    if (totalStamps < 4 || totalStamps > 20) {
      toast.error('Number of stamps must be between 4 and 20');
      return;
    }

    // Validate dates
    if (!config.startDate || !config.endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    const startDate = new Date(config.startDate);
    const endDate = new Date(config.endDate);

    if (endDate < startDate) {
      toast.error('End date must be after start date');
      return;
    }

    setIsSaving(true);
    try {
      const existingCard = cards.find(card => card.store_id === selectedStore);
      const timestamp = new Date().toISOString();
      const cardData = {
        store_id: selectedStore,
        promotion_name: config.eventName,
        min_spend_per_stamp: config.minSpendPerStamp || 0,
        tagline: config.eventLocation,
        min_spend_per_stamp: config.minSpendPerStamp || 0,
        total_stamps: totalStamps,
        reward: config.reward,
        terms: config.terms,
        start_date: config.startDate,
        end_date: config.endDate,
        updated_at: timestamp
      };
      
      let error;
      if (existingCard) {
        // Update existing card
        const { error: updateError } = await supabase
          .from('loyalty_stamp_cards')
          .update(cardData)
          .eq('id', existingCard.id);
        error = updateError;
      } else {
        // Create new card
        const { error: insertError } = await supabase
          .from('loyalty_stamp_cards')
          .insert({
            ...cardData,
            created_at: timestamp
          });
        error = insertError;
      }

      if (error) throw error;
      
      toast.success(existingCard ? 'Card updated successfully' : 'New card created successfully');
      refetch();
    } catch (error) {
      console.error('Error saving loyalty stamp card:', error);
      toast.error('Failed to save loyalty stamp card');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-40">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tools</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Loyalty Stamp Card Setup</h1>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="text-sm text-gray-500">
              {cards.length} card{cards.length !== 1 ? 's' : ''} configured
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
            
            <button
              onClick={handleSave}
              disabled={isSaving || !selectedStore}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm
                hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Card'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Setup Form */}
          <div>
            {config && (
              <StampSetupForm
                config={config}
                onChange={setConfig}
                onSave={handleSave}
                isSaving={isSaving}
                isValid={isFormValid}
              />
            )}
          </div>

          {/* Live Preview */}
          <div className="xl:sticky xl:top-8 order-first xl:order-last mb-20">
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
              <h2 className="font-medium text-gray-900">Live Preview</h2>
              <p className="text-sm text-gray-500">This is how your loyalty card will appear to customers</p>
            </div>
            {config && <StampCard config={config} />}
          </div>
        </div>
      </div>
    </div>
  );
}