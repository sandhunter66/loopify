import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { Store } from '../types/store';

const PLAN_STORE_LIMITS = {
  basic: 1,
  premium: 3,
  enterprise: 6
};

interface UseStoresResult {
  stores: Store[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  canAddStore: boolean;
  storeLimit: number;
}

export function useStores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<string>('basic');
  const [storeLimit, setStoreLimit] = useState<number>(1);

  const fetchStores = async () => {
    setIsLoading(true);
    try {
      // First get the user's plan
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('plan')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;
      
      const plan = userData?.plan || 'basic';
      setUserPlan(plan);
      setStoreLimit(PLAN_STORE_LIMITS[plan as keyof typeof PLAN_STORE_LIMITS]);

      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      setStores(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching stores:', err);
      setError(err instanceof Error ? err.message : 'Error fetching stores');
      setStores([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const canAddStore = stores.length < storeLimit;

  return { 
    stores, 
    isLoading, 
    error, 
    refetch: fetchStores,
    canAddStore,
    storeLimit
  };
}