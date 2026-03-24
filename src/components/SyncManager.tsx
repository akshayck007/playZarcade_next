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
            // Validate IDs exist in Game table first to avoid FK errors
            const { data: validGames, error: fetchError } = await supabase
              .from('Game')
              .select('id')
              .in('id', ids);
            
            if (fetchError) {
              console.error('[SyncManager] Failed to validate favorite games', fetchError);
              return;
            }

            const validIds = validGames?.map(g => g.id) || [];
            
            if (validIds.length > 0) {
              console.log(`[SyncManager] Syncing ${validIds.length} favorites to cloud...`);
              for (const gameId of validIds) {
                await supabase
                  .from('UserFavorite')
                  .upsert({ userId, gameId }, { onConflict: 'userId,gameId' });
              }
            }

            // Clean up local storage: remove IDs that don't exist in the database anymore
            if (validIds.length !== ids.length) {
              localStorage.setItem('playz_favorites', JSON.stringify(validIds));
            }
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
            const ids = games.map(g => g.id);
            
            // Validate IDs exist in Game table
            const { data: validGames, error: fetchError } = await supabase
              .from('Game')
              .select('id')
              .in('id', ids);
            
            if (fetchError) {
              console.error('[SyncManager] Failed to validate history games', fetchError);
              return;
            }

            const validIds = new Set(validGames?.map(g => g.id) || []);
            const validHistory = games.filter(g => validIds.has(g.id));

            if (validHistory.length > 0) {
              console.log(`[SyncManager] Syncing ${validHistory.length} history items to cloud...`);
              for (const game of validHistory) {
                await supabase
                  .from('UserHistory')
                  .upsert({ 
                    userId, 
                    gameId: game.id, 
                    lastPlayedAt: game.lastPlayedAt || new Date().toISOString() 
                  }, { onConflict: 'userId,gameId' });
              }
            }

            // Clean up local storage
            if (validHistory.length !== games.length) {
              localStorage.setItem('playz_recently_played', JSON.stringify(validHistory));
              
              // Also clean up playz_history if it exists
              const localHistoryIds = localStorage.getItem('playz_history');
              if (localHistoryIds) {
                try {
                  const ids: string[] = JSON.parse(localHistoryIds);
                  const filteredIds = ids.filter(id => validIds.has(id));
                  if (filteredIds.length !== ids.length) {
                    localStorage.setItem('playz_history', JSON.stringify(filteredIds));
                  }
                } catch (e) {}
              }
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
