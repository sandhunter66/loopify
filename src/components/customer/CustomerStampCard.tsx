import React from 'react';
import { Stamp } from 'lucide-react';

interface CustomerStampCardProps {
  totalStamps: number;
  collectedStamps: number;
  reward: string;
  expiryDate?: string;
}

export function CustomerStampCard({ totalStamps, collectedStamps, reward, expiryDate }: CustomerStampCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white relative">
        <h2 className="text-xl font-bold mb-2">Your Loyalty Card</h2>
        <p className="text-sm text-blue-100">Collect stamps with every purchase</p>
        {collectedStamps >= totalStamps && (
          <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 px-3 py-1 rounded-bl-lg font-medium text-sm">
            Reward Earned!
          </div>
        )}
      </div>

      {/* Stamps Grid */}
      <div className="p-6">
        <div className={`grid gap-4 mb-6 ${
          totalStamps <= 12 ? 'grid-cols-4' : 'grid-cols-5'
        }`}>
          {Array.from({ length: totalStamps }).map((_, index) => (
            <div
              key={index}
              className={`aspect-square rounded-full flex items-center justify-center border-2 transition-all ${
                index < collectedStamps
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <Stamp
                className={`w-6 h-6 ${
                  index < collectedStamps ? 'text-blue-500' : 'text-gray-300'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Progress Text */}
        <div className="text-center mb-6">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-800">{collectedStamps}</span>
            <span className="mx-1">/</span>
            <span className="font-semibold text-gray-800">{totalStamps}</span>
            <span className="ml-1">stamps collected</span>
          </p>
          {expiryDate && (
            <p className="text-sm text-gray-500 mt-2">
              Valid until {new Date(expiryDate).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Reward Info */}
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-sm font-medium text-blue-900">{reward}</p>
          {collectedStamps >= totalStamps && (
            <p className="text-xs text-blue-700 mt-2">
              Show this card to claim your reward!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}