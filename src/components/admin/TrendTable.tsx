'use client';

import { useState } from "react";
import { Trash2, FileText, Sparkles, CheckCircle2, AlertCircle, RefreshCw, ArrowUpRight, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Trend {
  id: string;
  keyword: string;
  searchVolume: number;
  status: string;
  type?: string;
  lastUpdated: string;
  shadowTitle?: string;
  shadowSlug?: string;
}

export function TrendTable({ initialTrends }: { initialTrends: Trend[] }) {
  const [trends, setTrends] = useState<Trend[]>(initialTrends);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const toggleSelectAll = () => {
    if (selectedIds.size === trends.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(trends.map(t => t.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} trends?`)) return;

    setIsLoading('deleting');
    setError(null);
    try {
      const res = await fetch('/api/admin/trends/shadow-page', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) })
      });
      const data = await res.json();
      if (data.success) {
        setTrends(trends.filter(t => !selectedIds.has(t.id)));
        setSelectedIds(new Set());
        setSuccess(data.message);
      } else {
        setError(data.error || "Deletion failed");
      }
    } catch (err) {
      setError("Network error during deletion");
    } finally {
      setIsLoading(null);
    }
  };

  const handleCreateShadowPage = async (trend: Trend, type: 'game' | 'article') => {
    setIsLoading(trend.id);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/admin/trends/shadow-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trendId: trend.id, keyword: trend.keyword, type })
      });
      const data = await res.json();
      if (data.success) {
        setTrends(trends.map(t => t.id === trend.id ? { ...t, status: 'shadow_page_live', shadowTitle: data.data.title, shadowSlug: data.data.slug } : t));
        setSuccess(data.message);
      } else {
        setError(data.error || "Shadow page creation failed");
      }
    } catch (err) {
      setError("Network error during shadow page creation");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl"
          >
            <div className="flex items-center gap-4">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-500">{selectedIds.size} Selected</span>
              <button 
                onClick={handleDeleteSelected}
                disabled={isLoading === 'deleting'}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors disabled:opacity-50"
              >
                {isLoading === 'deleting' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                Delete Selected
              </button>
            </div>
            <button 
              onClick={() => setSelectedIds(new Set())}
              className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
            >
              Clear Selection
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Messages */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-widest"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 text-emerald-500 text-xs font-bold uppercase tracking-widest"
          >
            <CheckCircle2 className="w-4 h-4" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass rounded-3xl overflow-hidden border border-white/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="p-6 w-10">
                <input 
                  type="checkbox" 
                  checked={selectedIds.size === trends.length && trends.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500"
                />
              </th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Keyword</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Volume</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Type</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Status</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {trends.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-12 h-12 text-white/10" />
                    <p className="text-sm font-bold text-white/20 uppercase tracking-widest">No trends detected yet. Click refresh to start mining.</p>
                  </div>
                </td>
              </tr>
            ) : (
              trends.map((trend) => (
                <tr key={trend.id} className={`hover:bg-white/5 transition-colors group ${selectedIds.has(trend.id) ? 'bg-emerald-500/5' : ''}`}>
                  <td className="p-6">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(trend.id)}
                      onChange={() => toggleSelect(trend.id)}
                      className="w-4 h-4 rounded border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold group-hover:text-emerald-500 transition-colors">{trend.keyword}</span>
                      {trend.shadowSlug && (
                        <a href={`/trending/${trend.shadowSlug}`} target="_blank" className="text-emerald-500/60 hover:text-emerald-500">
                          <ArrowUpRight className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-xs font-bold text-white/60">{trend.searchVolume.toLocaleString()}</span>
                  </td>
                  <td className="p-6">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                      trend.type === 'rising' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-white/5 text-white/40 border-white/10'
                    }`}>
                      {trend.type || 'top'}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      trend.status === 'shadow_page_live' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                      trend.status === 'detected' ? 'bg-white/5 text-white/40 border-white/10' :
                      'bg-white/5 text-white/40 border-white/10'
                    }`}>
                      {trend.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleCreateShadowPage(trend, 'game')}
                        disabled={isLoading === trend.id}
                        className="p-2 bg-white/5 hover:bg-emerald-500/10 rounded-lg text-white/40 hover:text-emerald-500 transition-all group/btn relative"
                        title="Create Shadow Page"
                      >
                        {isLoading === trend.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        <span className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-black text-[8px] font-black uppercase tracking-widest rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap z-10">Shadow Page</span>
                      </button>
                      <button 
                        onClick={() => handleCreateShadowPage(trend, 'article')}
                        disabled={isLoading === trend.id}
                        className="p-2 bg-white/5 hover:bg-orange-500/10 rounded-lg text-white/40 hover:text-orange-500 transition-all group/btn relative"
                        title="Create Article"
                      >
                        {isLoading === trend.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                        <span className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-black text-[8px] font-black uppercase tracking-widest rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap z-10">Article</span>
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedIds(new Set([trend.id]));
                          handleDeleteSelected();
                        }}
                        className="p-2 bg-white/5 hover:bg-red-500/10 rounded-lg text-white/40 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
