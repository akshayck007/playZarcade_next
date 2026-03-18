'use client';

import { useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function SyncManager() {
  const supabase = createClientComponentClient();

  useEffect(() => {
    const syncData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const userId = session.user.id;

      // 1. Sync Favorites
      const localFavorites = localStorage.getItem('playz_favorites');
      if (localFavorites) {
        try {
          const ids: string[] = JSON.parse(localFavorites);
          if (ids.length > 0) {
            console.log('[SyncManager] Syncing favorites to cloud...');
            for (const gameId of ids) {
              await supabase
                .from('UserFavorite')
                .upsert({ userId, gameId }, { onConflict: 'userId,gameId' });
            }
            // Clear local favorites after sync? 
            // Maybe keep them as a cache, but for now let's just leave them.
          }
        } catch (e) {
          console.error('[SyncManager] Failed to sync favorites', e);
        }
      }

      // 2. Sync History
      const localHistory = localStorage.getItem('playz_recently_played');
      if (localHistory) {
        try {
          const games: any[] = JSON.parse(localHistory);
          if (games.length > 0) {
            console.log('[SyncManager] Syncing history to cloud...');
            for (const game of games) {
              await supabase
                .from('UserHistory')
                .upsert({ 
                  userId, 
                  gameId: game.id, 
                  lastPlayedAt: new Date().toISOString() 
                }, { onConflict: 'userId,gameId' });
            }
          }
        } catch (e) {
          console.error('[SyncManager] Failed to sync history', e);
        }
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        syncData();
      }
    });

    // Initial sync check
    syncData();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return null;
}
