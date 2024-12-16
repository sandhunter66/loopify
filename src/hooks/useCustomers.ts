import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Customer } from '../types/customer';

interface UseCustomersResult {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCustomers(storeId: string, searchQuery: string) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      // Handle empty store selection
      if (!storeId || storeId === '') {
        setCustomers([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      const query = supabase
        .from('customers')
        .select(`
          *,
          store:stores(name)
        `)
        .order('created_at', { ascending: false });

      // Only filter by store if not "all"
      if (storeId !== 'all') {
        query.eq('store_id', storeId);
      }

      if (searchQuery) {
        query.or(
          `first_name.ilike.%${searchQuery}%,` +
          `last_name.ilike.%${searchQuery}%,` +
          `email.ilike.%${searchQuery}%,` +
          `phone.ilike.%${searchQuery}%`
        );
      }

      const { data, error: err } = await query;

      if (err) throw err;

      setCustomers(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err instanceof Error ? err.message : 'Error fetching customers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [storeId, searchQuery]);

  return { customers, isLoading, error, refetch: fetchCustomers };
}