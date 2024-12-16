import React from 'react';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
          Sign up today and launch your customer loyalty program in just 5 minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="group px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-medium inline-flex items-center justify-center gap-2">
            Start 14-Day Free Trial
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-8 py-4 text-white border-2 border-white/20 hover:bg-white/10 rounded-lg font-medium">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
}