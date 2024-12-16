import React from 'react';
import { AlertTriangle, DollarSign, Users, Clock } from 'lucide-react';

export function Problems() {
  const problems = [
    {
      icon: Users,
      title: 'Hilang Customer ',
      description: 'Customer masuk web anda tapi beli dekat website pesaing sebab mereka tawarkan offer yang lebih menarik',
      stat: '70%',
      statLabel: 'customer cari website yang bagi offer yang menarik dan berbaloi.'
    },
    {
      icon: DollarSign, 
      title: 'Repeat Sales Rendah',
      description: 'Customer sedia ada lari dan beli di website pesaing menyebabkan kos marketing tinggi.',
      stat: '5x',
      statLabel: 'ganda lebih mahal untuk cari customer baru berbanding jaga customer sedia ada.'
    },
    {
      icon: Clock,
      title: 'Follow-up Secara Manual',
      description: 'Membazir banyak masa sehari untuk hantar Whatsapp kepada customer',
      stat: '15hrs',
      statLabel: 'dihabiskan dalam seminggu untuk Whatsapp customer'
    }
  ];

  return (
    <div className="relative bg-slate-900 py-16 md:py-24">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e5_1px,transparent_1px),linear-gradient(to_bottom,#4f46e5_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-10" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2 rounded-full mb-6">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Masalah Utama</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Anda selalu hadapi masalah ni dalam
            <span className="block mt-2 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Bisnes E-Commerce?
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
            Jangan biarkan masalah ni menghalang anda. Masa untuk buat customer "GILAKAN" kedai anda!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {problems.map((problem, index) => (
            <div 
              key={index}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-500/10 rounded-xl mb-6">
                <problem.icon className="w-6 h-6 text-red-400" />
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-4">
                {problem.title}
              </h3>
              
              <p className="text-slate-300 mb-6">
                {problem.description}
              </p>

              <div className="pt-6 border-t border-white/10">
                <div className="text-3xl font-bold text-red-400 mb-1">
                  {problem.stat}
                </div>
                <div className="text-sm text-slate-400">
                  {problem.statLabel}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}