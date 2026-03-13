'use client';

import React, { useState } from 'react';
import { Database, RefreshCw, Sparkles, Home, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

export default function DevAdminPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPopulating, setIsPopulating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
  };

  const handleSeed = async () => {
    if (!confirm("Are you sure you want to seed the database? This will add initial data.")) return;
    setIsSeeding(true);
    addLog("Starting database seed...");
    try {
      const res = await fetch('/api/admin/seed');
      const data = await res.json();
      addLog(data.message || data.error || "Seed completed");
    } catch (err) {
      addLog("Failed to seed database");
    } finally {
      setIsSeeding(false);
    }
  };

  const handlePopulateQuality = async () => {
    if (!confirm("This will fetch quality scores for all games. It might take a while. Continue?")) return;
    setIsPopulating(true);
    addLog("Starting quality score population...");
    try {
      const res = await fetch('/api/admin/games/sync-gamepix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sid: "ZA727", 
          page: 1, 
          pagination: 96, 
          mode: 'sync_all', 
          totalPages: 10 // Increased for better coverage
        })
      });
      const data = await res.json();
      if (data.success) {
        addLog(`Successfully updated quality scores for ${data.stats.updated} games!`);
        if (data.logs) data.logs.forEach((l: string) => addLog(l));
      } else {
        addLog("Error: " + data.error);
      }
    } catch (err) {
      addLog("Failed to populate quality scores");
    } finally {
      setIsPopulating(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    addLog("Starting game sync...");
    try {
      const res = await fetch('/api/sync');
      const data = await res.json();
      addLog(`Synced ${data.synced} games from GamePix!`);
    } catch (err) {
      addLog("Failed to sync games");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-4xl font-black uppercase tracking-tighter italic flex items-center gap-3">
              <ShieldAlert className="text-amber-500 w-10 h-10" />
              Dev <span className="text-emerald-500">Admin</span> Bypass
            </h1>
            <p className="text-white/40 font-medium">Direct database management for AI Studio environment.</p>
          </div>
          <Link href="/" className="glass p-3 rounded-full hover:bg-white/10 transition-all">
            <Home className="w-6 h-6" />
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSeed}
            disabled={isSeeding}
            className="glass p-8 rounded-3xl border border-white/10 flex flex-col items-center gap-4 text-center hover:border-emerald-500/50 transition-all disabled:opacity-50"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <Database className={`w-8 h-8 text-emerald-500 ${isSeeding ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="font-black uppercase tracking-tight">Seed Database</h3>
              <p className="text-xs text-white/40 mt-1">Initialize with sample data</p>
            </div>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePopulateQuality}
            disabled={isPopulating}
            className="glass p-8 rounded-3xl border border-white/10 flex flex-col items-center gap-4 text-center hover:border-amber-500/50 transition-all disabled:opacity-50"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <Sparkles className={`w-8 h-8 text-amber-500 ${isPopulating ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="font-black uppercase tracking-tight">Populate Quality</h3>
              <p className="text-xs text-white/40 mt-1">Sync scores from GamePix</p>
            </div>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSync}
            disabled={isSyncing}
            className="glass p-8 rounded-3xl border border-white/10 flex flex-col items-center gap-4 text-center hover:border-blue-500/50 transition-all disabled:opacity-50"
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <RefreshCw className={`w-8 h-8 text-blue-500 ${isSyncing ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="font-black uppercase tracking-tight">Sync Games</h3>
              <p className="text-xs text-white/40 mt-1">Fetch new games from feed</p>
            </div>
          </motion.button>
        </div>

        <div className="glass rounded-3xl border border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Operation Logs</h3>
            <button onClick={() => setLogs([])} className="text-[10px] uppercase font-bold text-emerald-500 hover:underline">Clear</button>
          </div>
          <div className="p-6 h-64 overflow-y-auto font-mono text-[10px] space-y-1 scrollbar-hide">
            {logs.length === 0 ? (
              <p className="text-white/20 italic">No operations performed yet...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="text-white/60 border-l-2 border-emerald-500/30 pl-3 py-1 bg-white/5 rounded-r-lg">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl space-y-3">
          <h4 className="font-black uppercase tracking-tight text-amber-500 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" />
            Security Notice
          </h4>
          <p className="text-xs text-white/60 leading-relaxed">
            This page bypasses the standard admin authentication to allow management from the AI Studio environment. 
            It is intended for development use only. To use the full CMS, please add your AI Studio URL to the 
            <strong> Authorized redirect URIs</strong> in your Google Cloud Console.
          </p>
          <div className="bg-black/40 p-3 rounded-xl font-mono text-[10px] text-emerald-400 break-all">
            {typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : 'Loading...'}
          </div>
        </div>
      </div>
    </div>
  );
}
