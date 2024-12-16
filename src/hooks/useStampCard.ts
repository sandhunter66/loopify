import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { sendStampNotification } from '../services/whatsappService';
import toast from 'react-hot-toast';

interface LoyaltyCard {
  id: string;
  customer_id: string;
  store_id: string;
  stamps: number;
  created_at: string;
  updated_at: string;
}

export function useStampCard() {
  const [isLoading, setIsLoading] = useState(false);

  const addStamp = useCallback(async (
    storeId: string,
    customerId: string,
    currentStamps: number,
    totalStamps: number
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Check for existing loyalty card
      const { data: existingCard, error: fetchError } = await supabase
        .from('loyalty_cards')
        .select('*')
        .eq('customer_id', customerId)
        .eq('store_id', storeId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw new Error('Failed to check loyalty card');

      const newStamps = currentStamps + 1;
      const timestamp = new Date().toISOString();

      if (!existingCard) {
        // Create new loyalty card
        const { error: createError } = await supabase
          .from<LoyaltyCard>('loyalty_cards')
          .insert({
            customer_id: customerId,
            store_id: storeId,
            stamps: newStamps,
            created_at: timestamp,
            updated_at: timestamp
          });

        if (createError) throw new Error('Failed to create loyalty card');
      } else {
        // Update existing card
        const { error: updateError } = await supabase
          .from<LoyaltyCard>('loyalty_cards')
          .update({ 
            stamps: newStamps,
            updated_at: timestamp
          })
          .eq('id', existingCard.id);

        if (updateError) throw new Error('Failed to update loyalty card');

        // Check if customer earned reward
        if (newStamps >= totalStamps) {
          toast.success('🎉 Congratulations! You\'ve earned a reward!');
        }
      }

      // Send WhatsApp notification
      await sendStampNotification(
        storeId,
        customerId,
        newStamps,
        totalStamps
      );

      toast.success('Stamp added successfully');
      return true;
    } catch (error) {
      console.error('Error adding stamp:', error);
      toast.error('Failed to add stamp');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { addStamp, isLoading };
}