import React from 'react';
import { Shield, Target, Award, Heart } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto py-16 px-4 space-y-16">
      {/* Intro */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
          Building Pakistan's <span className="text-[#1A73E8]">Esports Future</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-gray-300">
          E-Sports Pakistan is the nation's first complete, game-agnostic, and platform-agnostic esports ecosystem connecting players, teams, sponsors, and fans.
        </p>
      </div>

      {/* Grid values */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-transparent border border-white/10 p-8 rounded-2xl space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-[#E8F0FE] text-[#1A73E8] rounded-full flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Our Mission</h2>
          <p className="text-gray-300">
            To create structured pathways for Pakistani esports talent to reach the global stage. We build the digital infrastructure necessary for grassroots players to get trained, signed, and sponsored by world-class organizations.
          </p>
        </div>

        <div className="bg-transparent border border-white/10 p-8 rounded-2xl space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-[#E6F4EA] text-[#137333] rounded-full flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Our Vision</h2>
          <p className="text-gray-300">
            To establish Pakistan as a leading regional hub for esports, celebrated for high-quality production, competitive integrity, and a professional pool of game-agnostic athletic talent.
          </p>
        </div>
      </div>

      {/* Core Values */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Our Values</h2>
          <p className="text-gray-300 mt-2">The core beliefs that guide our platform development and tournament rules.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-transparent border border-white/10 p-6 rounded-2xl text-center space-y-2">
            <div className="w-10 h-10 bg-[#FEF7E0] text-[#B06000] rounded-full flex items-center justify-center mx-auto mb-2">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white">Competitive Integrity</h3>
            <p className="text-sm text-gray-400">We stand for fair play, robust rulebooks, and zero tolerance for hacking or cheating.</p>
          </div>

          <div className="bg-transparent border border-white/10 p-6 rounded-2xl text-center space-y-2">
            <div className="w-10 h-10 bg-[#FCE8E6] text-[#C5221F] rounded-full flex items-center justify-center mx-auto mb-2">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white">Inclusivity</h3>
            <p className="text-sm text-gray-400">From arcade fighters to battle royales, console to mobile; all competitors are celebrated equally.</p>
          </div>

          <div className="bg-transparent border border-white/10 p-6 rounded-2xl text-center space-y-2">
            <div className="w-10 h-10 bg-[#E8F0FE] text-[#1A73E8] rounded-full flex items-center justify-center mx-auto mb-2">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white">Talent Development</h3>
            <p className="text-sm text-gray-400">Providing the training grounds, coaching courses, and tools necessary for continuous growth.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
