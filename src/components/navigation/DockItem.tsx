import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DockItemProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

export function DockItem({ icon: Icon, label, isActive = false, onClick }: DockItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-3 flex-1 transition-all duration-200 ${
        isActive 
          ? 'bg-white text-blue-600 scale-110 shadow-lg rounded-xl' 
          : 'text-gray-400 hover:text-blue-600 hover:bg-white/90 hover:scale-105'
      }`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-xs mt-1 font-medium">{label}</span>
    </button>
  );
}