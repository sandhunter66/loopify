import React from 'react';
import { Stamp } from 'lucide-react';
import type { StampCardConfig } from './LoyaltyStampView';

interface StampCardProps {
  config: StampCardConfig;
}

export function StampCard({ config }: StampCardProps) {
  const stamps = 0; // Preview always shows empty card
  const totalStamps = Math.max(4, Math.min(20, Number(config.totalStamps) || 12));

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-md mx-auto">
      {/* Header Image */}
      <div 
        className="h-40 sm:h-48 bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&q=80")'
        }}
      >
        <div className="h-full w-full bg-black/50 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 px-4">{config.eventName || 'Your Promotion Name'}</h1>
            <p className="text-sm opacity-90">{config.eventLocation || 'Tagline'}</p>
          </div>
        </div>
      </div>

      {/* Reward Description */}
      <div className="bg-blue-50 px-3 py-4 sm:p-4 text-center border-b border-blue-100">
        <h2 className="text-blue-800 font-semibold">
          Reward: {config.reward || 'Your Reward Description'}
        </h2>
        {config.minSpendPerStamp > 0 && (
          <p className="text-sm text-blue-600 mt-1">
            Spend RM {config.minSpendPerStamp.toFixed(2)} to earn 1 stamp
          </p>
        )}
        <p className="text-xs text-blue-600 mt-1">
          Valid: {config.startDate ? new Date(config.startDate).toLocaleDateString() : 'Start Date'} - {config.endDate ? new Date(config.endDate).toLocaleDateString() : 'End Date'}
        </p>
        <p className="text-sm text-blue-600 mt-1">
          Collect all {totalStamps} stamps to participate
        </p>
      </div>

      {/* Stamps Grid */}
      <div className="p-4 sm:p-6">
        <div className={`grid gap-4 mb-6 ${
          totalStamps <= 12 ? 'grid-cols-4' : 'grid-cols-5'
        }`}>
          {Array.from({ length: totalStamps }).map((_, index) => (
            <div
              key={index}
              className={`aspect-square rounded-full flex items-center justify-center border-2 transition-all ${
                index < stamps
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <Stamp
                className={`w-4 h-4 sm:w-6 sm:h-6 ${
                  index < stamps ? 'text-blue-500' : 'text-gray-300'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Progress Text */}
        <div className="text-center mb-6">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-800">{stamps}</span>
            <span className="mx-1">/</span>
            <span className="font-semibold text-gray-800">{totalStamps}</span>
            <span className="ml-1">stamps collected</span>
          </p>
          <p className="text-xs text-gray-500 mt-2">{config.terms || 'Terms and conditions will appear here'}</p>
        </div>

        {/* Action Button */}
        <div
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-medium
            text-center opacity-50"
        >
          Preview Mode
        </div>
      </div>
    </div>
  );
}