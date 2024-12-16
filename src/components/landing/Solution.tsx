import React from 'react';
import { Sparkles, ArrowRight, ShoppingBag, Users, BarChart2 } from 'lucide-react';

export function Solution() {
  return (
    <div className="relative bg-gray-50 py-24">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-blue-50 px-6 py-3 rounded-full mb-6">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">Jangan Risau!</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Memperkenalkan Loopify, All-in-One
              <span className="block mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Customer Loyalty Platform
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-8">
              Tukarkan customer baru menjadi customer tetap dengan sistem loyalti dan automasi digital.
            </p>

            <div className="space-y-6">
              {[
                {
                  icon: ShoppingBag,
                  title: 'Tambah Repeat Order',
                  description: 'Kad loyalti stamp, points reward dan lucky draw secara digital untuk pastikan customer anda repeat order'
                },
                {
                  icon: Users,
                  title: 'Brand Awareness',
                  description: 'Blast Unlimited Whatsapp promotion dan Auto-followup untuk pastikan customer sentiasa ingat anda'
                },
                {
                  icon: BarChart2,
                  title: 'Utilized Database',
                  description: 'Kumpul dan guna database anda dan dapatkan sales tanpa kos yang tinggi'
                }
              ].map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-2xl opacity-20" />
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-8 text-white">
                <h3 className="text-2xl font-bold mb-2">Dashboard Overview</h3>
                <p className="text-blue-100">Real-time insights at your fingertips</p>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {[
                    { label: 'Active Customers', value: '1,234' },
                    { label: 'Total Points Issued', value: '45.6K' },
                    { label: 'Stamps Collected', value: '789' },
                    { label: 'Repeat Purchase Rate', value: '+27%' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600" 
                        style={{ width: `${85 - (i * 20)}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}