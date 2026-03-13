'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, RefreshCw, Database, AlertTriangle, CheckCircle2, Play, Layers } from 'lucide-react';

export default function GamePixSyncPage() {
  const [sid, setSid] = useState('ZA727');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(96);
  const [totalPages, setTotalPages] = useState(5);
  const [mode, setMode] = useState<'sync' | 'sync_all' | 'categorize_only'>('sync');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFullSyncing, setIsFullSyncing] = useState(false);
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    addLog(`Initiating GamePix Sync (Start Page: ${page}, Total Pages: ${totalPages}, Pagination: ${pagination})...`);

    try {
      const response = await fetch('/api/admin/games/sync-gamepix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sid, page, pagination, mode, totalPages })
      });

      const data = await response.json();
      if (data.success) {
        if (data.logs) {
          setLogs(prev => [...prev, ...data.logs]);
        }
        addLog(`SUCCESS: Sync completed. Updated: ${data.stats.updated}, New Categories: ${data.stats.newCategories}`);
      } else {
        addLog(`ERROR: ${data.error}`);
      }
    } catch (error: any) {
      addLog(`CRITICAL ERROR: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateAllSid = async (e: React.MouseEvent) => {
    e.preventDefault();
    const confirmed = window.confirm(`This will update the SID to "${sid}" for ALL games in your database. Continue?`);
    if (!confirmed) return;
    
    setIsUpdatingAll(true);
    addLog(`Starting bulk SID update to: ${sid}...`);

    try {
      const response = await fetch('/api/admin/games/update-sid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sid })
      });

      const data = await response.json();
      if (data.success) {
        addLog(`SUCCESS: ${data.message}`);
      } else {
        addLog(`ERROR: ${data.error}`);
      }
    } catch (error: any) {
      addLog(`CRITICAL ERROR: ${error.message}`);
    } finally {
      setIsUpdatingAll(false);
    }
  };

  const handleCategorizeAll = async () => {
    if (isSyncing || isFullSyncing) return;
    setIsSyncing(true);
    addLog(`Initiating Deep Categorization (Crawling 50 pages with 96 items each)...`);

    try {
      const response = await fetch('/api/admin/games/sync-gamepix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sid, page: 1, pagination: 96, mode: 'sync', totalPages: 50 })
      });

      const data = await response.json();
      if (data.success) {
        if (data.logs) {
          setLogs(prev => [...prev, ...data.logs]);
        }
        addLog(`SUCCESS: Deep Categorization completed. Updated: ${data.stats.updated}`);
      } else {
        addLog(`ERROR: ${data.error}`);
      }
    } catch (error: any) {
      addLog(`CRITICAL ERROR: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFullRecursiveSync = async () => {
    if (isSyncing || isFullSyncing) return;
    
    const confirmed = window.confirm("This will recursively fetch ALL games from GamePix until no more are found. This may take several minutes. Continue?");
    if (!confirmed) return;

    setIsFullSyncing(true);
    addLog(`🚀 STARTING FULL RECURSIVE SYNC (SID: ${sid})...`);
    
    let currentPage = 1;
    let totalUpdated = 0;
    let totalNewCategories = 0;
    let hasMore = true;

    try {
      while (hasMore) {
        addLog(`📦 Processing Page ${currentPage}...`);
        const response = await fetch('/api/admin/games/sync-gamepix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sid, page: currentPage, pagination: 96, mode: 'sync_all', totalPages: 1 })
        });

        const data = await response.json();
        
        if (!data.success) {
          addLog(`❌ ERROR on Page ${currentPage}: ${data.error}`);
          hasMore = false;
          break;
        }

        if (data.logs) {
          // Only add meaningful logs to avoid cluttering
          const meaningfulLogs = data.logs.filter((l: string) => l.includes('SUCCESS') || l.includes('Creating') || l.includes('Error'));
          setLogs(prev => [...prev, ...meaningfulLogs]);
        }

        totalUpdated += data.stats.updated;
        totalNewCategories += data.stats.newCategories;

        // If we fetched fewer than 96 items, we've reached the end
        // Or if the API explicitly says 0 items fetched
        const fetchedCount = data.logs?.find((l: string) => l.includes('Fetched'))?.match(/\d+/)?.[0];
        if (!fetchedCount || parseInt(fetchedCount) === 0) {
          hasMore = false;
          addLog(`🏁 Reached end of feed at page ${currentPage}.`);
        } else {
          currentPage++;
          // Small delay to avoid hitting rate limits too hard
          await new Promise(r => setTimeout(r, 500));
        }
      }

      addLog(`✨ FULL SYNC COMPLETE!`);
      addLog(`📊 Stats: ${totalUpdated} games processed, ${totalNewCategories} new categories created.`);
    } catch (error: any) {
      addLog(`⚠️ CRITICAL FAILURE: ${error.message}`);
    } finally {
      setIsFullSyncing(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black uppercase tracking-tighter">GamePix Sync</h1>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Synchronize games and categories from GamePix RSS</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-8 rounded-3xl space-y-6 border border-white/5">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">GamePix SID</label>
                <input 
                  type="text" 
                  value={sid}
                  onChange={(e) => setSid(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  placeholder="e.g. 7E271"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">Page</label>
                  <input 
                    type="number" 
                    value={page}
                    onChange={(e) => setPage(parseInt(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">Per Page (Allowed: 12, 24, 48, 96)</label>
                  <select 
                    value={pagination}
                    onChange={(e) => setPagination(parseInt(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none"
                  >
                    <option value={12} className="bg-[#0a0a0a]">12</option>
                    <option value={24} className="bg-[#0a0a0a]">24</option>
                    <option value={48} className="bg-[#0a0a0a]">48</option>
                    <option value={96} className="bg-[#0a0a0a]">96</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">Total Pages</label>
                  <input 
                    type="number" 
                    value={totalPages}
                    onChange={(e) => setTotalPages(parseInt(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">Sync Mode</label>
                <select 
                  value={mode}
                  onChange={(e) => setMode(e.target.value as any)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none"
                >
                  <option value="sync" className="bg-[#0a0a0a]">Update Existing Only</option>
                  <option value="sync_all" className="bg-[#0a0a0a]">Update & Add New</option>
                  <option value="categorize_only" className="bg-[#0a0a0a]">Categorize Uncategorized</option>
                </select>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <button 
                type="button"
                onClick={handleFullRecursiveSync}
                disabled={isSyncing || isFullSyncing}
                className="w-full bg-emerald-500 text-black font-black uppercase tracking-tighter py-5 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-500/30 border-2 border-emerald-400/50"
              >
                <div className="flex items-center gap-2">
                  {isFullSyncing ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6" />}
                  <span className="text-lg">Full Recursive Sync</span>
                </div>
                <span className="text-[9px] opacity-60">Syncs everything until the end of feed</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={handleSync}
                  disabled={isSyncing || isFullSyncing}
                  className="bg-white/5 text-white font-black uppercase tracking-tighter py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
                >
                  {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Quick Sync
                </button>

                <button 
                  type="button"
                  onClick={handleCategorizeAll}
                  disabled={isSyncing || isFullSyncing}
                  className="bg-white/5 text-white font-black uppercase tracking-tighter py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
                >
                  <Layers className="w-4 h-4" />
                  Categorize
                </button>
              </div>

              <button 
                type="button"
                onClick={(e) => handleUpdateAllSid(e)}
                disabled={isUpdatingAll}
                className="w-full bg-white/5 text-white font-black uppercase tracking-tighter py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
              >
                {isUpdatingAll ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
                Update All SID in DB
              </button>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border border-white/5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-tight">Warning</h4>
              <p className="text-[10px] text-white/40 leading-relaxed font-bold">
                Syncing will overwrite categories and iframe URLs for existing games. Ensure your SID is correct before proceeding.
              </p>
            </div>
          </div>
        </div>

        {/* Console */}
        <div className="lg:col-span-2">
          <div className="glass rounded-3xl overflow-hidden border border-white/5 flex flex-col h-[600px]">
            <div className="bg-white/5 p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Sync Console</span>
              </div>
              <button 
                onClick={() => setLogs([])}
                className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors"
              >
                Clear
              </button>
            </div>
            
            <div 
              ref={scrollRef}
              className="flex-1 p-6 font-mono text-xs overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-white/10"
            >
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/10 space-y-4">
                  <Play className="w-12 h-12" />
                  <span className="font-black uppercase tracking-widest">Ready to sync...</span>
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className={cn(
                    "py-1 border-b border-white/5 last:border-0",
                    log.includes('ERROR') ? "text-red-400" : 
                    log.includes('SUCCESS') ? "text-emerald-400" : 
                    "text-white/60"
                  )}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
