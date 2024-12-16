import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface LoyaltyStampCard {
  id: string;
  store_id: string;
  promotion_name: string;
  tagline: string;
  min_spend_per_stamp: number;
  total_stamps: number;
  reward: string;
  terms: string;
  created_at: string;
  updated_at: string;
}

export function useLoyaltyStampCards(storeId?: string) {
  const [cards, setCards] = useState<LoyaltyStampCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = async () => {
    try {
      let query = supabase
        .from('loyalty_stamp_cards')
        .select('*')
        .order('created_at', { ascending: false });

      if (storeId) {
        query = query.eq('store_id', storeId);
      }

      const { data, error: err } = await query;

      if (err) throw err;

      setCards(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching loyalty stamp cards:', err);
      setError(err instanceof Error ? err.message : 'Error fetching loyalty stamp cards');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [storeId]);

  return { cards, isLoading, error, refetch: fetchCards };
}