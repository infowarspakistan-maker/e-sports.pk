import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit2, Copy, SlidersHorizontal, ArrowLeft, Save, X, Image as ImageIcon, Link as LinkIcon, GripVertical, Search } from 'lucide-react';

const SearchableSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder 
}: { 
  options: {value: string, label: string}[], 
  value: string, 
  onChange: (v: string) => void,
  placeholder: string
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  const selectedOption = options.find(o => o.value === value);

  return (
    <div ref={wrapperRef} className="relative w-2/3">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-black/40 border border-white/10 rounded px-5 py-4 text-white font-mono text-sm cursor-pointer flex justify-between items-center hover:border-[#00D4FF]/50 transition-colors"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
      </div>
      
      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-[#121B2A] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-64">
          <div className="p-3 border-b border-white/10 relative">
            <Search className="absolute left-6 top-6 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              autoFocus
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white font-mono text-xs focus:border-[#00D4FF] focus:outline-none transition-all"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="overflow-y-auto p-2">
            {filteredOptions.length > 0 ? filteredOptions.map(opt => (
              <div 
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); setSearch(''); }}
                className={`p-3 rounded-lg text-sm font-mono cursor-pointer transition-colors ${value === opt.value ? 'bg-[#00D4FF]/20 text-[#00D4FF]' : 'text-gray-300 hover:bg-white/5'}`}
              >
                {opt.label}
              </div>
            )) : (
              <div className="p-4 text-center text-xs text-gray-500 font-mono">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
import { getSliders, addSlider, deleteSlider, updateSlider, type Slider, type Slide } from '../../lib/sliderService';
import { getDynamicGames, type Game } from '../../lib/gamesService';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export function SliderManager() {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'edit'>('list');
  const [activeSlider, setActiveSlider] = useState<Slider | null>(null);
  
  // Slider Form
  const [sliderForm, setSliderForm] = useState({
    title: '',
    status: 'draft' as const
  });

  // Slide Form
  const [isEditingSlide, setIsEditingSlide] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [slideForm, setSlideForm] = useState<Omit<Slide, 'id'>>({
    title: '',
    content: '',
    imageUrl: '',
    linkUrl: ''
  });

  // Link Selection State
  const [linkType, setLinkType] = useState<'custom' | 'game' | 'tournament' | 'news'>('custom');
  const [games, setGames] = useState<Game[]>([]);
  const [tournaments, setTournaments] = useState<{id: string, name: string}[]>([]);
  const [news, setNews] = useState<{id: string, title: string}[]>([]);

  useEffect(() => {
    fetchSliders();
    fetchLinkOptions();
  }, []);

  const fetchLinkOptions = async () => {
    try {
      const g = await getDynamicGames();
      setGames(g);

      const tSnap = await getDocs(collection(db, 'tournaments'));
      setTournaments(tSnap.docs.map(d => ({ id: d.id, name: d.data().name })));

      const nSnap = await getDocs(query(collection(db, 'news'), orderBy('createdAt', 'desc'), limit(20)));
      setNews(nSnap.docs.map(d => ({ id: d.id, title: d.data().title })));
    } catch (err) {
      console.error('Failed to load link options', err);
    }
  };

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleSort = async () => {
    if (!activeSlider || dragItem.current === null || dragOverItem.current === null) return;
    
    let updatedSlides = [...(activeSlider.slides || [])];
    const draggedItemContent = updatedSlides.splice(dragItem.current, 1)[0];
    updatedSlides.splice(dragOverItem.current, 0, draggedItemContent);
    
    dragItem.current = null;
    dragOverItem.current = null;
    
    setActiveSlider({ ...activeSlider, slides: updatedSlides });
    
    try {
      await updateSlider(activeSlider.id, { slides: updatedSlides });
      fetchSliders();
    } catch (err) {
      console.error("Failed to reorder slides", err);
    }
  };

  const fetchSliders = async () => {
    setLoading(true);
    try {
      const data = await getSliders();
      setSliders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSlider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addSlider({ title: sliderForm.title, status: sliderForm.status, slides: [] });
      setSliderForm({ title: '', status: 'draft' });
      setActiveTab('list');
      fetchSliders();
    } catch (e) {
      alert("Failed to create slider. Check permissions.");
    }
  };

  const handleDeleteSlider = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entire slider?")) return;
    try {
      await deleteSlider(id);
      fetchSliders();
    } catch (e) {
      alert("Failed to delete slider. Check permissions.");
    }
  };

  const handleToggleStatus = async (slider: Slider) => {
    const newStatus = slider.status === 'published' ? 'draft' : 'published';
    try {
      await updateSlider(slider.id, { status: newStatus });
      fetchSliders();
      if (activeSlider?.id === slider.id) {
        setActiveSlider({ ...slider, status: newStatus });
      }
    } catch (e) {
      alert("Failed to update status.");
    }
  };

  const handleEditSlider = (slider: Slider) => {
    setActiveSlider(slider);
    setActiveTab('edit');
    setIsEditingSlide(false);
  };

  const handleOpenSlideEditor = (slide?: Slide) => {
    if (slide) {
      setEditingSlide(slide);
      setSlideForm({
        title: slide.title,
        content: slide.content,
        imageUrl: slide.imageUrl || '',
        linkUrl: slide.linkUrl || ''
      });
      
      if (slide.linkUrl) {
        if (slide.linkUrl.startsWith('/game/')) setLinkType('game');
        else if (slide.linkUrl.startsWith('/tournaments?id=')) setLinkType('tournament');
        else if (slide.linkUrl.startsWith('/news?id=')) setLinkType('news');
        else setLinkType('custom');
      } else {
        setLinkType('custom');
      }
    } else {
      setEditingSlide(null);
      setSlideForm({
        title: '',
        content: '',
        imageUrl: '',
        linkUrl: ''
      });
      setLinkType('custom');
    }
    setIsEditingSlide(true);
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSlider) return;

    let updatedSlides: Slide[];
    if (editingSlide) {
      updatedSlides = activeSlider.slides.map(s => 
        s.id === editingSlide.id ? { ...s, ...slideForm } : s
      );
    } else {
      const newSlide: Slide = {
        id: Date.now().toString(),
        ...slideForm
      };
      updatedSlides = [...(activeSlider.slides || []), newSlide];
    }

    try {
      await updateSlider(activeSlider.id, { slides: updatedSlides });
      setIsEditingSlide(false);
      fetchSliders();
      setActiveSlider({ ...activeSlider, slides: updatedSlides });
    } catch (e) {
      console.error("Failed to update slides:", e);
      alert("Failed to save slide. Check permissions.");
    }
  };

  const handleDeleteSlide = async (slider: Slider, slideId: string) => {
    if (!confirm("Delete this slide?")) return;
    const updatedSlides = slider.slides.filter(s => s.id !== slideId);
    try {
      await updateSlider(slider.id, { slides: updatedSlides });
      fetchSliders();
      setActiveSlider({ ...slider, slides: updatedSlides });
    } catch (e) {
      alert("Failed to delete slide.");
    }
  };

  return (
    <div className="space-y-6 relative z-10">
      {/* Nested Tabs Header */}
      <div className="flex border-b border-white/5">
        <button 
          onClick={() => setActiveTab('list')}
          className={`px-8 py-4 font-mono text-[10px] font-bold uppercase tracking-widest transition-all ${
            activeTab === 'list' ? 'text-[#00D4FF] border-b-2 border-[#00D4FF]' : 'text-[#A0A0AB] hover:text-white'
          }`}
        >
          All Sliders
        </button>
        <button 
          onClick={() => setActiveTab('create')}
          className={`px-8 py-4 font-mono text-[10px] font-bold uppercase tracking-widest transition-all ${
            activeTab === 'create' ? 'text-[#00D4FF] border-b-2 border-[#00D4FF]' : 'text-[#A0A0AB] hover:text-white'
          }`}
        >
          Create New Collection
        </button>
        {activeTab === 'edit' && activeSlider && (
          <button 
            className="px-8 py-4 font-mono text-[10px] font-bold uppercase tracking-widest text-[#00D4FF] border-b-2 border-[#00D4FF]"
          >
            Editing: {activeSlider.title}
          </button>
        )}
      </div>

      {activeTab === 'list' && (
        <div className="animate-in fade-in duration-500">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-white tracking-tight">Slider Collection Overview</h2>
              <p className="text-sm text-[#A0A0AB] font-mono mt-2 uppercase tracking-widest text-[10px]">Manage platform-wide promotional banners.</p>
            </div>
          </div>

          <div className="premium-gaming-card overflow-hidden">
            <table className="w-full text-left text-sm text-[#A0A0AB]">
              <thead className="bg-white/5 uppercase text-[10px] font-mono font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4">Slider Identity</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Active Slides</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-20 text-center font-mono">Synchronizing with Firestore...</td></tr>
                ) : sliders.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-20 text-center font-mono text-xs">No collections found. Switch to the "Create" tab to start.</td></tr>
                ) : (
                  sliders.map((slider) => (
                    <tr key={slider.id} className="hover:bg-white/2 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-white font-bold group-hover:text-[#00D4FF] transition-colors cursor-pointer" onClick={() => handleEditSlider(slider)}>
                            {slider.title}
                          </span>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-[#666]">ID: {slider.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-widest ${
                          slider.status === 'published' ? 'bg-[#00D4FF]/10 text-[#00D4FF]' : 'bg-white/5 text-[#A0A0AB]'
                        }`}>
                          {slider.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono">{slider.slides?.length || 0} Slides</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => handleEditSlider(slider)} className="p-2 hover:text-[#00D4FF] transition-colors" title="Manage Slides"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteSlider(slider.id)} className="p-2 hover:text-red-500 transition-colors" title="Delete Slider"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div className="animate-in slide-in-from-right-4 duration-500">
          <div className="premium-gaming-card p-8 max-w-2xl">
            <h2 className="text-2xl font-display font-bold text-white uppercase tracking-tight mb-6 italic">Initialize New Slider</h2>
            <form onSubmit={handleCreateSlider} className="space-y-6">
              <div>
                <label className="block text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest mb-3">Slider Collection Title</label>
                <input 
                  required 
                  type="text" 
                  value={sliderForm.title} 
                  onChange={e => setSliderForm({...sliderForm, title: e.target.value})} 
                  className="w-full bg-black/40 border border-white/10 rounded px-5 py-4 text-white font-mono text-sm focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/30 outline-none transition-all"
                  placeholder="e.g. Home Page Main Hero"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest mb-3">Initial Status</label>
                <select 
                  value={sliderForm.status}
                  onChange={e => setSliderForm({...sliderForm, status: e.target.value as any})}
                  className="w-full bg-black/40 border border-white/10 rounded px-5 py-4 text-white font-mono text-sm focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/30 outline-none transition-all"
                >
                  <option value="draft">Draft (Private)</option>
                  <option value="published">Published (Visible to all)</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setActiveTab('list')}
                  className="flex-1 px-8 py-4 border border-white/10 rounded-xl font-mono text-xs font-bold uppercase tracking-widest text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-2 px-8 py-4 bg-[#00D4FF] text-black rounded-xl font-mono text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all hover:scale-[1.02] active:scale-95"
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'edit' && activeSlider && (
        <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
          {isEditingSlide ? (
            <div className="premium-gaming-card p-8 animate-in zoom-in duration-300">
               <div className="border-b border-white/5 pb-6 mb-8 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tight italic">
                    {editingSlide ? 'Modify Slide Asset' : 'New Visual Entry'}
                  </h3>
                  <p className="text-[#A0A0AB] font-mono text-[10px] uppercase tracking-[0.2em] mt-2">
                    Configure asset for: {activeSlider.title}
                  </p>
                </div>
                <button onClick={() => setIsEditingSlide(false)} className="text-[#A0A0AB] hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSaveSlide} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest mb-3">Slide Display Title</label>
                    <input 
                      required 
                      type="text" 
                      value={slideForm.title} 
                      onChange={e => setSlideForm({...slideForm, title: e.target.value})} 
                      className="w-full bg-black/40 border border-white/10 rounded px-5 py-4 text-white font-mono text-sm focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/30 outline-none transition-all"
                      placeholder="e.g. National Championship 2026"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest mb-3">Description / Subtitle Content</label>
                    <textarea 
                      value={slideForm.content} 
                      onChange={e => setSlideForm({...slideForm, content: e.target.value})} 
                      className="w-full bg-black/40 border border-white/10 rounded px-5 py-4 text-white font-mono text-sm focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/30 outline-none transition-all"
                      rows={4}
                      placeholder="Provide a compelling call-to-action or description..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest mb-3">Primary Action Link</label>
                    <div className="flex gap-2 mb-2">
                      <select
                        value={linkType}
                        onChange={e => {
                          setLinkType(e.target.value as any);
                          setSlideForm({...slideForm, linkUrl: ''});
                        }}
                        className="w-1/3 bg-black/40 border border-white/10 rounded px-3 py-4 text-white font-mono text-xs focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/30 outline-none transition-all"
                      >
                        <option value="custom">Custom URL</option>
                        <option value="game">Game Page</option>
                        <option value="tournament">Tournament</option>
                        <option value="news">News Article</option>
                      </select>

                      {linkType === 'custom' && (
                        <div className="relative w-2/3">
                          <LinkIcon className="absolute left-4 top-4.5 text-[#00D4FF] w-4 h-4" />
                          <input 
                            type="text" 
                            value={slideForm.linkUrl} 
                            onChange={e => setSlideForm({...slideForm, linkUrl: e.target.value})} 
                            className="w-full bg-black/40 border border-white/10 rounded pl-12 pr-5 py-4 text-white font-mono text-sm focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/30 outline-none transition-all"
                            placeholder="/tournaments or external URL"
                          />
                        </div>
                      )}

                      {linkType === 'game' && (
                        <SearchableSelect 
                          value={slideForm.linkUrl}
                          onChange={v => setSlideForm({...slideForm, linkUrl: v})}
                          placeholder="-- Select Game --"
                          options={games.map(g => ({ value: `/game/${g.id}`, label: g.name }))}
                        />
                      )}

                      {linkType === 'tournament' && (
                        <SearchableSelect 
                          value={slideForm.linkUrl}
                          onChange={v => setSlideForm({...slideForm, linkUrl: v})}
                          placeholder="-- Select Tournament --"
                          options={tournaments.map(t => ({ value: `/tournaments?id=${t.id}`, label: t.name }))}
                        />
                      )}

                      {linkType === 'news' && (
                        <SearchableSelect 
                          value={slideForm.linkUrl}
                          onChange={v => setSlideForm({...slideForm, linkUrl: v})}
                          placeholder="-- Select News Article --"
                          options={news.map(n => ({ value: `/news?id=${n.id}`, label: n.title }))}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest mb-3">Promotional Image URL</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-4 top-4.5 text-[#00D4FF] w-4 h-4" />
                      <input 
                        required
                        type="url" 
                        value={slideForm.imageUrl} 
                        onChange={e => setSlideForm({...slideForm, imageUrl: e.target.value})} 
                        className="w-full bg-black/40 border border-white/10 rounded pl-12 pr-5 py-4 text-white font-mono text-sm focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/30 outline-none transition-all"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <label className="block text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest mb-3">Visual Preview</label>
                    <div className="aspect-video w-full bg-black/60 rounded-xl border border-white/5 overflow-hidden relative group">
                      {slideForm.imageUrl ? (
                        <img 
                          src={slideForm.imageUrl} 
                          alt="Preview" 
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[#A0A0AB] font-mono text-xs">
                          No image URL provided
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-6 flex flex-col justify-end">
                        <h4 className="text-white font-bold text-lg truncate">{slideForm.title || 'Slide Title Preview'}</h4>
                        <p className="text-gray-400 text-xs line-clamp-1">{slideForm.content || 'Description preview content...'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex gap-4">
                    <button 
                      type="button" 
                      onClick={() => setIsEditingSlide(false)}
                      className="flex-1 px-8 py-4 border border-white/10 rounded-xl font-mono text-xs font-bold uppercase tracking-widest text-white hover:bg-white/5 transition-all"
                    >
                      Back to Gallery
                    </button>
                    <button 
                      type="submit" 
                      className="flex-2 px-8 py-4 bg-[#00D4FF] text-black rounded-xl font-mono text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all hover:scale-[1.02] active:scale-95"
                    >
                      {editingSlide ? 'Update Slide' : 'Add to Collection'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/2 p-8 rounded-2xl border border-white/5">
                <div>
                  <h2 className="text-3xl font-display font-black text-white tracking-tight uppercase italic">{activeSlider.title}</h2>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${activeSlider.status === 'published' ? 'bg-[#00D4FF]' : 'bg-gray-600'}`} />
                      <span className="text-[10px] text-[#A0A0AB] font-mono uppercase tracking-widest">{activeSlider.status}</span>
                    </div>
                    <button 
                      onClick={() => handleToggleStatus(activeSlider)}
                      className="text-[9px] font-mono text-[#00D4FF] hover:underline uppercase tracking-widest"
                    >
                      Switch to {activeSlider.status === 'published' ? 'Draft' : 'Published'}
                    </button>
                    <span className="text-white/10">|</span>
                    <p className="text-[10px] text-[#00D4FF] font-mono font-bold uppercase tracking-widest">{activeSlider.slides.length} Assets Attached</p>
                  </div>
                </div>
                <div className="flex gap-4">
                   <button 
                    onClick={() => setActiveTab('list')}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-4 rounded-xl font-mono text-xs font-bold uppercase tracking-widest transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" /> All Sliders
                  </button>
                  <button 
                    onClick={() => handleOpenSlideEditor()}
                    className="flex items-center gap-2 bg-[#00D4FF] hover:bg-white text-black px-8 py-4 rounded-xl font-mono text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:scale-105 active:scale-95"
                  >
                    <Plus className="w-5 h-5" /> Add Slide
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {(activeSlider.slides || []).map((slide, index) => (
                  <div 
                    key={slide.id} 
                    draggable
                    onDragStart={(e) => { dragItem.current = index; }}
                    onDragEnter={(e) => { dragOverItem.current = index; }}
                    onDragEnd={handleSort}
                    onDragOver={(e) => e.preventDefault()}
                    className="premium-gaming-card group overflow-hidden flex flex-col h-full border-white/5 hover:border-[#00D4FF]/30 transition-all cursor-move"
                  >
                    <div className="h-48 relative overflow-hidden">
                      <div className="absolute top-3 left-3 z-20 p-1.5 bg-black/60 rounded backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="w-4 h-4 text-[#A0A0AB]" />
                      </div>
                      <img 
                        src={slide.imageUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&auto=format&fit=crop'} 
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" 
                        alt={slide.title} 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                      <div className="absolute top-3 right-3 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <button onClick={() => handleOpenSlideEditor(slide)} className="p-2.5 bg-black/80 backdrop-blur-md rounded-xl hover:bg-[#00D4FF] hover:text-black transition-all border border-white/10"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteSlide(activeSlider, slide.id)} className="p-2.5 bg-black/80 backdrop-blur-md rounded-xl hover:bg-red-500 text-white transition-all border border-white/10"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-white font-bold text-lg mb-2 truncate group-hover:text-[#00D4FF] transition-colors tracking-tight">{slide.title}</h3>
                      <p className="text-xs text-[#A0A0AB] font-body line-clamp-3 leading-relaxed mb-4">{slide.content || 'No descriptive content provided for this asset.'}</p>
                      
                      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                        {slide.linkUrl ? (
                          <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#00D4FF] uppercase tracking-widest font-bold">
                            <LinkIcon className="w-3 h-3" /> 
                            {slide.linkUrl.length > 20 ? slide.linkUrl.substring(0, 15) + '...' : slide.linkUrl}
                          </div>
                        ) : (
                          <span className="text-[9px] font-mono text-gray-600 uppercase">No Link</span>
                        )}
                        <div className="text-[9px] font-mono text-gray-500 uppercase">Asset: {slide.id.slice(-4)}</div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {activeSlider.slides.length === 0 && (
                  <div className="col-span-full py-32 text-center border-2 border-dashed border-white/10 rounded-3xl bg-white/2">
                    <ImageIcon className="w-12 h-12 text-[#333] mx-auto mb-4" />
                    <p className="text-[#A0A0AB] font-mono text-sm max-w-xs mx-auto uppercase tracking-widest">Collection Empty</p>
                    <button 
                      onClick={() => handleOpenSlideEditor()}
                      className="mt-6 text-[#00D4FF] font-mono text-xs font-bold uppercase tracking-[0.2em] hover:underline"
                    >
                      + Add First Slide
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
