import React from 'react';
import { useCustomers } from '../../hooks/useCustomers';
import { CustomerCard } from './CustomerCard';

interface CustomerTableProps {
  storeFilter: string;
  searchQuery: string;
}

export function CustomerTable({ storeFilter, searchQuery }: CustomerTableProps) {
  const { customers, isLoading, error, refetch } = useCustomers(storeFilter, searchQuery);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-red-500">Error loading customers: {error}</p>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-500">No customers found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {customers.map((customer) => (
        <CustomerCard 
          key={customer.id} 
          customer={customer} 
          onDelete={refetch}
        />
      ))}
    </div>
  );
}