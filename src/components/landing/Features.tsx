import React from 'react';
import { Stamp, Coins, Gift, MessageCircle, BarChart2, Users, BellRing, ArrowRightCircle } from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: Stamp,
      title: 'Kad Loyalti Digital',
      description: 'Tukar, cipta dan guna kad loyalti digital untuk e-commerce anda.',
      image: 'https://da7e222249b86929a6e8d7df12b6e53c.cdn.bubble.io/f1734363952048x897568228443306200/Untitled%20design%20%2817%29.png?_gl=1*rthfci*_gcl_au*MjA4MjkyMDkxMC4xNzM0MzE5MjM1*_ga*MTI1NDY4NTQ0MS4xNzAzMDgwNTEw*_ga_BFPVR2DEE2*MTczNDM2Mjc5Ny4yNDEuMS4xNzM0MzYyODM3LjIwLjAuMA..?auto=format&fit=crop&q=80'
    },
    {
      icon: Coins,
      title: 'Points System',
      description: 'Reward customer dengan points disetiap pembelian.',
      image: 'https://da7e222249b86929a6e8d7df12b6e53c.cdn.bubble.io/f1734364487525x959118896993393000/Untitled%20design%20%2818%29.png?_gl=1*1clsuni*_gcl_au*MjA4MjkyMDkxMC4xNzM0MzE5MjM1*_ga*MTI1NDY4NTQ0MS4xNzAzMDgwNTEw*_ga_BFPVR2DEE2*MTczNDM2Mjc5Ny4yNDEuMS4xNzM0MzYyODM3LjIwLjAuMA..?auto=format&fit=crop&q=80'
    },
    {
      icon: Gift,
      title: 'Lucky Draws',
      description: 'Cipta kempen lucky draw untuk pastikan customer repat order.',
      image: 'https://da7e222249b86929a6e8d7df12b6e53c.cdn.bubble.io/f1734364888382x698249194395321100/Untitled%20design%20%2819%29.png?_gl=1*18n4h2d*_gcl_au*MjA4MjkyMDkxMC4xNzM0MzE5MjM1*_ga*MTI1NDY4NTQ0MS4xNzAzMDgwNTEw*_ga_BFPVR2DEE2*MTczNDM2Mjc5Ny4yNDEuMS4xNzM0MzYyODM3LjIwLjAuMA..?auto=format&fit=crop&q=80'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp Blaster',
      description: 'Hantar Whatsapp Promotion dan engagement ke semua database customer anda.',
      image: 'https://da7e222249b86929a6e8d7df12b6e53c.cdn.bubble.io/f1734407419891x182794946798255900/Untitled%20design%20%282%29.gif?_gl=1*la9481*_gcl_au*MjA4MjkyMDkxMC4xNzM0MzE5MjM1*_ga*MTI1NDY4NTQ0MS4xNzAzMDgwNTEw*_ga_BFPVR2DEE2*MTczNDQwNzA4Mi4yNDIuMS4xNzM0NDA3Mzc3LjU5LjAuMA..?auto=format&fit=crop&q=80'
    },
    {
      icon: ArrowRightCircle,
      title: 'WhatsApp Auto-followup',
      description: 'Follow-up customer dan prospek secara automatik.',
      image: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&q=80'
    }
  ];

  return (
    <div className="relative bg-white py-16 md:py-24 border-t border-gray-100">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-16">
          <div className="inline-block bg-blue-50 px-4 py-2 rounded-full mb-4">
            <span className="text-blue-600 font-medium">Funsi Utama</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Loyalti Platform #1 yang Bisnes Anda Perlukan
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Cipta, urus dan tingkatkan sales e-commerce anda
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 md:gap-16">
          {features.map((feature, index) => (
            <div key={index} className={`grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center ${
              index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'
            }`}>
              <div>
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full mb-6">
                  <feature.icon className="w-5 h-5" />
                  <span className="font-medium">{feature.title}</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  {feature.description}
                </h3>
                {feature.title === 'WhatsApp Blaster' && (
                  <div className="space-y-4 text-lg text-gray-600">
                    <p>• Hantar Unlimited Whatsapp hanya dengan 1 klik</p>
                    <p>• Filter customer berdasarkan tarikh pembelian</p>
                    <p>• Mudah, simple dan padat</p>
                  </div>
                )}
                {feature.title === 'WhatsApp Auto-followup' && (
                  <div className="space-y-4 text-lg text-gray-600">
                    <p>• Automatic order detection whatsapp</p>
                    <p>• Automatic Abandoned cart detection whatsapp</p>
                    <p>• Schedule whatsapp follow-up</p>
                  </div>
              )}
                {feature.title === 'Lucky Draws' && (
                  <div className="space-y-4 text-lg text-gray-600">
                    <p>• Tarik customer dengan hadiah menarik</p>
                    <p>• Automatic whatsapp notification kepada pemenang</p>
                    <p>• Cipta dan guna customer lucky draw untuk setiap e-commerce anda</p>
                  </div>
              )}
                {feature.title === 'Points System' && (
                  <div className="space-y-4 text-lg text-gray-600">
                    <p>• Tarik customer dengan hadiah menarik</p>
                    <p>• Automatic whatsapp notification kepada pemenang</p>
                    <p>• Cipta dan guna customer lucky draw untuk setiap e-commerce anda</p>
                  </div>
               )}
                {feature.title === 'Kad Loyalti Digital' && (
                  <div className="space-y-4 text-lg text-gray-600">
                    <p>• Tarik customer dengan hadiah menarik</p>
                    <p>• Automatic whatsapp notification kepada pemenang</p>
                    <p>• Cipta dan guna customer lucky draw untuk setiap e-commerce anda</p>
                  </div>
                )}
              </div>
              <div className="bg-gradient-to-br from-gray-100 to-gray-50 p-8 rounded-2xl">
                <img 
                  src={feature.image}
                  alt={feature.title}
                  className="rounded-xl shadow-2xl w-full"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {[
            { icon: Users, value: '1k+', label: 'Active Users' },
            { icon: BarChart2, value: 'RM500K+', label: 'Sales Generated' },
            { icon: MessageCircle, value: '98%', label: 'Customer Satisfaction' }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-4">
                <stat.icon className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}