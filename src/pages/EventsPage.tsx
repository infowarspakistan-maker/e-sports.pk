import React from 'react';
import { MonitorPlay, Video, Mic } from 'lucide-react';

export const EventsPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <div className="text-center mb-16">
        <h1 className="text-[32px] font-medium text-white mb-4 tracking-tight">🎥 Professional Event Production by AV Live</h1>
        <p className="text-lg text-gray-300">
          Pakistan's leader in audio-visual solutions
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <div className="bg-transparent border border-white/10 p-8 rounded-2xl flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div className="h-14 w-14 bg-[#E8F0FE] text-[#1A73E8] rounded-full flex items-center justify-center mb-6">
            <MonitorPlay className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-medium text-white mb-3">Live Streaming</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            Broadcast-grade live streaming and event production for esports tournaments.
          </p>
        </div>
        
        <div className="bg-transparent border border-white/10 p-8 rounded-2xl flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div className="h-14 w-14 bg-[#E8F0FE] text-[#1A73E8] rounded-full flex items-center justify-center mb-6">
            <Video className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-medium text-white mb-3">Video Conferencing</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            Ready-to-use video conferencing rooms across major cities in Pakistan.
          </p>
        </div>
        
        <div className="bg-transparent border border-white/10 p-8 rounded-2xl flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div className="h-14 w-14 bg-[#E8F0FE] text-[#1A73E8] rounded-full flex items-center justify-center mb-6">
            <Mic className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-medium text-white mb-3">AV Solutions</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            Custom audio-visual setups for complex installations and massive stages.
          </p>
        </div>
      </div>
      
      <div className="text-center">
        <a 
          href="https://avlive.com.pk" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex bg-[#1A73E8] text-white px-8 py-3 rounded-full text-[15px] font-medium hover:bg-[#1967D2] hover:shadow-md transition-all"
        >
          Visit AV Live
        </a>
        <p className="text-sm text-gray-400 mt-6">
          Serving Karachi, Lahore, Islamabad, Peshawar & Quetta
        </p>
      </div>
    </div>
  );
};
