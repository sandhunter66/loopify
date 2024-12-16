import React from 'react';
import { BarChart2 } from 'lucide-react';

export function Header() {
  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BarChart2 className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-bold text-gray-900">Loopify</h1>
              <p className="text-sm text-gray-500">Your E-Commerce Loyalty System</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}