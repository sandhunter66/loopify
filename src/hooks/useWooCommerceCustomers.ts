import { useState, useEffect } from 'react';
import type { WooCommerceCustomer } from '../types/woocommerce';

// Mock data representing WooCommerce customers
const mockWooCustomers: WooCommerceCustomer[] = [
  {
    id: 1,
    date_created: "2024-01-15T08:00:00",
    date_modified: "2024-03-10T08:00:00",
    email: "ahmad.ibrahim@example.com",
    first_name: "Ahmad",
    last_name: "Ibrahim",
    role: "customer",
    username: "ahmadibrahim",
    billing: {
      first_name: "Ahmad",
      last_name: "Ibrahim",
      company: "Tech Solutions Sdn Bhd",
      address_1: "15, Jalan Bukit Bintang",
      address_2: "Level 3, Pavilion KL",
      city: "Kuala Lumpur",
      state: "WP",
      postcode: "50250",
      country: "MY",
      email: "ahmad.ibrahim@example.com",
      phone: "+60123456789"
    },
    shipping: {
      first_name: "Ahmad",
      last_name: "Ibrahim",
      company: "Tech Solutions Sdn Bhd",
      address_1: "15, Jalan Bukit Bintang",
      address_2: "Level 3, Pavilion KL",
      city: "Kuala Lumpur",
      state: "WP",
      postcode: "50250",
      country: "MY"
    },
    is_paying_customer: true,
    avatar_url: "",
    meta_data: [],
    orders_count: 25,
    total_spent: 4500.00,
    last_order_date: "2024-03-10",
    last_order_amount: 250.00,
    store_id: "downtown"
  },
  {
    id: 2,
    date_created: "2023-11-20T10:30:00",
    date_modified: "2024-03-09T15:20:00",
    email: "siti.lee@example.com",
    first_name: "Siti",
    last_name: "Lee",
    role: "customer",
    username: "sitilee",
    billing: {
      first_name: "Siti",
      last_name: "Lee",
      company: "",
      address_1: "88, Persiaran KLCC",
      address_2: "Unit 12-3",
      city: "Kuala Lumpur",
      state: "WP",
      postcode: "50088",
      country: "MY",
      email: "siti.lee@example.com",
      phone: "+60167891234"
    },
    shipping: {
      first_name: "Siti",
      last_name: "Lee",
      company: "",
      address_1: "88, Persiaran KLCC",
      address_2: "Unit 12-3",
      city: "Kuala Lumpur",
      state: "WP",
      postcode: "50088",
      country: "MY"
    },
    is_paying_customer: true,
    avatar_url: "",
    meta_data: [],
    orders_count: 18,
    total_spent: 3200.00,
    last_order_date: "2024-03-08",
    last_order_amount: 180.00,
    store_id: "mall"
  },
  {
    id: 3,
    date_created: "2024-02-01T14:15:00",
    date_modified: "2024-03-07T09:45:00",
    email: "raj.kumar@example.com",
    first_name: "Raj",
    last_name: "Kumar",
    role: "customer",
    username: "rajkumar",
    billing: {
      first_name: "Raj",
      last_name: "Kumar",
      company: "Kumar Enterprises",
      address_1: "45, Jalan SS15/4",
      address_2: "",
      city: "Subang Jaya",
      state: "Selangor",
      postcode: "47500",
      country: "MY",
      email: "raj.kumar@example.com",
      phone: "+60198765432"
    },
    shipping: {
      first_name: "Raj",
      last_name: "Kumar",
      company: "Kumar Enterprises",
      address_1: "45, Jalan SS15/4",
      address_2: "",
      city: "Subang Jaya",
      state: "Selangor",
      postcode: "47500",
      country: "MY"
    },
    is_paying_customer: true,
    avatar_url: "",
    meta_data: [],
    orders_count: 8,
    total_spent: 1800.00,
    last_order_date: "2024-03-05",
    last_order_amount: 150.00,
    store_id: "suburb"
  }
];

export function useWooCommerceCustomers(storeFilter: string, searchQuery: string) {
  const [customers, setCustomers] = useState<WooCommerceCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = () => {
      setIsLoading(true);
      // Simulate API call - replace with actual WooCommerce API integration
      setTimeout(() => {
        let filteredCustomers = [...mockWooCustomers];

        if (storeFilter !== 'all') {
          filteredCustomers = filteredCustomers.filter(
            (customer) => customer.store_id === storeFilter
          );
        }

        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredCustomers = filteredCustomers.filter(
            (customer) =>
              customer.first_name.toLowerCase().includes(query) ||
              customer.last_name.toLowerCase().includes(query) ||
              customer.email.toLowerCase().includes(query) ||
              customer.billing.phone.includes(query) ||
              customer.billing.address_1.toLowerCase().includes(query)
          );
        }

        setCustomers(filteredCustomers);
        setIsLoading(false);
      }, 500);
    };

    fetchCustomers();
  }, [storeFilter, searchQuery]);

  return { customers, isLoading };
}