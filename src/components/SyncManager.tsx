'use client';

import { useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function SyncManager() {
  const supabase = createClientComponentClient();
  const isSyncingRef = useRef(false);

  useEffect(() => {
    const syncData = async () => {
      if (isSyncingRef.current) return;
      
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) return;

        isSyncingRef.current = true;
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
                // Silent warning for network errors, only error for real database issues
                if (fetchError.message?.includes('fetch') || fetchError.message?.includes('NetworkError')) {
                  console.warn('[SyncManager] Network issue during favorites sync. Will retry later.');
                } else {
                  console.error('[SyncManager] Favorites sync error:', fetchError.message);
                }
                return;
              }

              const validIds = validGames?.map(g => g.id) || [];
              
              if (validIds.length > 0) {
                console.log(`[SyncManager] Syncing ${validIds.length} favorites to cloud...`);
                // Batch upsert instead of loop
                const favoritesToUpsert = validIds.map(gameId => ({ userId, gameId }));
                const { error: upsertError } = await supabase
                  .from('UserFavorite')
                  .upsert(favoritesToUpsert, { onConflict: 'userId,gameId' });
                
                if (upsertError) {
                  console.error('[SyncManager] Failed to upsert favorites', upsertError);
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
                if (fetchError.message?.includes('fetch') || fetchError.message?.includes('NetworkError')) {
                  console.warn('[SyncManager] Network issue during history sync. Will retry later.');
                } else {
                  console.error('[SyncManager] History sync error:', fetchError.message);
                }
                return;
              }

              const validIds = new Set(validGames?.map(g => g.id) || []);
              const validHistory = games.filter(g => validIds.has(g.id));

              if (validHistory.length > 0) {
                console.log(`[SyncManager] Syncing ${validHistory.length} history items to cloud...`);
                // Batch upsert
                const historyToUpsert = validHistory.map(game => ({ 
                  userId, 
                  gameId: game.id, 
                  lastPlayedAt: game.lastPlayedAt || new Date().toISOString() 
                }));
                
                const { error: upsertError } = await supabase
                  .from('UserHistory')
                  .upsert(historyToUpsert, { onConflict: 'userId,gameId' });
                
                if (upsertError) {
                  console.error('[SyncManager] Failed to upsert history', upsertError);
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
      } catch (err) {
        // Silent catch for general network errors
      } finally {
        isSyncingRef.current = false;
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
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
