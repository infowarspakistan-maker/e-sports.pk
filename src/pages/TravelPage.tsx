import React from 'react';
import { Plane, GraduationCap, MapPin } from 'lucide-react';

export const TravelPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <div className="text-center mb-16">
        <h1 className="text-[32px] font-medium text-white mb-4 tracking-tight">✈️ Travel with Agility Travels</h1>
        <p className="text-lg text-gray-300">
          Your trusted partner for premium travel services
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <div className="bg-transparent border border-white/10 p-8 rounded-2xl flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div className="h-14 w-14 bg-[#E8F0FE] text-[#1A73E8] rounded-full flex items-center justify-center mb-6">
            <MapPin className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-medium text-white mb-3">Umrah & Haj Packages</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            Premium packages for 2026/2027 with end-to-end encrypted payments and exclusive group travel.
          </p>
        </div>
        
        <div className="bg-transparent border border-white/10 p-8 rounded-2xl flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div className="h-14 w-14 bg-[#E8F0FE] text-[#1A73E8] rounded-full flex items-center justify-center mb-6">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-medium text-white mb-3">Study Abroad</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            Germany, UK, Europe — complete visa processing, admissions, and student housing assistance.
          </p>
        </div>
        
        <div className="bg-transparent border border-white/10 p-8 rounded-2xl flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div className="h-14 w-14 bg-[#E8F0FE] text-[#1A73E8] rounded-full flex items-center justify-center mb-6">
            <Plane className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-medium text-white mb-3">Visa Services</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            Saudi Arabia, UAE, Schengen, UK — fast, reliable processing and documentation guidance.
          </p>
        </div>
      </div>
      
      <div className="text-center">
        <a 
          href="https://agilitytravels.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex bg-[#1A73E8] text-white px-8 py-3 rounded-full text-[15px] font-medium hover:bg-[#1967D2] hover:shadow-md transition-all"
        >
          Visit Agility Travels
        </a>
        <p className="text-sm text-gray-400 mt-6">
          10,000+ happy travelers • Real-time flight updates • Custom itineraries
        </p>
      </div>
    </div>
  );
};
