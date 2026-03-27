'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, Maximize2, RefreshCw, Gamepad2 } from 'lucide-react';

interface RetroPlayerProps {
  romUrl: string;
  system: string; // e.g., 'nes', 'snes', 'gba', 'n64'
  title: string;
  gameId?: string;
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
    EJS_onSaveState?: (arg1: any, arg2?: any) => boolean | void;
    EJS_onLoadState?: (arg1: any) => any;
    EJS_onSaveState_callback?: (arg1: any, arg2?: any) => boolean | void;
    EJS_onLoadState_callback?: (arg1: any) => any;
    EJS_emulator?: any;
    EJS_instance?: any;
  }
}

export default function RetroPlayer({ romUrl, system, title, gameId: propGameId }: RetroPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  // Derive a stable gameId if not provided
  const gameId = propGameId || title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'default-game';

  const addLog = useCallback((msg: string, isError = false) => {
    const timestamp = new Date().toLocaleTimeString();
    const formattedMsg = `[${timestamp}] ${msg}`;
    setDebugLogs(prev => [...prev.slice(-19), formattedMsg]);
    if (isError) {
      console.error(formattedMsg);
    } else {
      console.log(formattedMsg);
    }
  }, []);
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
    if (isInitializedRef.current) {
      addLog('Emulator already initialized, skipping...');
      return;
    }
    isInitializedRef.current = true;

    if (containerRef.current) {
      // Clear previous content if any
      const container = document.getElementById('retro-game-container');
      if (container) container.innerHTML = '';
    }

    addLog(`Initializing emulator for ${title} (${system})`);

    // Set configuration
    const config: any = {
      EJS_player: '#retro-game-container',
      EJS_core: system,
      EJS_gameUrl: url,
      EJS_pathtodata: 'https://cdn.emulatorjs.org/latest/data/',
      EJS_language: 'en-US',
      EJS_startOnLoaded: true,
      EJS_DEBUG_XX: true,
      EJS_DEBUG: true,
      EJS_VERBOSE: true,
      EJS_savestate: true,
      EJS_saveState: true,
      EJS_loadstate: true,
      EJS_loadState: true,
      EJS_gameID: gameId,
      EJS_gameid: gameId,
      EJS_gameName: title,
      EJS_use_idb: false, // Force hooks instead of IndexedDB
    };

    // Apply config to window
    Object.entries(config).forEach(([key, value]) => {
      (window as any)[key] = value;
    });

    // Force gameId to stay set (some scripts might clear it)
    const idInterval = setInterval(() => {
      (window as any).EJS_gameID = gameId;
      (window as any).EJS_gameid = gameId;
      (window as any).gameId = gameId;
    }, 100);
    
    // Check for SharedArrayBuffer support - required for threads
    const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
    (window as any).EJS_threads = hasSharedArrayBuffer && (system === 'psp' || system === 'n64');
    
    addLog(`Config set. GameID: ${gameId}`);
    
    // Correct EmulatorJS Save/Load Hooks with robust synchronous conversion
    const saveToLocalStorage = (arg1: any, arg2: any) => {
      try {
        addLog(`Save hook triggered! Args: ${typeof arg1}, ${typeof arg2}`);
        
        let id = (window as any).EJS_gameID || (window as any).EJS_gameid || gameId;
        let data = arg1;

        // Handle different callback signatures: (id, data) or (data)
        if (typeof arg1 === 'string' && arg2) {
          id = arg1;
          data = arg2;
        }

        if (!id) {
          addLog('Save failed: No game ID found', true);
          return false;
        }

        // Handle if data is an object { state: ..., screenshot: ... }
        if (data && typeof data === 'object' && data.state) {
          data = data.state;
        }

        if (!data) {
          addLog('Save failed: No data found', true);
          return false;
        }

        addLog(`Saving state for: ${id} (Size: ${data.byteLength || data.length || 'unknown'})`);
        
        const key = `playz_save_${id}`;
        let valueToStore = data;
        
        if (data instanceof Uint8Array || data instanceof ArrayBuffer || (data && data.buffer instanceof ArrayBuffer)) {
          const uint8 = data instanceof Uint8Array ? data : new Uint8Array(data.buffer || data);
          
          let binary = '';
          const chunk_size = 8192;
          for (let i = 0; i < uint8.length; i += chunk_size) {
            binary += String.fromCharCode.apply(null, uint8.subarray(i, i + chunk_size) as any);
          }
          valueToStore = `data:application/octet-stream;base64,${window.btoa(binary)}`;
        }
        
        localStorage.setItem(key, valueToStore);
        addLog(`Saved successfully to localStorage.`);
        return true;
      } catch (e: any) {
        addLog(`Save error: ${e.message}`, true);
        return false;
      }
    };

    const loadFromLocalStorage = (arg1: any) => {
      try {
        addLog(`Load hook triggered! Arg: ${typeof arg1}`);
        
        let id = typeof arg1 === 'string' ? arg1 : ((window as any).EJS_gameID || (window as any).EJS_gameid || gameId);
        
        if (!id) {
          addLog('Load failed: No game ID found', true);
          return null;
        }

        addLog(`Loading state for: ${id}`);
        
        const key = `playz_save_${id}`;
        const data = localStorage.getItem(key);
        if (!data) {
          addLog(`No save state found in localStorage for: ${id}`);
          return null;
        }

        if (typeof data === 'string' && data.startsWith('data:application/octet-stream;base64,')) {
          addLog(`Decoding base64 state...`);
          const base64 = data.split(',')[1];
          const binary = window.atob(base64);
          const uint8 = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            uint8[i] = binary.charCodeAt(i);
          }
          addLog(`Decoded successfully. Size: ${uint8.length}`);
          return uint8;
        }
        
        addLog(`Loaded raw state. Size: ${data.length}`);
        return data;
      } catch (e: any) {
        addLog(`Load error: ${e.message}`, true);
        return null;
      }
    };

    // Set multiple hook variations for maximum compatibility
    const hooks = [
      'EJS_onSaveState', 'EJS_onLoadState',
      'EJS_onSave', 'EJS_onLoad',
      'EJS_onSaveState_callback', 'EJS_onLoadState_callback',
      'EJS_saveState_callback', 'EJS_loadState_callback',
      'EJS_saveState', 'EJS_loadState'
    ];

    hooks.forEach(hook => {
      (window as any)[hook] = hook.toLowerCase().includes('save') ? saveToLocalStorage : loadFromLocalStorage;
    });
    
    // Also set them on the window object directly for some versions
    window.EJS_onSaveState = saveToLocalStorage;
    window.EJS_onLoadState = loadFromLocalStorage;
    window.EJS_onSaveState_callback = saveToLocalStorage;
    window.EJS_onLoadState_callback = loadFromLocalStorage;

    window.EJS_onGameStart = () => {
      addLog('Game started! Emulator is ready.');
      setIsLoading(false);
      setIsStuck(false);
    };

    // Load script
    const existingScripts = document.querySelectorAll('script[src*="loader.js"]');
    existingScripts.forEach(s => s.parentNode?.removeChild(s));

    const script = document.createElement('script');
    script.src = 'https://cdn.emulatorjs.org/latest/data/loader.js';
    script.async = true;
    
    script.onload = () => {
      addLog('Loader script loaded');
      // Re-apply hooks and config after load
      hooks.forEach(hook => {
        (window as any)[hook] = hook.toLowerCase().includes('save') ? saveToLocalStorage : loadFromLocalStorage;
      });
      window.EJS_onSaveState = saveToLocalStorage;
      window.EJS_onLoadState = loadFromLocalStorage;
      window.EJS_onSaveState_callback = saveToLocalStorage;
      window.EJS_onLoadState_callback = loadFromLocalStorage;
      
      Object.entries(config).forEach(([key, value]) => {
        (window as any)[key] = value;
      });
      
      addLog(`Hooks re-applied. EJS_onSaveState is ${typeof window.EJS_onSaveState}`);
    };

    script.onerror = () => {
      addLog('Failed to load emulator engine', true);
      setError('Failed to load emulator engine. Please check your connection.');
      setIsLoading(false);
      clearInterval(idInterval);
    };

    document.body.appendChild(script);
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
      clearInterval(idInterval);
    };
  }, [system, title, gameId, addLog]);

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
      isInitializedRef.current = false;
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

  const manualSave = () => {
    const emulator = (window as any).EJS_emulator || (window as any).EJS_instance;
    if (emulator && emulator.saveState) {
      addLog('Manually triggering saveState via EJS_emulator...');
      emulator.saveState();
    } else {
      addLog('EJS_emulator.saveState not available. Trying EJS_onSaveState directly...', true);
    }
  };

  const manualLoad = () => {
    const emulator = (window as any).EJS_emulator || (window as any).EJS_instance;
    if (emulator && emulator.loadState) {
      addLog('Manually triggering loadState via EJS_emulator...');
      // We need to pass the data to loadState
      const key = `playz_save_${gameId}`;
      const data = localStorage.getItem(key);
      if (data) {
        if (data.startsWith('data:application/octet-stream;base64,')) {
          const base64 = data.split(',')[1];
          const binary = window.atob(base64);
          const uint8 = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            uint8[i] = binary.charCodeAt(i);
          }
          emulator.loadState(uint8);
          addLog('Manual load triggered with decoded data.');
        } else {
          emulator.loadState(data);
          addLog('Manual load triggered with raw data.');
        }
      } else {
        addLog('No save state found for manual load.', true);
      }
    } else {
      addLog('EJS_emulator.loadState not available', true);
    }
  };

  return (
    <div className="game-container relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl group" ref={containerRef}>
      {/* Emulator Container */}
      <div id="retro-game-container" className="w-full h-full"></div>
      
      {/* Debug Overlay Toggle */}
      <button 
        onClick={() => setShowDebug(!showDebug)}
        className="absolute bottom-4 left-4 z-50 bg-black/50 hover:bg-black/80 text-white/50 hover:text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border border-white/10"
      >
        {showDebug ? 'Hide Debug' : 'Show Debug'}
      </button>

      {/* Debug Logs Overlay */}
      {showDebug && (
        <div className="absolute inset-x-0 bottom-0 z-40 bg-black/90 border-t border-white/10 p-4 font-mono text-[10px] max-h-[150px] overflow-y-auto">
          <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-1">
            <span className="text-emerald-500 font-bold uppercase">Emulator Debug Console</span>
            <div className="flex items-center gap-4 pointer-events-auto">
              <button 
                onClick={manualSave}
                className="text-blue-400 hover:text-blue-300 font-black uppercase"
              >
                Save State
              </button>
              <button 
                onClick={manualLoad}
                className="text-amber-400 hover:text-amber-300 font-black uppercase"
              >
                Load State
              </button>
              <button 
                onClick={() => setDebugLogs([])}
                className="text-white/40 hover:text-white transition-colors"
              >
                Clear
              </button>
            </div>
            <span className="text-white/30">{debugLogs.length} logs</span>
          </div>
          <div className="space-y-1">
            {debugLogs.map((log, i) => (
              <div key={i} className={log.includes('error') || log.includes('failed') ? 'text-red-400' : log.includes('SUCCESS') || log.includes('Saved') ? 'text-emerald-400' : 'text-white/60'}>
                {log}
              </div>
            ))}
            {debugLogs.length === 0 && <div className="text-white/20 italic">No logs yet...</div>}
          </div>
        </div>
      )}

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
