'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, Maximize2, RefreshCw, Gamepad2 } from 'lucide-react';

interface RetroPlayerProps {
  romUrl: string;
  system: string; // e.g., 'nes', 'snes', 'gba', 'n64'
  title: string;
}

declare global {
  interface Window {
    EJS_player: string;
    EJS_core: string;
    EJS_gameUrl: string;
    EJS_pathtodata: string;
    EJS_language: string;
    EJS_startOnLoaded: boolean;
    EJS_DEBUG_XX: boolean;
    EJS_onGameStart: () => void;
  }
}

export default function RetroPlayer({ romUrl, system, title }: RetroPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isStuck, setIsStuck] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use refs to avoid stale closures in setTimeout
  const progressRef = useRef(0);
  const loadingRef = useRef(false);

  useEffect(() => {
    progressRef.current = downloadProgress;
  }, [downloadProgress]);

  useEffect(() => {
    loadingRef.current = isLoading;
  }, [isLoading]);

  const startEmulator = useCallback((url: string) => {
    if (containerRef.current) {
      // Clear previous content if any
      const container = document.getElementById('retro-game-container');
      if (container) container.innerHTML = '';
    }

    // Set configuration
    window.EJS_player = '#retro-game-container';
    window.EJS_core = system;
    window.EJS_gameUrl = url;
    window.EJS_pathtodata = 'https://cdn.emulatorjs.org/latest/data/';
    window.EJS_language = 'en-US';
    window.EJS_startOnLoaded = true;
    window.EJS_DEBUG_XX = true; // Enable debug logs in console
    (window as any).EJS_savestate = true;
    (window as any).EJS_loadstate = true;
    
    // Check for SharedArrayBuffer support - required for threads
    const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
    (window as any).EJS_threads = hasSharedArrayBuffer && (system === 'psp' || system === 'n64');
    
    // Robust Game ID for persistent saves
    const gameId = `${system}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    (window as any).EJS_gameID = gameId;
    // Also set it as a global variable directly for better compatibility
    (window as any).gameId = gameId;
    
    console.log('[RetroPlayer] Starting emulator with config:', {
      core: system,
      gameId,
      threads: (window as any).EJS_threads,
      hasSAB: hasSharedArrayBuffer,
      localStorageAvailable: (() => { try { localStorage.setItem('test', '1'); localStorage.removeItem('test'); return true; } catch(e) { return false; } })()
    });
    
    // Correct EmulatorJS Save/Load Hooks with robust synchronous conversion
    const saveToLocalStorage = (idOrData: any, dataOrUndefined: any) => {
      try {
        let id = typeof idOrData === 'string' ? idOrData : (window as any).EJS_gameID;
        let data = typeof idOrData === 'string' ? dataOrUndefined : idOrData;
        
        if (!id) {
          console.error('[RetroPlayer] Save failed: No game ID found');
          return false;
        }

        console.log('[RetroPlayer] Save hook triggered for ID:', id);
        
        const key = `playz_save_${id}`;
        let valueToStore = data;
        
        if (data instanceof Uint8Array || data instanceof ArrayBuffer) {
          const uint8 = data instanceof Uint8Array ? data : new Uint8Array(data);
          // More efficient base64 conversion for larger buffers
          let binary = '';
          const chunk_size = 8192;
          for (let i = 0; i < uint8.length; i += chunk_size) {
            binary += String.fromCharCode.apply(null, uint8.subarray(i, i + chunk_size) as any);
          }
          valueToStore = `data:application/octet-stream;base64,${window.btoa(binary)}`;
        }
        
        localStorage.setItem(key, valueToStore);
        console.log('[RetroPlayer] State saved successfully to localStorage for:', id, 'Size:', valueToStore.length);
        return true;
      } catch (e) {
        console.error('[RetroPlayer] Save error:', e);
        return false;
      }
    };

    const loadFromLocalStorage = (idOrUndefined: any) => {
      try {
        let id = typeof idOrUndefined === 'string' ? idOrUndefined : (window as any).EJS_gameID;
        if (!id) {
          console.error('[RetroPlayer] Load failed: No game ID found');
          return null;
        }

        console.log('[RetroPlayer] Load hook triggered for ID:', id);
        
        const key = `playz_save_${id}`;
        const data = localStorage.getItem(key);
        if (!data) {
          console.log('[RetroPlayer] No save state found for:', id);
          return null;
        }
        console.log('[RetroPlayer] Loading state from localStorage for:', id, 'Size:', data.length);
        return data;
      } catch (e) {
        console.error('[RetroPlayer] Load error:', e);
        return null;
      }
    };

    // Set multiple hook variations for maximum compatibility across different cores/versions
    (window as any).EJS_onSave = saveToLocalStorage;
    (window as any).EJS_onSaveState = saveToLocalStorage;
    (window as any).EJS_onSaveStateData = saveToLocalStorage;
    (window as any).EJS_onLoad = loadFromLocalStorage;
    (window as any).EJS_onLoadState = loadFromLocalStorage;
    (window as any).EJS_onLoadStateData = loadFromLocalStorage;
    
    // Some versions use these specific names
    (window as any).EJS_onSaveState_callback = saveToLocalStorage;
    (window as any).EJS_onLoadState_callback = loadFromLocalStorage;
    
    window.EJS_onGameStart = () => {
      setIsLoading(false);
      setIsStuck(false);
    };

    // Load script
    // Clean up any existing EmulatorJS scripts to prevent "redeclaration" errors
    const existingScripts = document.querySelectorAll('script[src*="loader.js"]');
    existingScripts.forEach(s => s.parentNode?.removeChild(s));

    const script = document.createElement('script');
    script.src = 'https://cdn.emulatorjs.org/latest/data/loader.js';
    script.async = true;
    
    script.onload = () => {
      console.log('EmulatorJS loader script loaded');
    };

    script.onerror = () => {
      setError('Failed to load emulator engine. Please check your connection.');
      setIsLoading(false);
    };

    document.body.appendChild(script);
    return script;
  }, [system, title]);

  const handleForceLoad = () => {
    setIsStuck(false);
    setError(null);
    setIsLoading(true);
    startEmulator(romUrl);
  };

  useEffect(() => {
    if (!romUrl || !system) return;

    let isMounted = true;
    let blobUrl: string | null = null;

    const fetchRom = async () => {
      try {
        setIsLoading(true);
        setDownloadProgress(0);
        setIsStuck(false);

        console.log('Attempting manual fetch for progress tracking...');
        const response = await fetch(romUrl);
        
        if (!response.ok) {
          console.warn('Manual fetch failed with status:', response.status, 'Falling back to direct load.');
          startEmulator(romUrl);
          return;
        }
        
        const contentLength = response.headers.get('content-length');
        const total = contentLength ? parseInt(contentLength, 10) : 0;
        
        const reader = response.body?.getReader();
        if (!reader) throw new Error('Failed to get reader');
        
        let loaded = 0;
        const chunks = [];
        
        while(true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          chunks.push(value);
          loaded += value.length;
          
          if (total > 0) {
            const progress = Math.round((loaded / total) * 100);
            setDownloadProgress(progress);
          }
        }
        
        const blob = new Blob(chunks);
        blobUrl = URL.createObjectURL(blob);
        
        console.log('Manual fetch successful, starting emulator with blob URL');
        const script = startEmulator(blobUrl);
        
        return () => {
          if (script && document.body.contains(script)) {
            document.body.removeChild(script);
          }
          if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
      } catch (err: any) {
        console.error('Manual ROM Fetch Error:', err);
        
        // Fallback: Try to let the emulator handle the URL directly
        console.log('Attempting fallback: Direct URL load...');
        try {
          const script = startEmulator(romUrl);
          return () => {
            if (script && document.body.contains(script)) {
              document.body.removeChild(script);
            }
          };
        } catch (fallbackErr) {
          setError(`Failed to load game: ${err.message}. This is likely due to CORS restrictions on the source server.`);
          setIsLoading(false);
        }
      }
    };

    const cleanupPromise = fetchRom();

    return () => {
      isMounted = false;
      cleanupPromise.then(cleanup => cleanup?.());
      
      // Clear global config to prevent conflicts on re-mount
      delete (window as any).EJS_player;
      delete (window as any).EJS_core;
      delete (window as any).EJS_gameUrl;
      delete (window as any).EJS_pathtodata;
      delete (window as any).EJS_startOnLoaded;
    };
  }, [romUrl, system, startEmulator]);

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement && 
        !(document as any).webkitFullscreenElement && 
        !(document as any).msFullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
      } else if ((container as any).msRequestFullscreen) {
        (container as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="game-container relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl group" ref={containerRef}>
      {/* Emulator Container */}
      <div id="retro-game-container" className="w-full h-full"></div>

          {/* Loading Overlay */}
          {isLoading && !error && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#050505] text-white">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full border-t-2 border-neon-cyan animate-spin"></div>
                <Gamepad2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-neon-cyan animate-pulse" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter italic mb-2">
                Initializing <span className="text-neon-cyan">{system.toUpperCase()}</span> Core
              </h3>
              <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-neon-cyan transition-all duration-300 ease-out"
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>
              <p className="text-[10px] font-mono text-white/40 animate-pulse">
                {downloadProgress < 100 ? `DOWNLOADING ROM: ${downloadProgress}%` : 'STARTING EMULATOR...'}
              </p>
            </div>
          )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-red-950/90 backdrop-blur-md p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
            <RefreshCw className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tighter italic text-white mb-4">
            Emulation Failed
          </h3>
          <p className="text-sm text-red-200/60 max-w-md mb-8 font-medium">
            {error}
          </p>
          <button 
            onClick={handleReload}
            className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-red-500/20"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Controls Overlay (Bottom Right) */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
        <button 
          onClick={toggleFullscreen}
          className="p-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg hover:bg-neon-cyan/20 hover:border-neon-cyan/50 text-white transition-all"
          title="Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
