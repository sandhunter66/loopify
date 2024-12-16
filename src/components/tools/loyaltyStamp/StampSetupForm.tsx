import { useState } from 'react';
import type { StampCardConfig } from './LoyaltyStampView';
import { Stamp, Save } from 'lucide-react';

interface StampSetupFormProps {
  config: StampCardConfig;
  onChange: (config: StampCardConfig) => void;
  onSave: () => void;
  isSaving: boolean;
  isValid: boolean;
}

export function StampSetupForm({ config, onChange, onSave, isSaving, isValid }: StampSetupFormProps) {
  const handleChange = (field: keyof StampCardConfig, value: string | number) => {
    // Handle numeric values
    if (field === 'totalStamps' || field === 'minSpendPerStamp') {
      const numValue = Number(value);
      if (field === 'totalStamps') {
        value = numValue >= 4 && numValue <= 20 ? numValue : 12;
      } else if (field === 'minSpendPerStamp') {
        value = Math.max(0, numValue);
      }
    }
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="space-y-6 relative">
      {/* Event Details */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Promotion Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Promotion Name
            </label>
            <input
              type="text"
              value={config.eventName}
              onChange={(e) => handleChange('eventName', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Promosi Akhir Tahun"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tagline
            </label>
            <input
              type="text"
              value={config.eventLocation}
              onChange={(e) => handleChange('eventLocation', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., everyday is sale day"
            />
          </div>
        </div>
      </div>

      {/* Stamp Configuration */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Stamp Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Stamps Required
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <input
                type="number"
                min="4"
                max="20"
                value={Number(config.totalStamps) || 12}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (!isNaN(value) && value >= 4 && value <= 20) {
                    handleChange('totalStamps', value);
                  }
                }}
                className="w-20 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
                  focus:border-blue-500 text-center text-sm"
              />
              <input
                type="range"
                min="4"
                max="20"
                value={Number(config.totalStamps) || 12}
                onChange={(e) => handleChange('totalStamps', Number(e.target.value))}
                className="w-full sm:w-48 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <Stamp key={i} className="w-5 h-5 text-blue-500" />
                ))}
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Use slider or type a number (4-20 stamps)
            </p>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Spend per Stamp (RM)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={config.minSpendPerStamp || 0}
                onChange={(e) => handleChange('minSpendPerStamp', Number(e.target.value))}
                className="w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
              <p className="mt-1 text-sm text-gray-500">
                Minimum purchase amount required to earn one stamp
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Date Configuration */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Promotion Period</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              required
              value={config.startDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date *
            </label>
            <input
              type="date"
              required
              value={config.endDate}
              min={config.startDate || new Date().toISOString().split('T')[0]}
              onChange={(e) => handleChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          The loyalty card will automatically deactivate after the end date
        </p>
      </div>

      {/* Reward Configuration */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Reward Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reward Description
            </label>
            <input
              type="text"
              value={config.reward}
              onChange={(e) => handleChange('reward', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., collect 10 stamps and get 1 iphone 16 for free"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Terms & Conditions
            </label>
            <textarea
              value={config.terms}
              onChange={(e) => handleChange('terms', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Valid for 3 months from date of first stamp. One stamp per visit with minimum purchase of RM50."
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg mb-24">
        <p className="text-sm text-blue-600">
          All changes are automatically saved and reflected in the preview.
          Your customers will see the loyalty card exactly as shown in the preview.
        </p>
      </div>
      
      {/* Sticky Save Button */}
      <div className="fixed bottom-32 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40 md:relative md:mt-8 md:bg-transparent md:border-none">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={onSave}
            disabled={isSaving || !isValid}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium
              hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
              focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}