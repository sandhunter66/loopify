import React from 'react';
import { Clock } from 'lucide-react';
import { useRecentTransactions } from '../hooks/useRecentTransactions';

interface Props {
  storeId: string;
}

export function RecentTransactions({ storeId }: Props) {
  const { transactions, isLoading, error } = useRecentTransactions(storeId);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="space-y-2 text-right">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-gray-500" />
        <h2 className="text-lg font-semibold">Recent Transactions</h2>
      </div>
      
      {error ? (
        <p className="text-sm text-red-500 text-center py-4">{error}</p>
      ) : transactions.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No recent transactions found</p>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">{transaction.customer_name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(transaction.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  RM {transaction.amount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-500">{transaction.store_name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}