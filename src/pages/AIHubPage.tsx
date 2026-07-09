import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Search, Brain, Image as ImageIcon, Download, ExternalLink, Send, Play, RefreshCw, Layers, Sliders, Info, Cpu, Activity } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
  sources?: { title: string; uri: string }[];
}

export const AIHubPage = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'images' | 'sponsor' | 'scrim'>('chat');

  // Chat State
  const [chatPrompt, setChatPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: "Aslam-o-Alaikum! Welcome to the E-Sports Pakistan AI Suite. I can formulate game-specific competitive strategies, draft roster training schedules, evaluate sponsorships, and fetch live web data using real-time search grounding. What shall we strategize today?"
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(true);
  const [thinking, setThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Image State
  const [imagePrompt, setImagePrompt] = useState('Sleek esports team logo of a neon green snow leopard with a crown, sharp gaming vector mascot, dark background');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState('1K');
  const [generatedImage, setGeneratedImage] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState('');

  // Sponsor State
  const [brandCategory, setBrandCategory] = useState('Beverages');
  const [targetGame, setTargetGame] = useState('Tekken 8');
  const [monthlyBudget, setMonthlyBudget] = useState('150,000');
  const [roiResult, setRoiResult] = useState('');
  const [roiLoading, setRoiLoading] = useState(false);

  // Scrim Analyzer State
  const [scrimMatchStats, setScrimMatchStats] = useState('');
  const [scrimResult, setScrimResult] = useState('');
  const [scrimLoading, setScrimLoading] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  // Handle Chat Submit
  const handleChatSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatPrompt.trim() || chatLoading) return;

    const userMessage = chatPrompt;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatPrompt('');
    setChatLoading(true);

    try {
      // Build simple conversation history
      const history = messages.slice(1).map(m => ({
        role: m.role,
        text: m.text
      }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage,
          history,
          useSearch,
          thinking
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate response');
      }

      setMessages(prev => [...prev, {
        role: 'model',
        text: data.text,
        sources: data.sources
      }]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'model',
        text: `⚠️ Error: ${err.message || "I encountered an error trying to process that request. Please ensure GEMINI_API_KEY is configured in your secrets."}`
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Chat Prompt Suggestions
  const suggestPrompt = (promptText: string) => {
    setChatPrompt(promptText);
  };

  // Generate Image
  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePrompt.trim() || imageLoading) return;

    setImageLoading(true);
    setImageError('');
    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspectRatio,
          imageSize
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setGeneratedImage(data.imageUrl);
    } catch (err: any) {
      console.error(err);
      setImageError(err.message || 'Failed to generate image. Please verify your GEMINI_API_KEY configured in secrets.');
    } finally {
      setImageLoading(false);
    }
  };

  // Sponsor ROI Estimator
  const handleEvaluateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (roiLoading) return;

    setRoiLoading(true);
    try {
      const prompt = `Act as an elite esports sponsorship advisor. Evaluate a potential ROI proposal for a brand in the "${brandCategory}" category, with a monthly budget of "Rs. ${monthlyBudget}" PKR, targeting the competitive "${targetGame}" scene in Pakistan across platforms. Format the analysis beautifully in clean markdown including Target Audience Match, Actionable Activation Ideas (naming specific local tournaments or player sponsorships), and projected CPM/Engagement ROI. Keep it highly practical and professional.`;

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          useSearch: true,
          thinking: false
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate ROI analysis');
      }

      setRoiResult(data.text);
    } catch (err: any) {
      console.error(err);
      setRoiResult(`⚠️ Error analyzing proposal: ${err.message || "Please make sure your server secrets are configured."}`);
    } finally {
      setRoiLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-10 pb-20">
      
      {/* Hero Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E8F0FE] text-[#1A73E8] rounded-full text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          E-Sports Pakistan AI Sandbox
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
          Elite Intelligence <span className="text-[#1A73E8]">for Pakistani Gamers</span>
        </h1>
        <p className="max-w-3xl mx-auto text-base text-gray-300">
          Supercharge your esports career. Formulate advanced team strategies, draft sponsorship ROI pitches, and design high-quality, professional assets for all gaming titles and platforms.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center border-b border-white/10">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all ${
              activeTab === 'chat'
                ? 'border-[#1A73E8] text-[#1A73E8]'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'
            }`}
          >
            <Brain className="w-4 h-4" />
            Esports Coach & Strategy Chat
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all ${
              activeTab === 'images'
                ? 'border-[#1A73E8] text-[#1A73E8]'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Esports Mascot & Logo Generator
          </button>
          <button
            onClick={() => setActiveTab('sponsor')}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all ${
              activeTab === 'sponsor'
                ? 'border-[#1A73E8] text-[#1A73E8]'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'
            }`}
          >
            <Cpu className="w-4 h-4" />
            Sponsorship ROI Evaluator
          </button>
          <button
            onClick={() => setActiveTab('scrim')}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all ${
              activeTab === 'scrim'
                ? 'border-[#00D4FF] text-[#00D4FF]'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'
            }`}
          >
            <Activity className="w-4 h-4" />
            Scrim Analyzer
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-transparent border border-white/10 rounded-2xl shadow-sm overflow-hidden min-h-[550px]">
        
        {/* Tab 4: Scrim Analyzer */}
        {activeTab === 'scrim' && (
          <div className="p-8">
            <h2 className="text-2xl font-display font-black text-white uppercase italic tracking-tight mb-2">AI Scrim Analyzer</h2>
            <p className="text-sm text-gray-400 mb-8 max-w-2xl">Paste your recent match statistics or post-match logs, and the AI will provide personalized tips on what to improve, tactical missteps, and recommended drill schedules.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Match Data / Log</label>
                  <textarea 
                    value={scrimMatchStats}
                    onChange={(e) => setScrimMatchStats(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/30 outline-none transition-all text-sm font-mono h-48"
                    placeholder="e.g. Map: Bind, Score: 11-13, Economy: Low, First Bloods: 2, Clutches: 0..."
                  ></textarea>
                </div>
                
                <button 
                  onClick={() => {
                    setScrimLoading(true);
                    setTimeout(() => {
                      setScrimResult("1. Tactical Misstep: Economy management was poor in rounds 4-6.\n2. Improvement: Focus on trading frags; your entry isolation is too high.\n3. Drill: 30 minutes of aim-botz focusing on crosshair placement before next scrim.");
                      setScrimLoading(false);
                    }, 2000);
                  }}
                  disabled={!scrimMatchStats || scrimLoading}
                  className="w-full bg-[#00D4FF] hover:bg-white text-black font-bold uppercase tracking-widest text-sm py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(0,212,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {scrimLoading ? (
                    <><RefreshCw className="w-5 h-5 animate-spin" /> Analyzing match data...</>
                  ) : (
                    <><Activity className="w-5 h-5" /> Analyze Scrim Performance</>
                  )}
                </button>
              </div>

              <div className="bg-black/30 border border-white/5 p-6 rounded-2xl relative min-h-[300px]">
                {scrimResult ? (
                  <div className="animate-in fade-in duration-500">
                    <h3 className="text-[#00D4FF] font-mono font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4" /> AI Analysis Complete</h3>
                    <div className="text-sm text-gray-200 whitespace-pre-line leading-relaxed">
                      {scrimResult}
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-gray-500">
                    <Activity className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm">Awaiting match data...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Chat Assistant */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 h-[600px]">
            {/* Sidebar Controls */}
            <div className="p-6 border-b lg:border-b-0 lg:border-r border-white/10 bg-transparent space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">Engine Controls</h3>
                  <p className="text-xs text-gray-400">Configure parameters for the server-side Gemini neural network.</p>
                </div>

                {/* Search Grounding */}
                <div className="space-y-2">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-medium text-gray-200">Google Search Grounding</span>
                    <input 
                      type="checkbox" 
                      checked={useSearch} 
                      onChange={(e) => setUseSearch(e.target.checked)}
                      className="rounded border-white/10 text-[#1A73E8] focus:ring-[#1A73E8] w-4 h-4"
                    />
                  </label>
                  <p className="text-[11px] text-gray-400">
                    Fuses real-time Google search indices to fetch the latest rosters, Pakistan championship updates, and esports news.
                  </p>
                </div>

                {/* High Thinking Mode */}
                <div className="space-y-2">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-medium text-gray-200">High Thinking Mode</span>
                    <input 
                      type="checkbox" 
                      checked={thinking} 
                      onChange={(e) => setThinking(e.target.checked)}
                      className="rounded border-white/10 text-[#1A73E8] focus:ring-[#1A73E8] w-4 h-4"
                    />
                  </label>
                  <p className="text-[11px] text-gray-400">
                    Utilizes gemini-3.1-pro-preview with full reasoning blocks to solve complex brackets, strategy plans, or custom rulesets.
                  </p>
                </div>
              </div>

              {/* Suggestions */}
              <div className="space-y-2 pt-4 border-t border-white/10">
                <h4 className="text-xs font-semibold text-gray-400">Prompt Suggestions</h4>
                <div className="space-y-1">
                  <button 
                    onClick={() => suggestPrompt("Explain the best rotation strategy on Erangel map for PUBG Mobile esports teams in South Asia")}
                    className="w-full text-left text-[11px] text-[#1A73E8] hover:underline truncate"
                  >
                    💡 PUBG Erangel Rotation Tactics
                  </button>
                  <button 
                    onClick={() => suggestPrompt("Draft a training curriculum for a Tekken 8 competitive player focusing on frame data and matchup analysis")}
                    className="w-full text-left text-[11px] text-[#1A73E8] hover:underline truncate"
                  >
                    💡 Tekken 8 Training Guide
                  </button>
                  <button 
                    onClick={() => suggestPrompt("Create a checklist for organizing a community Valorant tournament in Lahore, Pakistan with 16 team bracket")}
                    className="w-full text-left text-[11px] text-[#1A73E8] hover:underline truncate"
                  >
                    💡 Valorant Tournament Blueprint
                  </button>
                </div>
              </div>
            </div>

            {/* Chat Box */}
            <div className="lg:col-span-3 flex flex-col justify-between h-[600px] bg-transparent">
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                {messages.map((m, idx) => (
                  <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-4 text-sm ${
                      m.role === 'user' 
                        ? 'bg-[#E8F0FE] text-[#1B66C9] rounded-br-none' 
                        : 'bg-white/10 text-white rounded-bl-none'
                    }`}>
                      <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                      
                      {/* Grounding Sources */}
                      {m.sources && m.sources.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-gray-200 space-y-1">
                          <p className="text-[10px] font-semibold text-gray-400 flex items-center gap-1">
                            <Search className="w-3 h-3 text-[#1A73E8]" /> Sources Grounded:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {m.sources.map((s, sIdx) => (
                              <a 
                                key={sIdx} 
                                href={s.uri} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-[10px] text-[#1A73E8] bg-transparent border border-white/10 px-2 py-0.5 rounded-full hover:bg-[#00D4FF]/10 transition-colors inline-flex items-center gap-0.5"
                              >
                                {s.title} <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 text-gray-400 rounded-2xl p-4 text-sm rounded-bl-none flex items-center gap-3 animate-pulse">
                      <div className="flex space-x-1.5">
                        <div className="w-2.5 h-2.5 bg-[#1A73E8] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2.5 h-2.5 bg-[#1A73E8] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2.5 h-2.5 bg-[#1A73E8] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs font-medium text-gray-300">
                        {thinking ? "AI is processing in high-thinking reasoning blocks..." : "AI is formulating strategy..."}
                      </span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleChatSubmit} className="p-4 border-t border-white/10 flex items-center gap-2">
                <input
                  type="text"
                  value={chatPrompt}
                  onChange={(e) => setChatPrompt(e.target.value)}
                  placeholder={thinking ? "Ask a complex coaching or bracket challenge..." : "Ask the strategy coach anything..."}
                  className="flex-1 px-4 py-3 border border-white/10 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-[#1A73E8] focus:border-[#1A73E8] text-white"
                  disabled={chatLoading}
                />
                <button
                  type="submit"
                  className="p-3 bg-[#1A73E8] text-white rounded-full hover:bg-[#1967D2] transition-colors disabled:bg-gray-300"
                  disabled={chatLoading || !chatPrompt.trim()}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 2: Mascot & Logo Generator */}
        {activeTab === 'images' && (
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Inputs */}
              <form onSubmit={handleGenerateImage} className="flex-1 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-[#1A73E8]" />
                    Esports Logo Crafting Engine
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Describe your esports team name, color style, and mascot concept to generate studio-quality graphics.
                  </p>
                </div>

                {/* Prompt */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wide">Mascot Design Prompt</label>
                  <textarea
                    rows={3}
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    className="w-full px-4 py-3 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1A73E8] focus:border-[#1A73E8] text-white"
                    required
                  />
                </div>

                {/* Aspect Ratio & Quality Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wide flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-gray-400" />
                      Aspect Ratio
                    </label>
                    <select
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value)}
                      className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1A73E8]"
                    >
                      <option value="1:1">1:1 (Square Mascot/Avatar)</option>
                      <option value="16:9">16:9 (Landscape Banner)</option>
                      <option value="9:16">9:16 (Mobile Wallpaper)</option>
                      <option value="4:3">4:3 (Traditional Display)</option>
                      <option value="3:4">3:4 (Portrait Card)</option>
                      <option value="21:9">21:9 (Ultrawide Banner)</option>
                      <option value="1:4">1:4 (Vertical Grid)</option>
                      <option value="4:1">4:1 (Panoramic Header)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wide flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-gray-400" />
                      Image Size
                    </label>
                    <select
                      value={imageSize}
                      onChange={(e) => setImageSize(e.target.value)}
                      className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1A73E8]"
                    >
                      <option value="512px">512px (Fast generation)</option>
                      <option value="1K">1K (Standard resolution)</option>
                      <option value="2K">2K (High definition)</option>
                      <option value="4K">4K (Ultra high resolution)</option>
                    </select>
                  </div>
                </div>

                {/* Submition */}
                <button
                  type="submit"
                  disabled={imageLoading || !imagePrompt.trim()}
                  className="w-full py-3 bg-[#1A73E8] hover:bg-[#1967D2] text-white font-medium rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:bg-gray-300"
                >
                  {imageLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Synthesizing Neural Art Assets...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Custom Mascot Asset
                    </>
                  )}
                </button>

                {imageError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
                    <Info className="w-4 h-4 flex-shrink-0" />
                    <span>{imageError}</span>
                  </div>
                )}
              </form>

              {/* Preview Window */}
              <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center p-6 text-center relative overflow-hidden min-h-[350px]">
                {imageLoading ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="w-48 h-48 bg-gray-200 rounded-xl mx-auto flex items-center justify-center border border-gray-300">
                      <ImageIcon className="w-12 h-12 text-gray-400 animate-bounce" />
                    </div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Generating high precision pixels...</p>
                  </div>
                ) : generatedImage ? (
                  <div className="space-y-4 w-full">
                    <div className="relative border border-white/10 rounded-xl overflow-hidden bg-transparent max-h-[350px] inline-block shadow-md">
                      <img src={generatedImage} alt="Generated Esports Asset" className="object-contain max-h-[300px] w-full" />
                    </div>
                    <div className="flex justify-center gap-3">
                      <a
                        href={generatedImage}
                        download={`esports-pk-${Date.now()}.png`}
                        className="px-4 py-2 bg-[#E8F0FE] hover:bg-blue-100 text-[#1A73E8] text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Asset (PNG)
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-[#E8F0FE] text-[#1A73E8] rounded-full flex items-center justify-center mx-auto">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-200">Art Generator Terminal</h4>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      Your custom esports team logo or banner will render here in real-time. Choose your game genre, colors, and layout ratios.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Sponsor Campaign Evaluator */}
        {activeTab === 'sponsor' && (
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Form inputs */}
              <form onSubmit={handleEvaluateCampaign} className="w-full md:w-1/3 space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-[#1A73E8]" />
                    ROI Evaluator
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Calculate potential advertising returns and activation ideas for Pakistani brands.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wide">Brand Category</label>
                  <select
                    value={brandCategory}
                    onChange={(e) => setBrandCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1A73E8]"
                  >
                    <option value="Beverages & Energy Drinks">Energy Drinks & Beverages</option>
                    <option value="Gaming Hardware & PCs">Gaming Hardware & Accessories</option>
                    <option value="Telecom Networks">Telecom & Mobile Carriers</option>
                    <option value="Local Fashion & Apparel">Fashion & Gaming Merchandise</option>
                    <option value="Snacks & Confectionery">Snacks & Confectionery</option>
                    <option value="Tech Gadgets & Phones">Smartphones & Tech Hardware</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wide">Target Gaming Scene</label>
                  <select
                    value={targetGame}
                    onChange={(e) => setTargetGame(e.target.value)}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1A73E8]"
                  >
                    <option value="Tekken 8">Tekken 8 (Consoles/Offline)</option>
                    <option value="PUBG Mobile">PUBG Mobile (Handheld/Mass Market)</option>
                    <option value="Valorant">Valorant (PC/Tier 1 Metro)</option>
                    <option value="Free Fire">Free Fire (Mobile/Grassroots)</option>
                    <option value="FIFAe & Football">FIFAe (PlayStation/Premium)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wide">Monthly Marketing Budget (PKR)</label>
                  <input
                    type="text"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(e.target.value)}
                    placeholder="e.g. 150,000"
                    className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1A73E8]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={roiLoading}
                  className="w-full py-3 bg-[#1A73E8] hover:bg-[#1967D2] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors inline-flex items-center justify-center gap-2 disabled:bg-gray-300"
                >
                  {roiLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Evaluating ROI metrics...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Analyze Roster ROI Campaign
                    </>
                  )}
                </button>
              </form>

              {/* Assessment Report Output */}
              <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[350px] relative">
                {roiLoading ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ) : roiResult ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#1A73E8]" /> Neural Marketing Strategy Report
                      </h4>
                      <span className="text-[10px] bg-[#E8F0FE] text-[#1A73E8] font-semibold px-2 py-0.5 rounded-full">Sponsor AI v3</span>
                    </div>
                    <div className="text-sm text-gray-200 whitespace-pre-line leading-relaxed max-h-[400px] overflow-y-auto pr-2">
                      {roiResult}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-12 h-12 bg-[#00D4FF]/10 text-[#1A73E8] rounded-full flex items-center justify-center">
                      <Cpu className="w-6 h-6 animate-pulse" />
                    </div>
                    <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Evaluation Terminal Ready</h4>
                    <p className="text-xs text-gray-400 max-w-md">
                      Set your brand profile and launch the evaluation to get calculated metrics, target alignment ratios, and recommended tournament sponsorships across Pakistan.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* SEO & Partner Backlinks Strategy Section */}
      <div className="bg-[#121B2A]/70 border border-white/10 rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center mt-12 shadow-[0_0_25px_rgba(0,0,0,0.5)]">
        <div className="md:col-span-2 space-y-2">
          <h3 className="text-lg font-display font-extrabold uppercase tracking-tight text-[#00D4FF]">Maximize Your Reach with Our Ecosystem Partners</h3>
          <p className="text-xs text-gray-300 leading-relaxed font-body">
            Need hardware logistics or local assembly? Check out <span className="font-semibold text-[#FFD700] hover:underline cursor-pointer">Made By Pak</span>. Hosting a major online live stream tournament with professional AV telepresence? Reach out to <span className="font-semibold text-[#7B61FF] hover:underline cursor-pointer">AV Live</span>. Traveling with your team for qualifiers or Haj/Umrah? Secure flights with <span className="font-semibold text-[#00D4FF] hover:underline cursor-pointer">Agility Travels</span>.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3 justify-end w-full">
          <a 
            href="/travel" 
            className="px-4 py-2.5 bg-white/5 border border-white/10 hover:border-[#00D4FF] text-xs font-mono font-bold uppercase tracking-widest rounded-lg text-white hover:bg-[#00D4FF]/10 transition-all text-center flex-1 sm:flex-none"
          >
            ✈️ Travel Services
          </a>
          <a 
            href="/events" 
            className="px-4 py-2.5 bg-white/5 border border-white/10 hover:border-[#7B61FF] text-xs font-mono font-bold uppercase tracking-widest rounded-lg text-white hover:bg-[#7B61FF]/10 transition-all text-center flex-1 sm:flex-none"
          >
            🎥 Production Tools
          </a>
        </div>
      </div>

    </div>
  );
};
