import React from 'react';
import { CreditCard, Gift, Calendar, Coins } from 'lucide-react';

interface PointsPreviewProps {
  config: {
    points_per_rm: number;
    reward_description: string;
    terms: string;
    min_spend: number;
    start_date: string;
    end_date: string;
  };
}

export function PointsPreview({ config }: PointsPreviewProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-md mx-auto transform transition-all duration-300 hover:scale-[1.02] relative">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 pt-12 pb-8 px-8 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 transform translate-x-32 -translate-y-32">
          <div className="absolute inset-0 bg-white opacity-10 rounded-full"></div>
        </div>
        <h2 className="text-2xl font-bold mb-3 relative">Loyalty Points Program</h2>
        <div className="relative">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mt-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Coins className="w-8 h-8 text-yellow-300" />
              <span className="text-xl font-medium text-blue-50">Current Points</span>
            </div>
            <div className="text-center">
              <span className="text-6xl font-bold tracking-tight">0</span>
              <span className="text-2xl ml-2 text-blue-200">pts</span>
            </div>
          </div>
        </div>
        {config.min_spend > 0 && (
          <div className="mt-4 py-2 px-4 bg-white/10 rounded-lg backdrop-blur-sm text-sm text-center">
            Min. spend: RM {config.min_spend.toFixed(2)} per transaction
          </div>
        )}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="text-sm text-blue-100">Next Reward At</div>
            <div className="text-xl font-bold">1,000 pts</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="text-sm text-blue-100">Points to Earn</div>
            <div className="text-xl font-bold">1,000 pts</div>
          </div>
        </div>
      </div>

      {/* Reward Details */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm">
            <Gift className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Available Rewards</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{config.reward_description}</p>
          </div>
        </div>
      </div>

      {/* Terms and Validity */}
      <div className="p-6 bg-gradient-to-b from-white to-gray-50">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Program Period</h3>
              <p className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-100 inline-block">
                Valid from {new Date(config.start_date).toLocaleDateString()} to{' '}
                {new Date(config.end_date).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p className="font-semibold text-gray-700 mb-3">Terms & Conditions:</p>
            <ul className="space-y-2">
              {config.terms.split('\n').map((term, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <span>{term}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Preview Badge */}
      <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/50 text-white text-xs font-medium rounded-full backdrop-blur-sm">
        Preview Mode
      </div>
    </div>
  );
}