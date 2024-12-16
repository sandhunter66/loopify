import React, { useState } from 'react';
import { X, Store } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useStores } from '../../hooks/useStores';
import toast from 'react-hot-toast';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddCustomerModal({ isOpen, onClose, onSuccess }: AddCustomerModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { stores } = useStores();
  const [formData, setFormData] = useState({
    store_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postcode: '',
    country: 'MY',
    item: '',
    amount: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Basic validation
      if (!formData.store_id || !formData.first_name || !formData.last_name || !formData.phone) {
        throw new Error('Please fill in all required fields');
      }
    
      // Format phone number
      let phone = formData.phone.replace(/\D/g, '');
      if (!phone.startsWith('60')) {
        phone = '60' + phone.replace(/^0+/, '');
      }

      // Validate phone format
      const phoneRegex = /^(60)(1[0-46-9])[0-9]{7,8}$/;
      if (!phoneRegex.test(phone)) {
        throw new Error('Please enter a valid Malaysian phone number (e.g., 60123456789)');
      }
    
      // Validate amount
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      // Get current timestamp once
      const timestamp = new Date().toISOString();
      const orderAmount = parseFloat(formData.amount);

      // Check for existing customer by phone or email in the current store
      const { data: existingCustomers, error: searchError } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', phone);

      if (searchError) throw searchError;

      let customerId;
      const currentMetrics = existingCustomers?.[0] || {
        total_spent: 0,
        orders_count: 0
      };
      
      const customerData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email || null,
        phone,
        address_line1: formData.address_line1 || null,
        address_line2: formData.address_line2 || null,
        city: formData.city || null,
        state: formData.state || null,
        postcode: formData.postcode || null,
        country: formData.country,
        total_spent: currentMetrics.total_spent + orderAmount,
        orders_count: currentMetrics.orders_count + 1,
        last_order_date: timestamp,
        last_order_amount: orderAmount,
        updated_at: timestamp
      };

      if (existingCustomers && existingCustomers.length > 0) {
        // Update existing customer
        const existingCustomer = existingCustomers[0];
        const { error: updateError } = await supabase
          .from('customers')
          .update(customerData)
          .eq('id', existingCustomer.id);

        if (updateError) throw updateError;
        customerId = existingCustomer.id;
        toast.success('Customer information updated');
      } else {
        // Create new customer
        const { data: newCustomer, error: insertError } = await supabase
          .from('customers')
          .insert({
            ...customerData,
            store_id: formData.store_id,
            created_at: timestamp
          })
          .select()
          .single();

        if (insertError) throw insertError;
        customerId = newCustomer.id;
        toast.success('New customer added successfully');
      }

      // Create order record
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: customerId,
          store_id: formData.store_id,
          order_number: `ORD-${Date.now()}`,
          total_amount: amount,
          status: 'completed',
          item: formData.item,
          created_at: timestamp,
          updated_at: timestamp
        });

      if (orderError) throw orderError;

      // Add stamp if applicable
      const { data: stampCard } = await supabase
        .from('loyalty_stamp_cards')
        .select('*')
        .eq('store_id', formData.store_id)
        .eq('is_ended', false)
        .single();

      if (stampCard && parseFloat(formData.amount) >= stampCard.min_spend_per_stamp) {
        const { data: loyaltyCard } = await supabase
          .from('loyalty_cards')
          .select('stamps')
          .eq('customer_id', customerId)
          .eq('store_id', formData.store_id)
          .single();

        const currentStamps = loyaltyCard?.stamps || 0;
        const newStamps = currentStamps + 1;
        
        // Update loyalty card
        const { error: stampError } = await supabase
          .from('loyalty_cards')
          .upsert({
            customer_id: customerId,
            store_id: formData.store_id,
            stamps: newStamps,
            updated_at: timestamp
          });

        if (stampError) throw stampError;

        // Send WhatsApp notification
        try {
          await sendStampNotification(
            formData.store_id,
            customerId,
            newStamps,
            stampCard.total_stamps
          );
        } catch (notifyError) {
          console.error('Failed to send stamp notification:', notifyError);
          // Don't throw - continue with customer creation even if notification fails
        }
      }

      // Reset form
      setFormData({
        store_id: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postcode: '',
        country: 'MY',
        item: '',
        amount: '',
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Add New Customer</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Store *
            </label>
            <div className="relative">
              <Store className="w-5 h-5 text-gray-400 absolute left-3 top-2" />
              <select
                name="store_id"
                required
                value={formData.store_id}
                onChange={(e) => setFormData(prev => ({ ...prev, store_id: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="">Select a store</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                name="first_name"
                required
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                name="last_name"
                required
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="e.g., 60123456789"
                required
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">Enter Malaysian phone number starting with 60 (e.g., 60123456789)</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1
            </label>
            <input
              type="text"
              name="address_line1"
              value={formData.address_line1}
              onChange={(e) => setFormData(prev => ({ ...prev, address_line1: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 2
            </label>
            <input
              type="text"
              name="address_line2"
              value={formData.address_line2}
              onChange={(e) => setFormData(prev => ({ ...prev, address_line2: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postcode
              </label>
              <input
                type="text"
                name="postcode"
                value={formData.postcode}
                onChange={(e) => setFormData(prev => ({ ...prev, postcode: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                name="country"
                readOnly
                value={formData.country}
                className="w-full px-3 py-2 border rounded-lg bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item *
              </label>
              <input
                type="text"
                name="item"
                required
                value={formData.item}
                onChange={(e) => setFormData(prev => ({ ...prev, item: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Item purchased"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (RM) *
              </label>
              <input
                type="number"
                name="amount"
                required
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Adding Customer...</span>
                </div>
              ) : (
                'Confirm Add Customer'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}