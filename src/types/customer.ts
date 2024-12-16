export interface Customer {
  id: string;
  store_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  total_spent: number;
  orders_count: number;
  last_order_date: string;
  last_order_amount: number;
  created_at: string;
  updated_at: string;
  store?: {
    name: string;
  };
}