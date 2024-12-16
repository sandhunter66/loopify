import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface LoyaltyPointsConfig {
  id: string;
  store_id: string;
  points_per_rm: number;
  reward_description: string;
  terms: string;
  min_spend: number;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export function useLoyaltyPoints(storeId?: string) {
  const [config, setConfig] = useState<LoyaltyPointsConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
    if (!storeId) {
      setConfig(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: err } = await supabase
        .from('loyalty_points_config')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (err) {
        if (err.code === 'PGRST116') {
          // No data found - this is fine
          setConfig(null);
        } else {
          throw err;
        }
      } else {
        setConfig(data);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching loyalty points config:', err);
      setError(err instanceof Error ? err.message : 'Error fetching config');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [storeId]);

  return { config, isLoading, error, refetch: fetchConfig };
}