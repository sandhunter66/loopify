import React from 'react';

interface SwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
  description?: string;
}

export function Switch({ enabled, onChange, label, description }: SwitchProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3">
        <div
          role="switch"
          aria-checked={enabled}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onChange(!enabled);
            }
          }}
          type="button"
          onClick={() => onChange(!enabled)}
          className={`
            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 
            border-transparent transition-colors duration-200 ease-in-out focus:outline-none 
            focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:bg-opacity-90
            ${enabled ? 'bg-blue-600' : 'bg-gray-200'}
          `}
        >
          <span className="sr-only">Use setting</span>
          <span
            className={`
              pointer-events-none inline-block h-5 w-5 transform rounded-full 
              bg-white shadow-sm ring-0 transition duration-200 ease-in-out
              ${enabled ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </div>
        <span className="text-sm font-medium text-gray-900">{label}</span>
      </div>
      {description && (
        <p className="mt-1 text-xs text-gray-500 ml-14">{description}</p>
      )}
    </div>
  );
}