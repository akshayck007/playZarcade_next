'use client';

import { Database, RefreshCw, Plus, Sparkles, Gamepad2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function AdminHeaderActions() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPopulating, setIsPopulating] = useState(false);

  const handleSeed = async () => {
    if (!confirm("Are you sure you want to seed the database? This will add initial data.")) return;
    setIsSeeding(true);
    try {
      const res = await fetch('/api/admin/seed');
      const data = await res.json();
      alert(data.message || data.error);
      window.location.reload();
    } catch (err) {
      alert("Failed to seed database");
    } finally {
      setIsSeeding(false);
    }
  };

  const handlePopulateQuality = async () => {
    if (!confirm("This will fetch quality scores for all games. It might take a while. Continue?")) return;
    setIsPopulating(true);
    try {
      // We'll use the advanced sync route with mode=sync_all to ensure quality scores are updated
      const res = await fetch('/api/admin/games/sync-gamepix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sid: "ZA727", 
          page: 1, 
          pagination: 96, 
          mode: 'sync_all', 
          totalPages: 5 
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Successfully updated quality scores for ${data.stats.updated} games!`);
        window.location.reload();
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Failed to populate quality scores");
    } finally {
      setIsPopulating(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync');
      const data = await res.json();
      alert(`Synced ${data.synced} games from GamePix!`);
      window.location.reload();
    } catch (err) {
      alert("Failed to sync games");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex gap-4">
      <button 
        onClick={handleSeed}
        disabled={isSeeding}
        className="glass px-6 py-3 rounded-full font-bold uppercase tracking-tight hover:bg-white/10 transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        <Database className={`w-5 h-5 ${isSeeding ? 'animate-spin' : ''}`} />
        {isSeeding ? 'Seeding...' : 'Seed DB'}
      </button>
      <button 
        onClick={handlePopulateQuality}
        disabled={isPopulating}
        className="glass px-6 py-3 rounded-full font-bold uppercase tracking-tight hover:bg-white/10 transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        <Sparkles className={`w-5 h-5 ${isPopulating ? 'animate-spin' : ''}`} />
        {isPopulating ? 'Populating...' : 'Populate Quality'}
      </button>
      <button 
        onClick={handleSync}
        disabled={isSyncing}
        className="glass px-6 py-3 rounded-full font-bold uppercase tracking-tight hover:bg-white/10 transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
        {isSyncing ? 'Syncing...' : 'Sync Games'}
      </button>
      <Link href="/admin/retro-import" className="glass px-6 py-3 rounded-full font-bold uppercase tracking-tight hover:bg-white/10 transition-colors flex items-center gap-2">
        <Gamepad2 className="w-5 h-5" />
        Retro Import
      </Link>
      <Link href="/admin/games/new" className="bg-emerald-500 text-black px-6 py-3 rounded-full font-black uppercase tracking-tight hover:bg-emerald-400 transition-colors flex items-center gap-2">
        <Plus className="w-5 h-5" />
        Add Game
      </Link>
    </div>
  );
}
