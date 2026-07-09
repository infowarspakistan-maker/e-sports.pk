import React, { useState } from 'react';
import { SUPPORTED_GAMES, PLATFORMS } from '../../lib/constants';

export const TournamentCreationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    game: '',
    platform: '',
    prizePool: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="w-full min-w-[320px] max-w-2xl mx-auto p-6 bg-[#1A1A2E] rounded-xl border border-[#2A2A40] shadow-2xl overflow-y-auto max-h-[80vh]">
      <h2 className="text-2xl font-display font-bold text-white mb-6">Create New Tournament</h2>
      <form className="w-full space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-sm font-medium text-[#A0A0B8] mb-1">Tournament Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 bg-[#0A0A0F] border border-[#2A2A40] rounded text-white focus:border-[#00D4FF] focus:outline-none transition-colors"
            placeholder="e.g. Pakistan Tekken Championship 2026"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#A0A0B8] mb-1">Game</label>
            <select
              name="game"
              value={formData.game}
              onChange={handleChange}
              className="w-full p-3 bg-[#0A0A0F] border border-[#2A2A40] rounded text-white focus:border-[#00D4FF] focus:outline-none"
              required
            >
              <option value="">Select Game</option>
              {SUPPORTED_GAMES.map(game => (
                <option key={game.id} value={game.id}>{game.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#A0A0B8] mb-1">Platform</label>
            <select
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              className="w-full p-3 bg-[#0A0A0F] border border-[#2A2A40] rounded text-white focus:border-[#00D4FF] focus:outline-none"
              required
            >
              <option value="">Select Platform</option>
              {PLATFORMS.map(platform => (
                <option key={platform.id} value={platform.id}>{platform.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#A0A0B8] mb-1">Prize Pool (₨)</label>
          <input
            type="number"
            name="prizePool"
            value={formData.prizePool}
            onChange={handleChange}
            className="w-full p-3 bg-[#0A0A0F] border border-[#2A2A40] rounded text-white focus:border-[#00D4FF] focus:outline-none"
            placeholder="e.g. 500000"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#A0A0B8] mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3 bg-[#0A0A0F] border border-[#2A2A40] rounded text-white focus:border-[#00D4FF] focus:outline-none h-32"
            placeholder="Describe the tournament details..."
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#00D4FF] hover:bg-white text-black font-bold py-3 rounded-lg shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-all duration-200"
        >
          Create Tournament
        </button>
      </form>
    </div>
  );
};
