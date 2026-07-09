import React from 'react';
import { Package, ShieldCheck, Factory } from 'lucide-react';

export const MadeInPakistanPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <div className="text-center mb-16">
        <h1 className="text-[32px] font-medium text-white mb-4 tracking-tight">🇵🇰 Products Assembled in Pakistan</h1>
        <p className="text-lg text-gray-300">
          Support local manufacturing with Made By Pak
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <div className="bg-transparent border border-white/10 p-8 rounded-2xl flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div className="h-14 w-14 bg-[#E8F0FE] text-[#1A73E8] rounded-full flex items-center justify-center mb-6">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-medium text-white mb-3">Quality Craftsmanship</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            Products built to last, maintaining the highest quality standards for gamers.
          </p>
        </div>
        
        <div className="bg-transparent border border-white/10 p-8 rounded-2xl flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div className="h-14 w-14 bg-[#E8F0FE] text-[#1A73E8] rounded-full flex items-center justify-center mb-6">
            <Factory className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-medium text-white mb-3">Local Manufacturing</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            Building Pakistan's manufacturing ecosystem by supporting local vendors.
          </p>
        </div>
        
        <div className="bg-transparent border border-white/10 p-8 rounded-2xl flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div className="h-14 w-14 bg-[#E8F0FE] text-[#1A73E8] rounded-full flex items-center justify-center mb-6">
            <Package className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-medium text-white mb-3">Economic Growth</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            Contributing directly to the national economy through local production.
          </p>
        </div>
      </div>
      
      <div className="text-center">
        <a 
          href="https://madebypak.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex bg-[#1A73E8] text-white px-8 py-3 rounded-full text-[15px] font-medium hover:bg-[#1967D2] hover:shadow-md transition-all"
        >
          Visit Made By Pak
        </a>
        <p className="text-sm text-gray-400 mt-6">
          Gaming Accessories • Electronics • Apparel
        </p>
      </div>
    </div>
  );
};
