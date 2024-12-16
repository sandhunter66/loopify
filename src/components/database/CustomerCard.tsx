import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Phone, Mail, MapPin, ShoppingBag, Wallet, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Customer } from '../../types/customer';
import toast from 'react-hot-toast';

interface CustomerCardProps {
  customer: Customer;
  onDelete: () => void;
}

export function CustomerCard({ customer, onDelete }: CustomerCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customer.id);

      if (error) throw error;
      
      toast.success('Customer deleted successfully');
      onDelete();
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Main Card Content */}
      <div
        className="p-3 sm:p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start sm:items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">
              {customer.first_name} {customer.last_name}
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-500">
              <div className="flex items-center gap-1 truncate">
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{customer.phone}</span>
              </div>
              <div className="flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                {customer.orders_count} orders
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                RM {customer.last_order_amount.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded-full flex-shrink-0">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 border-t border-gray-100">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-2 sm:mb-3">Contact Information</h4>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="break-all">{customer.email}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div>{customer.address_line1}</div>
                    {customer.address_line2 && <div>{customer.address_line2}</div>}
                    <div>
                      {customer.city}, {customer.state} {customer.postcode}
                    </div>
                    <div>{customer.country}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-2 sm:mb-3">Order History</h4>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600">
                <div className="flex flex-col sm:flex-row sm:gap-6">
                  <div className="flex-1">
                    <span className="font-medium">Total Spent:</span>{' '}
                    RM {customer.total_spent.toLocaleString()}
                  </div>
                  <div className="flex-1">
                    <span className="font-medium">Last Order:</span>{' '}
                    {new Date(customer.last_order_date).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Customer Since:</span>{' '}
                  {new Date(customer.created_at).toLocaleDateString()}
                </div>
                {customer.total_spent > 0 && (
                  <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                    Active Customer
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}