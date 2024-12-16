import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Transaction {
  id: string;
  customer_name: string;
  amount: number;
  created_at: string;
  store_name: string;
}

export function useRecentTransactions(storeId = 'all') {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        let query = supabase.from('customers').select(`
          id,
          first_name,
          last_name,
          total_spent,
          last_order_amount,
          last_order_date,
          store:stores (
            name
          )
        `).not('last_order_date', 'is', null)
          .not('last_order_amount', 'eq', 0)
          .order('last_order_date', { ascending: false });

        if (storeId !== 'all') {
          query = query.eq('store_id', storeId);
        }

        query = query.limit(5);

        const { data, error: err } = await query;

        if (err) throw err;

        const formattedTransactions = (data || []).map(customer => ({
            id: customer.id,
            customer_name: `${customer.first_name} ${customer.last_name}`,
            amount: Number(customer.last_order_amount),
            created_at: customer.last_order_date,
            store_name: customer.store?.name || 'Unknown Store'
          }));

        setTransactions(formattedTransactions);
        setError(null);
      } catch (err) {
        console.error('Error fetching recent transactions:', err);
        setError(err instanceof Error ? err.message : 'Error fetching transactions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [storeId]);

  return { transactions, isLoading, error };
}