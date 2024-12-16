import React from 'react';
import { Users, DollarSign, Clock } from 'lucide-react';
import { StoreSelector } from './database/StoreSelector';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { DashboardCard } from './DashboardCard';
import { RecentTransactions } from './RecentTransactions';
import { TopCustomers } from './TopCustomers';
import { Header } from './Header';

export function Dashboard() {
  const [selectedStore, setSelectedStore] = React.useState('all');
  const { totalCustomers, totalSales, pendingPayments, isLoading } = useDashboardMetrics(selectedStore);

  const metrics = [
    {
      title: 'Total Customers',
      value: isLoading ? '-' : totalCustomers.toLocaleString(),
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Sales',
      value: isLoading ? '-' : `RM ${totalSales.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Pending Payments',
      value: isLoading ? '-' : `RM ${pendingPayments.toLocaleString()}`,
      icon: Clock,
      color: 'bg-amber-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <Header />
      <div className="p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <StoreSelector
              selectedStore={selectedStore}
              onStoreChange={setSelectedStore}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {metrics.map((metric) => (
              <DashboardCard key={metric.title} {...metric} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentTransactions storeId={selectedStore} />
            <TopCustomers storeId={selectedStore} />
          </div>
        </div>
      </div>
    </div>
  );
}