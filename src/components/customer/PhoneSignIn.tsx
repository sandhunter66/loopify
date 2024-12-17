import React, { useState } from 'react';
import { Phone } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface PhoneSignInProps {
  onSignIn: (phone: string) => void;
}

export function PhoneSignIn({ onSignIn }: PhoneSignInProps) {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    // Format phone number
    let formattedPhone = phone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('60')) {
      formattedPhone = '60' + formattedPhone.replace(/^0+/, '');
    }

    // Validate phone format
    const phoneRegex = /^(60)(1[0-46-9])[0-9]{7,8}$/;
    if (!phoneRegex.test(formattedPhone)) {
      toast.error('Please enter a valid Malaysian phone number (e.g., 60123456789)');
      return;
    }

    setIsLoading(true);
    try {
      // Check if customer exists
      const { data: customers, error } = await supabase
        .from('customers')
        .select('phone')
        .eq('phone', formattedPhone)
        .limit(1);

      if (error) throw error;

      if (!customers?.length) {
        toast.error('Phone number not found. Please make a purchase first.');
        return;
      }

      onSignIn(formattedPhone);
      toast.success('Signed in successfully');
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error('Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Sign in with Phone Number
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="tel"
              autoFocus
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g., 60123456789"
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Enter your Malaysian phone number starting with 60
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            'View Loyalty Card'
          )}
        </button>
      </form>
    </div>
  );
}