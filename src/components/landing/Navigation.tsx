import React from 'react';
import { BarChart2, Menu, X } from 'lucide-react';

interface NavigationProps {
  onShowLogin: () => void;
}

export function Navigation({ onShowLogin }: NavigationProps) {
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-blue-600 p-2 rounded-lg">
              <BarChart2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Loopify
            </span>
          </div>
          
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="#contact" className="text-gray-600 hover:text-gray-900">Contact</a>
            <button 
              onClick={onShowLogin}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              Sign In
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:opacity-90">
              Get Started
            </button>
          </div>
        </div>
      </div>
      
      {showMobileMenu && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-3 space-y-3">
            <a href="#features" className="block text-gray-600 hover:text-gray-900">Features</a>
            <a href="#pricing" className="block text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="#contact" className="block text-gray-600 hover:text-gray-900">Contact</a>
            <div className="pt-3 border-t space-y-3">
              <button 
                onClick={() => {
                  onShowLogin();
                  setShowMobileMenu(false);
                }}
                className="w-full px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-left"
              >
                Sign In
              </button>
              <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:opacity-90">
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}