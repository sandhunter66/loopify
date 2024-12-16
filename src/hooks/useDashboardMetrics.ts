import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface CustomerMetrics {
  id: string;
  total_spent: number;
  store_id: string;
}

interface DashboardMetrics {
  totalCustomers: number;
  totalSales: number;
  pendingPayments: number;
  isLoading: boolean;
  error: string | null;
}

export function useDashboardMetrics(storeId = 'all') {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalCustomers: 0,
    totalSales: 0,
    pendingPayments: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Get customers count
        let customerQuery = supabase
          .from('customers')
          .select('*', { count: 'exact', head: true });

        if (storeId !== 'all') {
          customerQuery = customerQuery.eq('store_id', storeId);
        }

        const { count: customerCount, error: customerError } = await customerQuery;
        if (customerError) throw customerError;

        // Get total sales
        let salesQuery = supabase
          .from('customers')
          .select('id, total_spent, store_id');

        if (storeId !== 'all') {
          salesQuery = salesQuery.eq('store_id', storeId);
        }

        const { data: customers, error: salesError } = await salesQuery;
        if (salesError) throw salesError;

        const totalSales = (customers || []).reduce((sum, customer) => 
          sum + (parseFloat(customer.total_spent) || 0), 0);

        // Get pending payments
        let pendingQuery = supabase
          .from('orders')
          .select('total_amount, store_id')
          .eq('status', 'pending');

        if (storeId !== 'all') {
          pendingQuery = pendingQuery.eq('store_id', storeId);
        }

        const { data: pendingOrders, error: pendingError } = await pendingQuery;
        if (pendingError) throw pendingError;

        const pendingPayments = (pendingOrders || []).reduce((sum, order) => 
          sum + (parseFloat(order.total_amount) || 0), 0);

        setMetrics({
          totalCustomers: customerCount || 0,
          totalSales,
          pendingPayments,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
        setMetrics(prev => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Error fetching dashboard metrics',
        }));
      }
    };

    fetchMetrics();
  }, [storeId]);

  return metrics;
}