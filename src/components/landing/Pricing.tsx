import React from 'react';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Basic',
    price: '49',
    features: [
      '1 Store Location',
      'Digital Stamp Cards',
      'WhatsApp Notifications',
      'Basic Analytics',
      'Email Support'
    ]
  },
  {
    name: 'Premium',
    price: '149',
    popular: true,
    features: [
      '3 Store Locations',
      'All Basic Features',
      'Points Rewards',
      'Lucky Draws',
      'Advanced Analytics',
      'Priority Support'
    ]
  },
  {
    name: 'Enterprise',
    price: '399',
    features: [
      '6 Store Locations',
      'All Premium Features',
      'API Integration',
      'Custom Branding',
      'Account Manager',
      '24/7 Support'
    ]
  }
];

export function Pricing() {
  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Plan
          </h2>
          <p className="text-lg text-gray-600">
            Affordable pricing for businesses of all sizes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative bg-white rounded-xl ${
                plan.popular 
                  ? 'shadow-xl ring-2 ring-blue-600' 
                  : 'shadow-sm border border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Popular
                  </div>
                </div>
              )}

              <div className="p-8">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">RM{plan.price}</span>
                  <span className="text-gray-500">/month</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className={`w-5 h-5 ${
                        plan.popular ? 'text-blue-600' : 'text-green-500'
                      }`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  className={`w-full py-3 rounded-lg font-medium ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90'
                      : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  Get Started
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}