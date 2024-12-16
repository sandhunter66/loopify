import { supabase } from '../lib/supabase';

interface CustomerMetrics {
  orders_count: number;
  total_spent: number;
  last_order_amount: number;
  last_order_date: string;
}

export async function updateCustomerMetrics(
  customerId: string, 
  orderAmount: number
): Promise<{ error: Error | null }> {
  try {
    // Get current customer data
    const { data: customer, error: fetchError } = await supabase
      .from('customers')
      .select('orders_count, total_spent, last_order_amount')
      .eq('id', customerId)
      .single();

    if (fetchError) throw fetchError;

    const timestamp = new Date().toISOString();
    const metrics: CustomerMetrics = {
      orders_count: (customer?.orders_count || 0) + 1,
      total_spent: (customer?.total_spent || 0) + orderAmount,
      last_order_amount: orderAmount,
      last_order_date: timestamp
    };

    // Update customer metrics
    const { error: updateError } = await supabase
      .from('customers')
      .update({ ...metrics, updated_at: timestamp })
      .eq('id', customerId);

    if (updateError) throw updateError;

    return { error: null };
  } catch (error) {
    console.error('Error updating customer metrics:', error);
    return { error: error instanceof Error ? error : new Error('Failed to update metrics') };
  }
}