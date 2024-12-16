import React from 'react';
import { Users } from 'lucide-react';
import { useTopCustomers } from '../hooks/useTopCustomers';

interface Props {
  storeId: string;
}

export function TopCustomers({ storeId }: Props) {
  const { customers, isLoading, error } = useTopCustomers(storeId);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-gray-500" />
        <h2 className="text-lg font-semibold">Top Customers</h2>
      </div>
      
      <div className="space-y-4">
        {customers.map((customer) => (
          <div key={customer.id} className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-gray-900">{customer.name}</p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500">{customer.phone}</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {customer.total_purchases} purchases
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">RM {customer.total_spent.toLocaleString()}</p>
              <p className="text-xs text-gray-500">
                {new Date(customer.last_purchase).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}