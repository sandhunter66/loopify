import { supabase } from '../lib/supabase';
import type { WooCommerceCustomer } from '../types/woocommerce';
import type { Customer } from '../types/customer';

interface WooCommerceConfig {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

export async function fetchWooCommerceCustomers(config: WooCommerceConfig): Promise<WooCommerceCustomer[]> {
  try {
    // Fetch all orders first to get customer purchase data
    const ordersResponse = await fetch(`${config.url}/wp-json/wc/v3/orders?per_page=100&status=completed`, {
      headers: {
        'Authorization': 'Basic ' + btoa(`${config.consumerKey}:${config.consumerSecret}`)
      }
    });

    if (!ordersResponse.ok) {
      throw new Error(`HTTP error fetching orders! status: ${ordersResponse.status}`);
    }

    const orders = await ordersResponse.json();

    // Get customer data
    const customersResponse = await fetch(`${config.url}/wp-json/wc/v3/customers?per_page=100`, {
      headers: {
        'Authorization': 'Basic ' + btoa(`${config.consumerKey}:${config.consumerSecret}`)
      }
    });

    if (!customersResponse.ok) {
      throw new Error(`HTTP error fetching customers! status: ${customersResponse.status}`);
    }

    const customers = await customersResponse.json();

    // Enrich customer data with order information
    return customers.map(customer => {
      const customerOrders = orders.filter(order => order.customer_id === customer.id);
      const totalSpent = customerOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
      const lastOrder = customerOrders.sort((a, b) => 
        new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
      )[0];

      return {
        ...customer,
        orders_count: customerOrders.length,
        total_spent: totalSpent,
        last_order_date: lastOrder?.date_created || null,
        last_order_amount: lastOrder ? parseFloat(lastOrder.total) : 0
      };
    });
  } catch (error) {
    console.error('Error fetching WooCommerce customers:', error);
    throw error;
  }
}

export async function syncCustomersToSupabase(
  storeId: string, 
  wooCustomers: WooCommerceCustomer[]
): Promise<void> {
  try {
    const timestamp = new Date().toISOString();
    
    // Transform WooCommerce customers to our format
    const transformedCustomers = wooCustomers.map(wc => {
      // Convert dates to UTC+8
      const lastOrderDate = wc.last_order_date ? new Date(wc.last_order_date) : null;
      if (lastOrderDate) {
        lastOrderDate.setHours(lastOrderDate.getHours() + 8);
      }
      
      return {
        store_id: storeId,
        first_name: wc.first_name,
        last_name: wc.last_name,
        email: wc.email,
        phone: formatPhoneNumber(wc.billing.phone),
        address_line1: wc.billing.address_1,
        address_line2: wc.billing.address_2 || null,
        city: wc.billing.city,
        state: wc.billing.state,
        postcode: wc.billing.postcode,
        country: wc.billing.country,
        total_spent: wc.total_spent || 0,
        orders_count: wc.orders_count || 0,
        last_order_date: lastOrderDate?.toISOString() || null,
        last_order_amount: wc.last_order_amount || 0,
        created_at: timestamp,
        updated_at: timestamp
      };
    });

    // Upsert customers in batches
    const batchSize = 50;
    for (let i = 0; i < transformedCustomers.length; i += batchSize) {
      const batch = transformedCustomers.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('customers')
        .upsert(batch, {
          onConflict: 'store_id,phone',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('Error upserting batch:', error);
        throw error;
      }
    }
  } catch (error) {
    console.error('Error syncing customers:', error);
    throw error;
  }
}

function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Ensure number starts with 60
  if (!cleaned.startsWith('60')) {
    cleaned = '60' + cleaned.replace(/^0+/, '');
  }
  
  return cleaned;
}