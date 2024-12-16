import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SettingCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
}

export function SettingCard({ title, description, icon: Icon, onClick }: SettingCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-left"
    >
      <div className="flex items-start gap-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
}