'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Edit, Trash2, ExternalLink, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { GameStatusBadge } from '@/components/admin/GameStatusBadge';
import { SectionToggle } from '@/components/admin/SectionToggle';
import { supabase } from '@/lib/supabase';

interface GameLibraryClientProps {
  initialGames: any[];
  gameSectionsMap: Record<string, string[]>;
}

export function GameLibraryClient({ initialGames, gameSectionsMap }: GameLibraryClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [games, setGames] = useState(initialGames);
  const [isSearchingDB, setIsSearchingDB] = useState(false);

  // Sync state when props change
  useEffect(() => {
    setGames(initialGames);
  }, [initialGames]);

  // Server-side search fallback
  useEffect(() => {
    const searchDB = async () => {
      const searchLower = searchQuery.toLowerCase().trim();
      if (searchLower.length < 2) return;

      // If we have local results, don't bother searching DB unless it's a very specific query
      const localMatches = initialGames.filter(game => 
        (game.title?.toLowerCase() || '').includes(searchLower) ||
        (game.slug?.toLowerCase() || '').includes(searchLower)
      );

      if (localMatches.length > 0) return;

      setIsSearchingDB(true);
      try {
        const { data, error } = await supabase
          .from('Game')
          .select('*, Category(*)')
          .or(`title.ilike.%${searchLower}%,slug.ilike.%${searchLower}%`)
          .limit(50);

        if (!error && data && data.length > 0) {
          const newGames = data.map(g => ({ ...g, category: g.Category }));
          // Merge with current games to avoid losing them, but prioritize search results
          setGames(prev => {
            const existingIds = new Set(prev.map(g => g.id));
            const uniqueNew = newGames.filter(g => !existingIds.has(g.id));
            return [...uniqueNew, ...prev];
          });
        }
      } catch (err) {
        console.error("Search DB error:", err);
      } finally {
        setIsSearchingDB(false);
      }
    };

    const timer = setTimeout(searchDB, 600);
    return () => clearTimeout(timer);
  }, [searchQuery, initialGames]);

  const categories = useMemo(() => {
    const cats = new Set(initialGames.map(g => g.category?.name).filter(Boolean));
    return ['all', ...Array.from(cats).sort()];
  }, [initialGames]);

  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const searchLower = searchQuery.toLowerCase().trim();
      const matchesSearch = !searchLower || (
        (game.title?.toLowerCase() || '').includes(searchLower) ||
        (game.slug?.toLowerCase() || '').includes(searchLower) ||
        (game.category?.name?.toLowerCase() || '').includes(searchLower)
      );

      const matchesCategory = selectedCategory === 'all' || game.category?.name === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [games, searchQuery, selectedCategory]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      // 1. Find the game to check for storage URLs
      const gameToDelete = games.find(g => g.id === id);
      
      if (gameToDelete) {
        const storageFields = ['romUrl', 'thumbnailUrl', 'bannerUrl', 'thumbnail'];
        const buckets = ['roms', 'images', 'thumbnails'];

        for (const field of storageFields) {
          const url = gameToDelete[field];
          if (url && typeof url === 'string') {
            for (const bucket of buckets) {
              const marker = `/storage/v1/object/public/${bucket}/`;
              if (url.includes(marker)) {
                const path = url.split(marker)[1];
                if (path) {
                  console.log(`Deleting ${field} from storage bucket ${bucket}:`, path);
                  await supabase.storage.from(bucket).remove([path]);
                }
              }
            }
          }
        }
      }

      // 2. Delete from database
      const { error } = await supabase.from('Game').delete().eq('id', id);
      if (error) throw error;
      
      setGames(prev => prev.filter(g => g.id !== id));
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(err.message || 'Failed to delete game');
    }
  };

  return (
    <div className="space-y-10">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          {isSearchingDB ? (
            <Loader2 className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500 animate-spin" />
          ) : (
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
          )}
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, slug or category..." 
            className="w-full glass py-4 pl-16 pr-12 rounded-2xl text-sm font-bold placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-white/40" />
            </button>
          )}
        </div>
        
        <div className="flex gap-4">
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full glass py-4 pl-12 pr-8 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-zinc-900">
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Games Table */}
      <div className="glass rounded-3xl overflow-hidden border border-white/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Game</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Category</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Stats</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Quality</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Status</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredGames.map((game) => {
              const gameSections = new Set(gameSectionsMap[game.id] || []);
              return (
                <tr key={game.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 relative">
                        <Image 
                          src={game.thumbnail || game.thumbnailUrl || ''} 
                          alt="" 
                          fill 
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold group-hover:text-emerald-500 transition-colors">{game.title}</span>
                        <span className="text-[10px] text-white/30 font-mono">{game.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white/60 border border-white/10">
                      {game.category?.name || "Uncategorized"}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-emerald-500">{(game.playCount || 0).toLocaleString()} Plays</span>
                      <span className="text-[10px] text-white/30 uppercase tracking-widest">Trend: {(game.trendScore || 0).toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-2 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500" 
                          style={{ width: `${(game.qualityScore || 0) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-black text-white/60">{(game.qualityScore || 0).toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <GameStatusBadge 
                      gameId={game.id} 
                      isPublished={game.isPublished} 
                      iframeUrl={game.iframeUrl} 
                    />
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <SectionToggle 
                        gameId={game.id} 
                        sectionSlug="editors-choice" 
                        initialInSection={gameSections.has('editors-choice')} 
                      />
                      <SectionToggle 
                        gameId={game.id} 
                        sectionSlug="featured" 
                        initialInSection={gameSections.has('featured')} 
                      />
                      <Link href={`/game/${game.slug}`} target="_blank" className="p-2 glass rounded-lg hover:bg-white/10 transition-colors">
                        <ExternalLink className="w-4 h-4 text-white/40" />
                      </Link>
                      <Link href={`/admin/games/edit/${game.id}`} className="p-2 glass rounded-lg hover:bg-white/10 transition-colors">
                        <Edit className="w-4 h-4 text-white/40" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(game.id, game.title)}
                        className="p-2 glass rounded-lg hover:bg-red-500/20 transition-colors group/del"
                      >
                        <Trash2 className="w-4 h-4 text-white/40 group-hover/del:text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredGames.length === 0 && (
          <div className="p-20 text-center">
            <p className="text-white/20 font-black uppercase tracking-[0.5em] text-xl">No Games Found</p>
          </div>
        )}
      </div>
    </div>
  );
}
