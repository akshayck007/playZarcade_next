'use client';

import { RefreshCw, Eye, X, Terminal, CheckCircle2, AlertCircle, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI, Type } from "@google/genai";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface RawTrend {
  keyword: string;
  volume: number;
  source: string;
  unifiedScore?: number;
  thumbnailUrl?: string;
  iframeUrl?: string;
}

export function TrendMiningConsole() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<RawTrend[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'previewing' | 'mining' | 'complete' | 'error'>('idle');
  const [isRefining, setIsRefining] = useState(false);
  const [discoveryPrompt, setDiscoveryPrompt] = useState("");
  const [isDiscovering, setIsDiscovering] = useState(false);

  const handleDiscover = async (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!discoveryPrompt.trim()) return;
    
    setIsDiscovering(true);
    setError(null);
    setPreviewData(null);
    setStatus('previewing');
    setIsOpen(true);
    try {
      const res = await fetch('/api/admin/trends/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: discoveryPrompt })
      });
      const data = await res.json();
      if (data.success) {
        setPreviewData(data.trends);
        setDiscoveryPrompt("");
      } else {
        setError(data.error || "Discovery failed");
      }
    } catch (err) {
      setError("Network error during discovery");
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleAIRefine = async () => {
    if (!previewData || previewData.length === 0) return;
    
    setIsRefining(true);
    setError(null);
    try {
      // 1. Ensure API Key is selected if using platform dialog
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
        }
      }

      const apiKey = 
        (process.env as any).API_KEY || 
        process.env.NEXT_PUBLIC_GEMINI_API_KEY || 
        (process.env as any).NEXT_PUBLIC_MY_GEMINI_API_KEY;
      
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        throw new Error("Gemini API Key is missing. Please select an API key or set NEXT_PUBLIC_GEMINI_API_KEY in your Secrets.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze these raw search trends and identify specific WEB or BROWSER games.
        
        Raw Trends:
        ${previewData.map(t => `${t.keyword} (${t.source})`).join('\n')}
        
        Rules:
        1. Extract specific game titles (e.g., "Bloxd.io", "Voxiom", "Slope").
        2. Focus on "rising" or "trending" titles that are likely to be popular web/browser games.
        3. Ignore generic terms like "unblocked games" or "io games" unless they are part of a specific search (e.g., "unblocked games 76").
        4. Filter out non-game trends (weather, news, politics, sports teams, celebrities, etc.).
        5. If a term is a specific game title, keep it. If it's a general topic (like "basketball"), discard it unless it's a specific game like "Retro Bowl".
        
        Return the result as a JSON array of strings containing ONLY the kept game titles.`,
        config: {
          responseMimeType: "application/json",
          tools: [{ googleSearch: {} }],
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });

      const filteredKeywords = JSON.parse(response.text || "[]");
      const filtered = previewData.filter(t => 
        filteredKeywords.some((fk: string) => fk.toLowerCase() === t.keyword.toLowerCase())
      );
      
      setPreviewData(filtered);
    } catch (err) {
      console.error("AI Refine Error:", err);
      setError("AI Refinement failed. Using heuristic filters only.");
    } finally {
      setIsRefining(false);
    }
  };

  const removeTrend = (index: number) => {
    if (!previewData) return;
    const newData = [...previewData];
    newData.splice(index, 1);
    setPreviewData(newData);
  };

  const handlePreview = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);
    setStatus('previewing');
    setIsOpen(true);
    try {
      const res = await fetch('/api/admin/trends/mine?preview=true');
      const data = await res.json();
      if (data.success) {
        setPreviewData(data.trends);
      } else {
        setError(data.error || "Failed to fetch preview");
      }
    } catch (err) {
      setError("Network error fetching preview");
    } finally {
      setIsLoading(false);
    }
  };

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleClose = () => {
    console.log('[TrendMiningConsole] Closing modal. Status:', status);
    if (status === 'complete') {
      console.log('[TrendMiningConsole] Refreshing router on close...');
      router.refresh();
    }
    setIsOpen(false);
    // Reset state when closing
    if (status === 'complete' || status === 'error') {
      setStatus('idle');
      setPreviewData(null);
      setError(null);
      setSuccessMessage(null);
    }
  };

  const handleMine = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (isLoading && (status === 'mining' || status === 'previewing')) return; // Guard against double clicks
    
    console.log('[TrendMiningConsole] handleMine called. Status:', status, 'PreviewData length:', previewData?.length);
    setIsOpen(true); // Open modal to show progress
    setError(null);
    setSuccessMessage(null);

    try {
      // If we don't have preview data yet, we fetch it first (Discovery phase)
      if (!previewData || previewData.length === 0) {
        console.log('[TrendMiningConsole] No preview data. Fetching preview first...');
        setStatus('previewing');
        setIsLoading(true);
        
        const res = await fetch('/api/admin/trends/mine?preview=true', { cache: 'no-store' });
        const data = await res.json();
        
        console.log('[TrendMiningConsole] Preview GET response:', data);
        
        if (data.success) {
          setPreviewData(data.trends);
          setStatus('previewing'); // Stay in preview mode to let user review
        } else {
          console.error('[TrendMiningConsole] Preview fetch failed:', data.error);
          setError(data.error || "Failed to discover trends");
          setStatus('error');
        }
      } else {
        // We have preview data, now we execute the actual mining (Save phase)
        console.log('[TrendMiningConsole] Executing mining with preview data');
        setStatus('mining');
        setIsLoading(true);
        
        const res = await fetch('/api/admin/trends/mine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trends: previewData }),
          cache: 'no-store'
        });
        
        const data = await res.json();
        console.log('[TrendMiningConsole] POST response:', data);
        
        if (data.success) {
          const count = data.count ?? data.totalTrends ?? 0;
          console.log('[TrendMiningConsole] Success. Count:', count);
          setSuccessMessage(data.message || `Successfully saved ${count} trends.`);
          setStatus('complete');
          // router.refresh() moved to handleClose
        } else {
          console.error('[TrendMiningConsole] POST failed:', data.error);
          setError(data.error || "Mining execution failed");
          setStatus('error');
        }
      }
    } catch (err: any) {
      console.error("[TrendMiningConsole] Mining Error:", err);
      setError(`Network error: ${err.message || 'Unknown error'}`);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="relative group">
          <input 
            type="text"
            value={discoveryPrompt}
            onChange={(e) => setDiscoveryPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleDiscover(e)}
            placeholder="Suggest search terms..."
            className="bg-white/5 border border-white/10 rounded-full px-6 py-3 text-sm font-bold w-64 focus:w-80 focus:bg-white/10 focus:border-emerald-500/50 transition-all outline-none placeholder:text-white/20"
          />
          <button 
            type="button"
            onClick={(e) => handleDiscover(e)}
            disabled={isDiscovering || !discoveryPrompt.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 rounded-full text-black hover:bg-emerald-400 transition-colors disabled:opacity-0 disabled:scale-0 transition-all duration-300"
          >
            <Sparkles className={`w-4 h-4 ${isDiscovering ? 'animate-pulse' : ''}`} />
          </button>
        </div>

        <div className="h-6 w-px bg-white/10 mx-2" />

        <button 
          type="button"
          onClick={(e) => handlePreview(e)}
          className="bg-white/5 text-white/60 px-6 py-3 rounded-full font-bold uppercase tracking-tight hover:bg-white/10 transition-colors flex items-center gap-2 border border-white/5"
        >
          <Eye className="w-4 h-4" />
          Preview Data
        </button>
        <button 
          type="button"
          onClick={(e) => handleMine(e)}
          disabled={isLoading}
          className="bg-emerald-500 text-black px-8 py-3 rounded-full font-black uppercase tracking-tight hover:bg-emerald-400 transition-all flex flex-col items-center justify-center gap-0 disabled:opacity-50 relative overflow-hidden group"
        >
          <div className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${isLoading && status === 'mining' ? 'animate-spin' : ''}`} />
            <span className="text-sm">{isLoading && status === 'mining' ? 'Mining...' : 'Mine Trends'}</span>
          </div>
          <span className="text-[8px] font-black opacity-50 tracking-[0.2em] -mt-1">AI-ENHANCED</span>
          
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
              >
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                      <Terminal className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black uppercase tracking-tighter">Trend Mining Console</h2>
                      <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Raw Data & Mining Status</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleClose}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 relative">
                {isLoading && status === 'mining' && (
                  <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                    <RefreshCw className="w-12 h-12 text-emerald-500 animate-spin" />
                    <div className="text-center">
                      <p className="text-lg font-black uppercase tracking-tighter text-white">Mining in Progress</p>
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-1">Syncing trends with database & boosting scores...</p>
                    </div>
                  </div>
                )}

                {isLoading && status === 'previewing' ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <RefreshCw className="w-12 h-12 text-emerald-500 animate-spin" />
                    <p className="text-sm font-bold text-white/40 uppercase tracking-widest animate-pulse">Fetching raw trend data...</p>
                  </div>
                ) : error ? (
                  <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-red-500 uppercase text-sm">Mining Error</h4>
                      <p className="text-red-500/60 text-sm mt-1">{error}</p>
                      <button 
                        onClick={handlePreview}
                        className="mt-4 text-xs font-black uppercase tracking-widest text-red-500 underline"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                ) : status === 'complete' ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-6">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-2xl font-black uppercase tracking-tighter">Mining Successful</h3>
                      {successMessage && <p className="text-emerald-500/60 font-bold text-sm uppercase tracking-widest">{successMessage}</p>}
                    </div>
                    <button
                      onClick={handleClose}
                      className="bg-emerald-500 text-black px-10 py-4 rounded-full font-black uppercase tracking-tight hover:bg-emerald-400 transition-all"
                    >
                      Done
                    </button>
                  </div>
                ) : previewData ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-white/30">Found {previewData.length} Raw Results</h4>
                        <button 
                          onClick={handleAIRefine}
                          disabled={isRefining}
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors disabled:opacity-50"
                        >
                          <Sparkles className={`w-3 h-3 ${isRefining ? 'animate-pulse' : ''}`} />
                          {isRefining ? 'Refining...' : 'Clean with AI'}
                        </button>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-500 uppercase bg-emerald-500/10 px-2 py-1 rounded">Live Data</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {previewData.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => removeTrend(i)}
                              className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            {item.thumbnailUrl && (
                              <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 relative">
                                <Image 
                                  src={item.thumbnailUrl} 
                                  alt={item.keyword} 
                                  fill
                                  className="object-cover" 
                                  referrerPolicy="no-referrer" 
                                  unoptimized
                                />
                              </div>
                            )}
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold group-hover:text-emerald-500 transition-colors">{item.keyword}</span>
                                <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                                  item.source.includes('Rising') ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-white/5 text-white/40 border-white/10'
                                }`}>
                                  {item.source.includes('Rising') ? 'Rising' : 'Top'}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{item.source}</span>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1">
                            <span className="text-xs font-mono text-white/40">{item.volume.toLocaleString()} vol</span>
                            {item.unifiedScore !== undefined && (
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      item.unifiedScore > 100 ? 'bg-emerald-500' : 
                                      item.unifiedScore > 70 ? 'bg-orange-500' : 'bg-white/20'
                                    }`}
                                    style={{ width: `${Math.min(100, item.unifiedScore / 1.5)}%` }}
                                  />
                                </div>
                                <span className="text-[8px] font-black text-white/40">{item.unifiedScore}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <p className="text-white/20 text-sm font-bold uppercase tracking-widest">No data to display. Click preview to fetch.</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-8 border-t border-white/5 bg-white/5 flex items-center justify-between">
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest max-w-[50%]">
                  Preview mode does not persist data to the database. Click &quot;Execute Mining&quot; to save results.
                </p>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleClose}
                    className="px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => handleMine(e)}
                    disabled={isLoading || status === 'complete'}
                    className="bg-emerald-500 text-black px-8 py-3 rounded-full font-black uppercase tracking-tight hover:bg-emerald-400 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isLoading && status === 'mining' ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Execute Mining
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
