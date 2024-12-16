import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SettingCategoryProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

export function SettingCategory({ title, icon: Icon, children }: SettingCategoryProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}