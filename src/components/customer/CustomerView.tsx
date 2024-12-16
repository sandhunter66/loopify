import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { PhoneSignIn } from './PhoneSignIn';
import { CustomerStampCard } from './CustomerStampCard';
import toast from 'react-hot-toast';
import { useStampCard } from '../../hooks/useStampCard';

interface CustomerData {
  id: string;
  store_id: string;
  first_name: string;
  last_name: string;
  stamps: number;
}

export function CustomerView() {
  const [phone, setPhone] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stampCard, setStampCard] = useState<any>(null);

  useEffect(() => {
    if (phone) {
      fetchCustomerData(phone);
    } else {
      setIsLoading(false);
    }
  }, [phone]);

  const fetchCustomerData = async (phoneNumber: string) => {
    try {
      const { data: customers, error } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', phoneNumber)
        .single();

      if (error) throw error;

      // Get active stamp card for store
      const { data: activeCard, error: cardError } = await supabase
        .from('loyalty_stamp_cards')
        .select('*')
        .eq('store_id', customers.store_id)
        .eq('is_ended', false)
        .single();

      if (cardError && cardError.code !== 'PGRST116') throw cardError;
      setStampCard(activeCard);

      // Get loyalty card
      const { data: loyaltyCard, error: loyaltyError } = await supabase
        .from('loyalty_cards')
        .select('*')
        .eq('customer_id', customers.id)
        .eq('store_id', customers.store_id)
        .single();

      if (loyaltyError && loyaltyError.code === 'PGRST116') {
        // Card doesn't exist, create it
        const { data: newCard, error: createError } = await supabase
          .from('loyalty_cards')
          .insert({
            customer_id: customers.id,
            store_id: customers.store_id,
            stamps: 0,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) throw createError;
        
        setCustomerData({
          id: customers.id,
          first_name: customers.first_name,
          last_name: customers.last_name,
          store_id: customers.store_id,
          stamps: newCard.stamps
        });
      } else if (loyaltyError) {
        throw loyaltyError;
      } else {
        setCustomerData({
          id: customers.id,
          first_name: customers.first_name,
          last_name: customers.last_name,
          store_id: customers.store_id,
          stamps: loyaltyCard.stamps || 0
        });
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
      toast.error('Failed to load customer data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {!phone ? (
          <PhoneSignIn onSignIn={setPhone} />
        ) : customerData ? (
          <>
            <div className="mb-4 text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {customerData.first_name}!
              </h1>
            </div>
            <CustomerStampCard
              totalStamps={stampCard?.total_stamps || 12}
              collectedStamps={customerData.stamps}
              reward={stampCard?.reward || 'Collect all stamps to earn rewards!'}
              expiryDate={stampCard?.end_date}
            />
            <button
              onClick={() => setPhone(null)}
              className="w-full mt-4 px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Sign Out
            </button>
          </>
        ) : (
          <div className="text-center text-gray-500">
            No customer data found
          </div>
        )}
      </div>
    </div>
  );
}