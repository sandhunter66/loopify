import React from 'react';
import { BarChart2, Facebook, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BarChart2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Loopiify</span>
            </div>
            <p className="text-sm text-gray-400">
              Digital customer loyalty platform for businesses in Malaysia.
            </p>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Digital Stamp Cards</a></li>
              <li><a href="#" className="hover:text-white">Points Rewards</a></li>
              <li><a href="#" className="hover:text-white">Lucky Draws</a></li>
              <li><a href="#" className="hover:text-white">WhatsApp Integration</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
              <li><a href="#" className="hover:text-white">Careers</a></li>
              <li><a href="#" className="hover:text-white">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-white">
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-sm text-gray-400">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              © 2024 Loopiify. All rights reserved.
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white">Terms of Service</a>
              <a href="#" className="hover:text-white">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}