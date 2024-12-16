import { useState } from 'react';
import { Save } from 'lucide-react';

interface PointsSetupFormProps {
  config: {
    points_per_rm: number;
    reward_description: string;
    terms: string;
    min_spend: number;
    start_date: string;
    end_date: string;
  };
  onChange: (config: any) => void;
  onSave: () => void;
  isSaving: boolean;
  isValid: boolean;
}

export function PointsSetupForm({ config, onChange, onSave, isSaving, isValid }: PointsSetupFormProps) {
  const handleChange = (field: string, value: string | number) => {
    // Ensure numeric values are properly parsed
    if (field === 'points_per_rm' || field === 'min_spend') {
      value = value === '' ? 0 : parseFloat(value);
      if (isNaN(value)) value = 0;
    }
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="space-y-6 relative">
      {/* Points Configuration */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Points Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Points per RM1 *
            </label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              required
              value={config.points_per_rm}
              onChange={(e) => handleChange('points_per_rm', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Spend (RM)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={config.min_spend}
              onChange={(e) => handleChange('min_spend', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 30"
            />
          </div>
        </div>
      </div>

      {/* Date Configuration */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Program Period</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              required
              value={config.start_date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => handleChange('start_date', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date *
            </label>
            <input
              type="date"
              required
              value={config.end_date}
              min={config.start_date || new Date().toISOString().split('T')[0]}
              onChange={(e) => handleChange('end_date', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Reward Configuration */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Reward Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reward Description *
            </label>
            <textarea
              required
              value={config.reward_description}
              onChange={(e) => handleChange('reward_description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Redeem RM10 voucher for every 1000 points collected"
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
              placeholder="e.g., Points are valid for 12 months from the date of issue. Points cannot be transferred or exchanged for cash."
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
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