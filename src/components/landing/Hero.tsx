import React from 'react';
import { ArrowRight, ShoppingBag } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative min-h-[90vh] md:min-h-screen bg-gradient-to-b from-slate-900 to-indigo-900 flex items-center pt-20 md:pt-0">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550305080-4e029753abcf?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-5" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-500/10 backdrop-blur-sm text-blue-300 px-4 py-2 rounded-full mb-6">
              <ShoppingBag className="w-5 h-5" />
              <span>E-commerce Loyalty Platform</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-8">
              Pelanggan Beli Berkali-kali
              <span className="block mt-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Dengan Kad Loyalti Digital
              </span>
            </h1>

            <p className="text-lg md:text-xl text-blue-100 mb-8 md:mb-12">
              Tingkatkan REPEAT ORDER di website anda dengan Kad Loyalti Digital, Sistem Points, Lucky Draw, Whatsapp Blaster - Semua di satu platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:opacity-90 font-medium inline-flex items-center justify-center gap-2 text-lg">
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white/10 text-white hover:bg-white/20 rounded-lg font-medium text-lg backdrop-blur-sm">
                Hubungi Kami
              </button>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-2xl opacity-30" />
            <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <img
                src="https://da7e222249b86929a6e8d7df12b6e53c.cdn.bubble.io/f1734362922576x583642774442858800/Untitled%20design%20%2815%29.png?_gl=1*40hhnj*_gcl_au*MjA4MjkyMDkxMC4xNzM0MzE5MjM1*_ga*MTI1NDY4NTQ0MS4xNzAzMDgwNTEw*_ga_BFPVR2DEE2*MTczNDM2Mjc5Ny4yNDEuMS4xNzM0MzYyODM3LjIwLjAuMA..?auto=format&fit=crop&q=80"
                alt="Loyalty Dashboard"
                className="rounded-lg shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}