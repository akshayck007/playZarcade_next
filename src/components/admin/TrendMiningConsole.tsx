'use client';

import { RefreshCw, Eye, X, Terminal, CheckCircle2, AlertCircle, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI, Type } from "@google/genai";

interface RawTrend {
  keyword: string;
  volume: number;
  source: string;
}

export function TrendMiningConsole() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<RawTrend[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'previewing' | 'mining' | 'complete'>('idle');
  const [isRefining, setIsRefining] = useState(false);

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
        contents: `Analyze these raw search trends and identify potential NEW or RISING web/browser games.
        
        Raw Trends:
        ${previewData.map(t => `${t.keyword} (${t.source})`).join('\n')}
        
        Rules:
        1. Extract specific game titles (e.g., "Bloxd.io", "Voxiom", "Slope").
        2. Focus on "rising" or "trending" titles that are likely to be popular web games.
        3. Ignore generic terms like "unblocked games" or "io games" unless they are part of a specific search (e.g., "unblocked games 76").
        4. Filter out non-game trends (weather, news, politics, etc.).
        5. Use Google Search to verify if a term is a real game if you are unsure.
        
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

  const handlePreview = async () => {
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

  const handleMine = async () => {
    setIsLoading(true);
    setError(null);
    setStatus('mining');
    try {
      // If we have preview data, we send it via POST to save exactly what we see
      if (previewData && previewData.length > 0) {
        const res = await fetch('/api/admin/trends/mine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trends: previewData })
        });
        const data = await res.json();
        if (data.success) {
          setStatus('complete');
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          setError(data.error || "Mining failed");
        }
      } else {
        // Otherwise trigger full auto-mine
        const res = await fetch('/api/admin/trends/mine');
        const data = await res.json();
        if (data.success) {
          setStatus('complete');
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          setError(data.error || "Mining failed");
        }
      }
    } catch (err) {
      setError("Network error during mining");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <button 
          onClick={handlePreview}
          className="bg-white/5 text-white/60 px-6 py-3 rounded-full font-bold uppercase tracking-tight hover:bg-white/10 transition-colors flex items-center gap-2 border border-white/5"
        >
          <Eye className="w-4 h-4" />
          Preview Data
        </button>
        <button 
          onClick={handleMine}
          disabled={isLoading}
          className="bg-emerald-500 text-black px-8 py-3 rounded-full font-black uppercase tracking-tight hover:bg-emerald-400 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading && status === 'mining' ? 'animate-spin' : ''}`} />
          {isLoading && status === 'mining' ? 'Mining...' : 'Mine Trends'}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
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
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
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
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                    <h3 className="text-2xl font-black uppercase tracking-tighter">Mining Successful</h3>
                    <p className="text-sm font-bold text-white/40 uppercase tracking-widest">Refreshing library in 2 seconds...</p>
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
                            <div className="flex flex-col">
                              <span className="text-sm font-bold group-hover:text-emerald-500 transition-colors">{item.keyword}</span>
                              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{item.source}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono text-white/40">{item.volume.toLocaleString()} vol</span>
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
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleMine}
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
