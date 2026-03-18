'use client';

import { useEffect, useState } from 'react';
import { GameCard } from './GameCard';
import { History, X, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const RECENTLY_PLAYED_KEY = 'playz_recently_played';
const FAVORITES_KEY = 'playz_favorites';
const MAX_RECENT = 24;

export function Favorites() {
  const [favoriteGames, setFavoriteGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchFavorites = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch from Supabase
        const { data, error } = await supabase
          .from('UserFavorite')
          .select('*, Game(*, Category(*))')
          .eq('userId', session.user.id)
          .order('createdAt', { ascending: false });
        
        if (data) {
          setFavoriteGames(data.map(f => f.Game));
        }
      } else {
        // Fallback to localStorage
        const stored = localStorage.getItem(FAVORITES_KEY);
        if (stored) {
          try {
            const ids = JSON.parse(stored);
            if (ids.length > 0) {
              const res = await fetch(`/api/games/bulk?ids=${ids.join(',')}`);
              const data = await res.json();
              if (data.success) {
                setFavoriteGames(data.games);
              }
            }
          } catch (e) {
            console.error('Failed to parse favorites', e);
          }
        }
      }
      setLoading(false);
    };

    fetchFavorites();
  }, [supabase]);

  if (!loading && favoriteGames.length === 0) return null;

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 cyber-text-glow text-neon-magenta">
          <Heart className="w-6 h-6 fill-current" />
          User <span className="text-white">Favorites</span>
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
        {favoriteGames.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}

export function RecentlyPlayed() {
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch from Supabase
        const { data, error } = await supabase
          .from('UserHistory')
          .select('*, Game(*, Category(*))')
          .eq('userId', session.user.id)
          .order('lastPlayedAt', { ascending: false })
          .limit(MAX_RECENT);
        
        if (data) {
          setRecentGames(data.map(h => h.Game));
        }
      } else {
        // Fallback to localStorage
        const stored = localStorage.getItem(RECENTLY_PLAYED_KEY);
        if (stored) {
          try {
            setRecentGames(JSON.parse(stored));
          } catch (e) {
            console.error('Failed to parse recently played', e);
          }
        }
      }
    };

    fetchHistory();
  }, [supabase]);

  const clearRecent = () => {
    localStorage.removeItem(RECENTLY_PLAYED_KEY);
    setRecentGames([]);
  };

  if (recentGames.length === 0) return null;

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 cyber-text-glow text-neon-cyan">
          <History className="w-6 h-6" />
          Recent <span className="text-white">Sessions</span>
        </h2>
        <button 
          onClick={clearRecent}
          className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-neon-magenta transition-colors flex items-center gap-2"
        >
          <X className="w-3 h-3" />
          Purge History
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
        <AnimatePresence mode="popLayout">
          {recentGames.map((game) => (
            <motion.div
              key={game.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <GameCard game={game} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

export function trackPlay(game: any) {
  if (typeof window === 'undefined') return;
  console.log('[RecentlyPlayed] Tracking play for:', game.title);

  const supabase = createClientComponentClient();

  const updateCloudHistory = async (userId: string) => {
    try {
      await supabase
        .from('UserHistory')
        .upsert({ 
          userId, 
          gameId: game.id, 
          lastPlayedAt: new Date().toISOString() 
        }, { onConflict: 'userId,gameId' });
    } catch (e) {
      console.error('Failed to sync history to cloud', e);
    }
  };

  const stored = localStorage.getItem(RECENTLY_PLAYED_KEY);
  let recent: any[] = [];
  
  if (stored) {
    try {
      recent = JSON.parse(stored);
    } catch (e) {}
  }

  // Remove if already exists to move to front
  recent = recent.filter(g => g.id !== game.id);
  
  // Add to front
  recent.unshift({
    id: game.id,
    title: game.title,
    slug: game.slug,
    thumbnail: game.thumbnail,
    playCount: game.playCount,
    Category: game.Category
  });

  // Limit size
  recent = recent.slice(0, MAX_RECENT);

  localStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(recent));

  // Also update playz_history for HomeTabsSection compatibility
  const historyStored = localStorage.getItem('playz_history');
  let history: string[] = [];
  if (historyStored) {
    try {
      history = JSON.parse(historyStored);
    } catch (e) {}
  }
  history = [game.id, ...history.filter(id => id !== game.id)].slice(0, 30);
  localStorage.setItem('playz_history', JSON.stringify(history));

  // Sync to cloud if logged in
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      updateCloudHistory(session.user.id);
    }
  });
}
