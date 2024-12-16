import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Customer } from '../types/customer';

export interface LuckyDrawPrize {
  id: string;
  name: string;
  description: string;
  quantity: number;
  remaining_quantity: number;
  probability: number;
}

export interface LuckyDrawCampaign {
  id: string;
  store_id: string;
  name: string;
  description: string;
  min_spend: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  prizes?: LuckyDrawPrize[];
}

export interface LuckyDrawWinner extends Customer {
  prize_name: string;
}

export function useLuckyDraw(storeId?: string) {
  const [campaigns, setCampaigns] = useState<LuckyDrawCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eligibleCustomers, setEligibleCustomers] = useState<Customer[]>([]);

  const fetchEligibleCustomers = async (minSpend: number) => {
    if (!storeId) return [];
    
    try {
      const { data, error: err } = await supabase
        .from('customers')
        .select('*')
        .eq('store_id', storeId)
        .gte('total_spent', minSpend)
        .order('last_order_date', { ascending: false });

      if (err) throw err;
      setEligibleCustomers(data || []);
      return data || [];
    } catch (err) {
      console.error('Error fetching eligible customers:', err);
      return [];
    }
  };

  const fetchCampaigns = async () => {
    if (!storeId) {
      setCampaigns([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: err } = await supabase
        .from('lucky_draw_campaigns')
        .select(`
          *,
          prizes:lucky_draw_prizes(*)
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (err) throw err;
      setCampaigns(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching lucky draw campaigns:', err);
      setError(err instanceof Error ? err.message : 'Error fetching campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [storeId]);

  return { 
    campaigns, 
    isLoading, 
    error, 
    refetch: fetchCampaigns,
    fetchEligibleCustomers,
    eligibleCustomers 
  };
}