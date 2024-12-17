import { supabase } from '../lib/supabase';
import type { WooCommerceCustomer } from '../types/woocommerce';
import type { Customer } from '../types/customer';
import { NetworkError, ConfigurationError } from '../lib/utils/errors';

interface WooCommerceConfig {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

interface WooOrder {
  id: number;
  customer_id: number;
  total: string;
  date_created: string;
  line_items: Array<{
    name: string;
    quantity: number;
    total: string;
  }>;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const BATCH_SIZE = 25;

async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorText = await response.text();
      throw new NetworkError(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying request to ${url}, ${retries} attempts remaining...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw new NetworkError('Failed to connect to WooCommerce API after multiple attempts');
  }
}

async function fetchAllPages<T>(baseUrl: string, options: RequestInit): Promise<T[]> {
  let page = 1;
  let allItems: T[] = [];
  let hasMore = true;

  while (hasMore) {
    const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${page}&per_page=${BATCH_SIZE}`;
    const response = await fetchWithRetry(url, options);
    const items = await response.json();
    
    if (items.length === 0) {
      hasMore = false;
    } else {
      allItems = [...allItems, ...items];
      page++;
    }
  }

  return allItems;
}

export async function fetchWooCommerceCustomers(config: WooCommerceConfig): Promise<WooCommerceCustomer[]> {
  try {
    // Validate config
    if (!config.url || !config.consumerKey || !config.consumerSecret) {
      throw new ConfigurationError('Missing WooCommerce configuration. Please check your API credentials.');
    }

    // Normalize URL
    const baseUrl = config.url.replace(/\/$/, '');
    const apiUrl = `${baseUrl}/wp-json/wc/v3`;
    const authHeader = 'Basic ' + btoa(`${config.consumerKey}:${config.consumerSecret}`);
    const requestOptions = {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    };

    // Fetch all orders first to get customer purchase data
    console.log('Fetching WooCommerce orders...');
    const orders = await fetchAllPages<WooOrder>(
      `${apiUrl}/orders?status=completed`,
      requestOptions
    );
    console.log(`Found ${orders.length} orders`);

    // Get customer data
    console.log('Fetching WooCommerce customers...');
    const customers = await fetchAllPages<WooCommerceCustomer>(
      `${apiUrl}/customers`,
      requestOptions
    );
    console.log(`Found ${customers.length} customers`);

    // Enrich customer data with order information
    return customers.map(customer => {
      const customerOrders = orders.filter(order => order.customer_id === customer.id);
      const totalSpent = customerOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
      const lastOrder = customerOrders.sort((a, b) => 
        new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
      )[0];

      // Ensure all required fields are present
      const enrichedCustomer = {
        ...customer,
        orders_count: customerOrders.length,
        total_spent: totalSpent || 0,
        last_order_date: lastOrder?.date_created || null,
        last_order_amount: lastOrder ? parseFloat(lastOrder.total) : 0,
        billing: {
          ...customer.billing,
          phone: customer.billing?.phone || '',
          address_1: customer.billing?.address_1 || '',
          address_2: customer.billing?.address_2 || '',
          city: customer.billing?.city || '',
          state: customer.billing?.state || '',
          postcode: customer.billing?.postcode || '',
          country: customer.billing?.country || 'MY'
        }
      };
      return enrichedCustomer;
    });
  } catch (error) {
    if (error instanceof NetworkError) {
      throw error;
    }
    console.error('Error fetching WooCommerce data:', error);
    throw error instanceof Error ? error : new Error('Unknown error occurred during WooCommerce sync');
  }
}

export async function syncCustomersToSupabase(
  storeId: string, 
  wooCustomers: WooCommerceCustomer[]
): Promise<void> {
  try {
    console.log(`Starting sync of ${wooCustomers.length} customers to Supabase...`);
    const timestamp = new Date().toISOString();
    
    // Transform WooCommerce customers to our format
    const transformedCustomers = wooCustomers.map(wc => {
      // Convert dates to UTC+8
      const lastOrderDate = wc.last_order_date ? new Date(wc.last_order_date) : null;
      if (lastOrderDate) {
        lastOrderDate.setHours(lastOrderDate.getHours() + 8);
      }
      
      // Ensure phone number is properly formatted
      const phone = formatPhoneNumber(wc.billing?.phone || '');
      if (!phone) {
        console.warn(`Skipping customer ${wc.id} due to invalid phone number`);
        return null;
      }

      return {
        store_id: storeId,
        first_name: wc.first_name,
        last_name: wc.last_name,
        email: wc.email,
        phone,
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
    }).filter((customer): customer is NonNullable<typeof customer> => customer !== null);

    // Upsert customers in batches
    for (let i = 0; i < transformedCustomers.length; i += BATCH_SIZE) {
      const batch = transformedCustomers.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${i / BATCH_SIZE + 1} of ${Math.ceil(transformedCustomers.length / BATCH_SIZE)}`);
      
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
    console.log('Sync completed successfully');
  } catch (error) {
    console.error('Error syncing customers:', error);
    throw error;
  }
}

function formatPhoneNumber(phone: string): string {
  if (!phone) return '';

  // Remove any non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Remove leading zeros
  cleaned = cleaned.replace(/^0+/, '');

  // Ensure number starts with 60
  if (!cleaned.startsWith('60')) {
    cleaned = '60' + cleaned.replace(/^0+/, '');
  }
  
  // Validate final format
  if (!/^60\d{9,10}$/.test(cleaned)) {
    return '';
  }

  return cleaned;
}