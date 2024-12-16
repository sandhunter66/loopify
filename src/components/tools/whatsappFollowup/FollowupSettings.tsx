import React from 'react';
import { Switch } from '../loyaltyStamp/Switch';

interface FollowupSettingsProps {
  title: string;
  description: string;
  config: {
    enabled: boolean;
    delay: number;
    message: string;
  };
  onChange: (config: {
    enabled: boolean;
    delay: number;
    message: string;
  }) => void;
}

export function FollowupSettings({
  title,
  description,
  config,
  onChange
}: FollowupSettingsProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
          <Switch
            enabled={config.enabled}
            onChange={(enabled) => onChange({ ...config, enabled })}
            label="Enable"
          />
        </div>

        {config.enabled && (
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Send After (Days)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={config.delay}
                onChange={(e) => onChange({
                  ...config,
                  delay: parseInt(e.target.value) || 1
                })}
                className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Message will be sent this many days after the trigger event
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message Template
              </label>
              <textarea
                value={config.message}
                onChange={(e) => onChange({
                  ...config,
                  message: e.target.value
                })}
                rows={4}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your message template..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Available variables: {'{first_name}'}, {'{last_name}'}, {'{phone}'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}