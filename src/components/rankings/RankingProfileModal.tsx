import React, { useEffect, useState } from 'react';
import { X, Trophy, TrendingUp, Calendar, Shield, User } from 'lucide-react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const RankingProfileModal = ({ entry, onClose, themeColor }: { entry: any, onClose: () => void, themeColor: string }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'rankingHistory'),
          where('rankingId', '==', entry.id),
          orderBy('timestamp', 'asc')
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => {
          const d = doc.data();
          return {
            ...d,
            id: doc.id,
            date: d.timestamp?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || 'Unknown',
          };
        });
        setHistory(data);
      } catch (err) {
        console.error("Error fetching history", err);
      }
      setLoading(false);
    };

    if (entry) {
      fetchHistory();
    }
  }, [entry]);

  if (!entry) return null;

  // Chart data
  const chartData = history.map((h, index) => ({
    name: h.date,
    points: h.newPoints,
  }));

  // If no history, just show current points
  if (chartData.length === 0) {
    chartData.push({ name: 'Current', points: entry.points });
  } else if (chartData[chartData.length - 1].points !== entry.points) {
    chartData.push({ name: 'Current', points: entry.points });
  }

  // Calculate Win/Loss streak (dummy logic if not available in real DB yet, or we just map from recent history if they increased points)
  // For now, let's derive a simple "form" string from history:
  let formString = history.slice(-5).map((h, i, arr) => {
    if (i === 0) return 'W';
    return h.newPoints > arr[i-1].newPoints ? 'W' : (h.newPoints < arr[i-1].newPoints ? 'L' : '-');
  }).join('-');
  
  if (!formString) formString = 'W-W-W'; // placeholder

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div 
          className="p-6 border-b border-white/10 relative overflow-hidden"
          style={{ backgroundImage: `linear-gradient(to right, ${themeColor}22, transparent)` }}
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 transition-colors">
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-[#121B2A] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden shadow-xl">
              {entry.avatarUrl ? (
                <img src={entry.avatarUrl} alt={entry.entityName} className="w-full h-full object-cover" />
              ) : (
                entry.entityType === 'team' ? <Shield className="w-10 h-10 text-gray-500" /> : <User className="w-10 h-10 text-gray-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-widest bg-white/10 text-gray-300">
                  Rank #{entry.rank}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: themeColor, backgroundColor: `${themeColor}22` }}>
                  {entry.region || 'Pakistan'}
                </span>
              </div>
              <h2 className="text-3xl font-display font-black text-white uppercase italic tracking-tighter">
                {entry.entityName}
              </h2>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#121B2A] border border-white/5 rounded-xl p-4 text-center">
              <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Points</p>
              <p className="text-2xl font-display font-black text-white">{entry.points}</p>
            </div>
            <div className="bg-[#121B2A] border border-white/5 rounded-xl p-4 text-center">
              <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Trend</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                {entry.trend === 'up' && <TrendingUp className="w-5 h-5 text-green-400" />}
                {entry.trend === 'down' && <TrendingUp className="w-5 h-5 text-red-400 rotate-180" />}
                {entry.trend === 'same' && <TrendingUp className="w-5 h-5 text-gray-400" />}
              </div>
            </div>
            <div className="bg-[#121B2A] border border-white/5 rounded-xl p-4 text-center col-span-2 md:col-span-2">
              <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Recent Form</p>
              <div className="flex justify-center gap-1 mt-2">
                {formString.split('-').map((res, i) => (
                  <span key={i} className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${res === 'W' ? 'bg-green-500/20 text-green-400' : res === 'L' ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-gray-400'}`}>
                    {res}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <TrendingUp className="w-3 h-3" /> Points History
            </h3>
            <div className="h-48 w-full bg-[#121B2A] border border-white/5 rounded-xl p-4">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center text-gray-500 font-mono text-sm">Loading chart...</div>
              ) : chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#666" fontSize={10} tickFormatter={(val) => `${val}`} axisLine={false} tickLine={false} width={40} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#2A2A35', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                      itemStyle={{ color: themeColor }}
                    />
                    <Line type="monotone" dataKey="points" stroke={themeColor} strokeWidth={3} dot={{ r: 4, fill: '#0A0A0A', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 font-mono text-xs text-center px-4">
                  Not enough historical data to generate chart. Points update log will appear here after tournaments.
                </div>
              )}
            </div>
          </div>
          
          {history.length > 0 && (
            <div>
              <h3 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Recent Log
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {[...history].reverse().slice(0, 5).map(h => (
                  <div key={h.id} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5 text-xs font-mono">
                    <span className="text-gray-400">{h.date}</span>
                    <div className="flex gap-4">
                      {h.type === 'auto_sync' ? (
                        <span className="text-blue-400">Tournament Sync</span>
                      ) : (
                        <span className="text-gray-300">Admin Edit</span>
                      )}
                      <span className="font-bold text-white">{h.previousPoints} → {h.newPoints}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
