import React from 'react';
import { Trash2, Clock } from 'lucide-react';
import type { WhatsAppStep } from '../../../types/whatsapp';

interface StepEditorProps {
  step: WhatsAppStep;
  onChange: (step: Partial<WhatsAppStep>) => void;
  onRemove: () => void;
}

export function StepEditor({ step, onChange, onRemove }: StepEditorProps) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delay
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Days</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={step.delay_days}
                  onChange={(e) => onChange({ delay_days: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Hours</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={step.delay_hours}
                  onChange={(e) => onChange({ delay_hours: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              value={step.message}
              onChange={(e) => onChange({ message: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your message here..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Available variables: {'{first_name}'}, {'{last_name}'}, {'{phone}'}
            </p>
          </div>
        </div>

        <button
          onClick={onRemove}
          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>
            Will send after{' '}
            {step.delay_days > 0 && `${step.delay_days} day${step.delay_days !== 1 ? 's' : ''}`}
            {step.delay_days > 0 && step.delay_hours > 0 && ' and '}
            {step.delay_hours > 0 && `${step.delay_hours} hour${step.delay_hours !== 1 ? 's' : ''}`}
          </span>
        </div>
      </div>
    </div>
  );
}