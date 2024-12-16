import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface TopCustomer {
  id: string;
  name: string;
  phone: string;
  total_purchases: number;
  total_spent: number;
  last_purchase: string;
}

interface UseTopCustomersResult {
  customers: TopCustomer[];
  isLoading: boolean;
  error: string | null;
}

export function useTopCustomers(storeId = 'all') {
  const [result, setResult] = useState<UseTopCustomersResult>({
    customers: [],
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const fetchTopCustomers = async () => {
      setResult(prev => ({ ...prev, isLoading: true }));

      try {
        let query = supabase
          .from('customers')
          .select(`
            id,
            first_name,
            last_name,
            phone,
            total_spent,
            orders_count,
            last_order_date
          `)
          .not('total_spent', 'eq', 0)
          .not('last_order_date', 'is', null)
          .order('orders_count', { ascending: false });

        if (storeId !== 'all') {
          query = query.eq('store_id', storeId);
        }

        const { data, error: err } = await query.limit(5);

        if (err) throw err;

        const formattedCustomers = data?.map(customer => ({
          id: customer.id,
          name: `${customer.first_name} ${customer.last_name}`,
          phone: customer.phone,
          total_purchases: parseInt(customer.orders_count) || 0,
          total_spent: parseFloat(customer.total_spent) || 0,
          last_purchase: customer.last_order_date,
        })) || [];

        setResult({
          customers: formattedCustomers,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        console.error('Error fetching top customers:', err);
        setResult(prev => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Error fetching top customers',
        }));
      }
    };

    fetchTopCustomers();
  }, [storeId]);

  return result;
}