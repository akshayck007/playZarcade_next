'use client';

import React, { useState } from 'react';
import { Sparkles, Check, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { GoogleGenAI, Type } from "@google/genai";
import { supabase } from '@/lib/supabase';

interface GenerateSeoButtonProps {
  trendId: string;
  status: string;
  keyword: string;
}

export function GenerateSeoButton({ trendId, status, keyword }: GenerateSeoButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedSlug, setGeneratedSlug] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      // 1. Get trend data
      const { data: trend } = await supabase
        .from("TrendingKeyword")
        .select("*")
        .eq("id", trendId)
        .single();

      if (!trend) throw new Error("Trend not found");

      // 2. Check for matching game
      const { data: matchingGame } = await supabase
        .from("Game")
        .select("*")
        .ilike("title", trend.keyword)
        .limit(1)
        .maybeSingle();

      let gameData = null;

      // 3. If no matching game, generate metadata with Gemini on server
      if (!matchingGame) {
        const aiRes = await fetch('/api/ai/generate-game-metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyword: trend.keyword })
        });

        if (!aiRes.ok) {
          const errorData = await aiRes.json();
          throw new Error(errorData.error || "Failed to generate game metadata");
        }

        gameData = await aiRes.json();
      }

      // 4. Call API route to handle DB operations
      const res = await fetch('/api/admin/trends/generate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trendId, gameData })
      });
      const data = await res.json();
      
      if (data.success) {
        setIsSuccess(true);
        setGeneratedSlug(data.slug);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        alert(data.error || "Failed to generate SEO page");
      }
    } catch (error: any) {
      console.error("Error generating SEO page:", error);
      alert(error.message || "An error occurred while generating the SEO page");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'content_ready' || isSuccess) {
    const slug = generatedSlug || `play-${keyword.toLowerCase().replace(/\s+/g, '-')}`;
    return (
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
          <Check className="w-3 h-3" />
          Ready
        </span>
        <Link 
          href={`/${slug}`} 
          target="_blank"
          className="p-2 glass rounded-xl hover:bg-white/10 transition-colors"
          title="View SEO Page"
        >
          <ExternalLink className="w-3 h-3 text-white/40" />
        </Link>
      </div>
    );
  }

  return (
    <button 
      onClick={handleGenerate}
      disabled={isLoading}
      className="group relative bg-white/5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all border border-white/10 flex items-center gap-2 disabled:opacity-50"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="w-3 h-3 text-emerald-500 group-hover:text-black transition-colors" />
          Generate SEO Page
        </>
      )}
    </button>
  );
}
