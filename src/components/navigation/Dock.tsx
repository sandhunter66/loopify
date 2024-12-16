import React from 'react';
import { Home, Wrench, Database, Settings } from 'lucide-react';
import { DockItem } from './DockItem';

const navigationItems = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'tools', icon: Wrench, label: 'Tools' },
  { id: 'database', icon: Database, label: 'Database' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

interface DockProps {
  activeItem: string;
  onNavigate: (id: string) => void;
}

export function Dock({ activeItem, onNavigate }: DockProps) {
  return (
    <div className="fixed bottom-4 sm:bottom-6 left-0 right-0 px-4 sm:px-6 z-50">
      <div className="flex items-center bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-xl max-w-lg mx-auto">
        {navigationItems.map((item) => (
          <DockItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={activeItem === item.id}
            onClick={() => onNavigate(item.id)}
          />
        ))}
      </div>
    </div>
  );
}