'use client';

import React, { useState } from 'react';
import { Database, RefreshCw, Sparkles, Home, ShieldAlert, Search, Plus, Trash2, Star, Newspaper } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "@/lib/supabase";
import { GoogleGenAI, Type } from "@google/genai";

export default function DevAdminPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPopulating, setIsPopulating] = useState(false);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [isGeneratingBlog, setIsGeneratingBlog] = useState(false);
  const [siteName, setSiteName] = useState('PlayZ Arcade');
  const [trendingMode, setTrendingMode] = useState('trending');
  const [logs, setLogs] = useState<string[]>([]);

  const handleGenerateBlog = async () => {
    setIsGeneratingBlog(true);
    addLog("Initializing AI and searching for trending gaming news...");
    try {
      const prompt = `
        Search for the absolute latest, most viral trending news in the video game industry from the last 24 hours.
        Pick one high-impact topic (e.g., a major game release, a massive update, industry-shaking news, or a viral gaming trend).
        
        Write a viral, SEO-maximized blog post about this topic.
        The post should be engaging, informative, and encourage users to play games.
        Make sure the content is at least 600 words.
        Include a section "Games You Might Like" at the end (just the header).
      `;

      addLog("Sending request to server for AI generation...");
      
      const aiRes = await fetch('/api/ai/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!aiRes.ok) {
        const errorData = await aiRes.json();
        let errorMsg = errorData.error || "Failed to generate blog content";
        
        if (errorData.isPlaceholder) {
          errorMsg = "⚠️ Gemini API Key is missing or set to a placeholder. Please go to the 'Secrets' panel in the sidebar and add your real GEMINI_API_KEY.";
        } else if (errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
          errorMsg = "⚠️ API Quota Exceeded. You've hit the rate limit for your Gemini API key. Please wait a minute or check your quota in Google AI Studio (https://aistudio.google.com/app/plan_and_billing).";
        }
        
        const debugInfo = errorData.detectedKeys ? ` (Server Keys: ${errorData.detectedKeys.join(', ')})` : "";
        throw new Error(`${errorMsg}${debugInfo}`);
      }

      const blogData = await aiRes.json();
      addLog(`AI generated post: "${blogData.title}". Saving to database...`);

      // 3. Save to Database using Supabase client
      const { data: post, error: dbError } = await supabase
        .from('BlogPost')
        .insert([{
          ...blogData,
          publishedAt: new Date().toISOString()
        }])
        .select()
        .single();

      if (dbError) {
        if (dbError.message.includes("relation") && dbError.message.includes("does not exist")) {
          throw new Error("Database table 'BlogPost' is missing. Please run the SQL schema in your Supabase SQL Editor. You can find the schema in the 'schema.sql' file in the project root.");
        }
        throw dbError;
      }

      addLog(`Successfully published blog post: ${post.title}`);
    } catch (err: any) {
      console.error("Generation Error:", err);
      addLog(`Failed to generate blog post: ${err.message}`);
    } finally {
      setIsGeneratingBlog(false);
    }
  };

  // Editor's Choice State
  const [editorsChoiceGames, setEditorsChoiceGames] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAddingGame, setIsAddingGame] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("Settings").select("*").eq("id", "global").maybeSingle();
      if (data) {
        setSiteName(data.siteName || 'PlayZ Arcade');
        setTrendingMode(data.trendingMode || 'trending');
      }
    };

    const fetchEditorsChoice = async () => {
      const { data: section } = await supabase
        .from("Section")
        .select("id")
        .eq("slug", "editors-choice")
        .maybeSingle();

      if (section) {
        const { data: items } = await supabase
          .from("SectionItem")
          .select("*, Game(*)")
          .eq("sectionId", section.id)
          .order("order", { ascending: true });
        
        if (items) {
          setEditorsChoiceGames(items.map(item => ({ ...item.Game, sectionItemId: item.id })));
        }
      }
    };

    fetchSettings();
    fetchEditorsChoice();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const { data } = await supabase
        .from("Game")
        .select("*")
        .ilike("title", `%${searchQuery}%`)
        .limit(10);
      setSearchResults(data || []);
    } catch (err) {
      addLog("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const addToEditorsChoice = async (game: any) => {
    setIsAddingGame(game.id);
    try {
      // Get or create section
      let { data: section } = await supabase
        .from("Section")
        .select("id")
        .eq("slug", "editors-choice")
        .maybeSingle();
      
      if (!section) {
        const { data: newSection, error: secError } = await supabase
          .from("Section")
          .insert({ name: "Editor's Choice", slug: "editors-choice", order: 4 })
          .select()
          .single();
        if (secError) throw secError;
        section = newSection;
      }

      // Check if already in section
      const { data: existing } = await supabase
        .from("SectionItem")
        .select("id")
        .eq("sectionId", section.id)
        .eq("gameId", game.id)
        .maybeSingle();
      
      if (existing) {
        addLog(`${game.title} is already in Editor's Choice`);
        return;
      }

      // Get max order
      const { data: lastItem } = await supabase
        .from("SectionItem")
        .select("order")
        .eq("sectionId", section.id)
        .order("order", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      const nextOrder = (lastItem?.order || 0) + 1;

      const { data: newItem, error: itemError } = await supabase
        .from("SectionItem")
        .insert({
          sectionId: section.id,
          gameId: game.id,
          order: nextOrder
        })
        .select("*, Game(*)")
        .single();

      if (itemError) throw itemError;

      setEditorsChoiceGames(prev => [...prev, { ...newItem.Game, sectionItemId: newItem.id }]);
      addLog(`Added ${game.title} to Editor's Choice`);
    } catch (err: any) {
      addLog(`Failed to add game: ${err.message}`);
    } finally {
      setIsAddingGame(null);
    }
  };

  const removeFromEditorsChoice = async (sectionItemId: string, gameTitle: string) => {
    try {
      const { error } = await supabase
        .from("SectionItem")
        .delete()
        .eq("id", sectionItemId);
      
      if (error) throw error;

      setEditorsChoiceGames(prev => prev.filter(g => g.sectionItemId !== sectionItemId));
      addLog(`Removed ${gameTitle} from Editor's Choice`);
    } catch (err) {
      addLog(`Failed to remove game`);
    }
  };

  const handleUpdateSettings = async () => {
    setIsUpdatingSettings(true);
    addLog("Updating site settings...");
    try {
      const { error } = await supabase
        .from("Settings")
        .upsert({ 
          id: "global", 
          siteName, 
          trendingMode 
        }, { onConflict: 'id' });
      
      if (error) throw error;
      addLog("Settings updated successfully!");
    } catch (err) {
      addLog("Failed to update settings");
    } finally {
      setIsUpdatingSettings(false);
    }
  };

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass p-8 rounded-3xl border border-white/10 space-y-6">
            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-500" />
              Site Settings
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Site Name</label>
                <input 
                  type="text" 
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Trending Algorithm</label>
                <select 
                  value={trendingMode}
                  onChange={(e) => setTrendingMode(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-all appearance-none"
                >
                  <option value="trending" className="bg-dark-surface">Trend Score (Engagement)</option>
                  <option value="quality" className="bg-dark-surface">Quality Score (Rating)</option>
                </select>
              </div>

              <button 
                onClick={handleUpdateSettings}
                disabled={isUpdatingSettings}
                className="w-full bg-emerald-500 text-black py-3 rounded-xl font-black uppercase tracking-tight hover:bg-emerald-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUpdatingSettings ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Save Settings"}
              </button>
            </div>
          </div>

          <div className="glass p-8 rounded-3xl border border-white/10 space-y-6">
            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-blue-500" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={handleSeed}
                disabled={isSeeding}
                className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all disabled:opacity-50"
              >
                <span className="text-xs font-bold uppercase tracking-widest">Seed Database</span>
                <Database className={`w-4 h-4 text-emerald-500 ${isSeeding ? 'animate-spin' : ''}`} />
              </button>
              <button 
                onClick={handlePopulateQuality}
                disabled={isPopulating}
                className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all disabled:opacity-50"
              >
                <span className="text-xs font-bold uppercase tracking-widest">Populate Quality</span>
                <Sparkles className={`w-4 h-4 text-amber-500 ${isPopulating ? 'animate-spin' : ''}`} />
              </button>
              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all disabled:opacity-50"
              >
                <span className="text-xs font-bold uppercase tracking-widest">Sync Games</span>
                <RefreshCw className={`w-4 h-4 text-blue-500 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
              <button 
                onClick={handleGenerateBlog}
                disabled={isGeneratingBlog}
                className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-all disabled:opacity-50"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">Generate Blog Post</span>
                <Newspaper className={`w-4 h-4 text-emerald-500 ${isGeneratingBlog ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Editor's Choice Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass p-8 rounded-3xl border border-white/10 space-y-6">
            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Editor&apos;s Choice
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input 
                    type="text" 
                    placeholder="Search games to add..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 transition-all"
                  />
                </div>
                <button 
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="bg-amber-500 text-black px-6 rounded-xl font-black uppercase tracking-tight hover:bg-amber-400 transition-all disabled:opacity-50"
                >
                  {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Search"}
                </button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-hide">
                <AnimatePresence>
                  {searchResults.map(game => (
                    <motion.div 
                      key={game.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                          <Image 
                            src={game.thumbnailUrl} 
                            alt={game.title} 
                            fill 
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className="text-xs font-bold truncate max-w-[150px]">{game.title}</span>
                      </div>
                      <button 
                        onClick={() => addToEditorsChoice(game)}
                        disabled={isAddingGame === game.id}
                        className="p-2 hover:bg-emerald-500 hover:text-black rounded-lg transition-all text-emerald-500"
                      >
                        {isAddingGame === game.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-3xl border border-white/10 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Current Selection ({editorsChoiceGames.length})</h3>
            <div className="space-y-2 max-h-[450px] overflow-y-auto scrollbar-hide">
              {editorsChoiceGames.length === 0 ? (
                <p className="text-center py-12 text-white/20 text-xs uppercase font-black tracking-widest">No games selected</p>
              ) : (
                editorsChoiceGames.map(game => (
                  <div key={game.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                        <Image 
                          src={game.thumbnailUrl} 
                          alt={game.title} 
                          fill 
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold">{game.title}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-tighter">Order: {game.order}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromEditorsChoice(game.sectionItemId, game.title)}
                      className="p-2 hover:bg-red-500 hover:text-white rounded-lg transition-all text-red-500/50 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
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
