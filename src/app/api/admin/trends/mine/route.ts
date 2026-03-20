import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = "edge";
export const dynamic = "force-dynamic";

// Simple XML parser for Google Trends RSS
function parseTrendsRss(xml: string) {
  const items: { title: string; traffic: string }[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const titleRegex = /<title>([\s\S]*?)<\/title>/;
  const trafficRegex = /<ht:approx_traffic>([\s\S]*?)<\/ht:approx_traffic>/;

  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemContent = match[1];
    const titleMatch = titleRegex.exec(itemContent);
    const trafficMatch = trafficRegex.exec(itemContent);

    if (titleMatch) {
      items.push({
        title: titleMatch[1].trim(),
        traffic: trafficMatch ? trafficMatch[1].trim() : '5000'
      });
    }
  }
  return items;
}

export async function POST(req: Request) {
  try {
    const { trends } = await req.json();
    if (!Array.isArray(trends)) {
      return NextResponse.json({ success: false, error: "Trends must be an array" }, { status: 400 });
    }

    // Get settings
    let { data: settings } = await supabase
      .from("Settings")
      .select("*")
      .eq("id", "global")
      .single();

    if (!settings) {
      const { data: newSettings } = await supabase
        .from("Settings")
        .insert({ id: "global" })
        .select()
        .single();
      settings = newSettings;
    }

    // Prepare bulk upsert for TrendingKeyword
    const upsertData = trends.map(trend => ({
      keyword: trend.keyword,
      searchVolume: trend.volume,
      status: "detected",
      lastUpdated: new Date().toISOString()
    }));

    const { error: upsertError } = await supabase
      .from("TrendingKeyword")
      .upsert(upsertData, { onConflict: 'keyword' });

    if (upsertError) throw upsertError;

    // Auto-boost game trend scores if setting is enabled
    if (settings?.autoBoostTrending) {
      console.log('[TREND MINE] Auto-boosting games based on trends');
      
      // Collect all potential game words from trends
      const allWords = Array.from(new Set(trends.flatMap(t => t.keyword.split(' ').filter(w => w.length > 3))));
      
      if (allWords.length > 0) {
        // Find ALL games that might match ANY of these words
        const { data: matchingGames } = await supabase
          .from("Game")
          .select("id, title, trendScore")
          .or(allWords.map(word => `title.ilike.%${word}%`).join(','));

        if (matchingGames && matchingGames.length > 0) {
          // Create a map for faster lookup
          const gameUpdates: { [id: string]: number } = {};
          
          for (const trend of trends) {
            const trendWords = trend.keyword.split(' ').filter(w => w.length > 3);
            const boost = trend.volume / 1000;
            
            for (const game of matchingGames) {
              const matches = trendWords.some(word => game.title.toLowerCase().includes(word.toLowerCase()));
              if (matches) {
                gameUpdates[game.id] = (gameUpdates[game.id] || game.trendScore || 0) + boost;
              }
            }
          }

          // Apply updates in parallel (still individual calls but fewer if we deduplicate)
          const updatePromises = Object.entries(gameUpdates).map(([id, newScore]) => 
            supabase.from("Game").update({ trendScore: newScore }).eq("id", id)
          );
          
          await Promise.all(updatePromises);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Saved ${trends.length} trends.`
    });
  } catch (error: any) {
    console.error("[TREND SAVE ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const isPreview = searchParams.get('preview') === 'true';
    const trends: { keyword: string; volume: number; source: string }[] = [];

    // 1. Fetch from Google Trends RSS (Daily and Real-time)
    try {
      const rssUrls = [
        'https://trends.google.com/trending/rss?geo=US',
        'https://trends.google.com/trends/trendingsearches/realtime/rss?geo=US&category=g', // Games category
        'https://trends.google.com/trends/trendingsearches/realtime/rss?geo=US&category=e', // Entertainment
        'https://trends.google.com/trends/trendingsearches/realtime/rss?geo=US&category=t'  // Sci/Tech
      ];

      for (const url of rssUrls) {
        try {
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Accept': 'application/rss+xml, application/xml;q=0.9, */*;q=0.8',
            }
          });
          
          if (response.ok) {
            const xml = await response.text();
            const parsedItems = parseTrendsRss(xml);
            
            if (parsedItems.length > 0) {
              parsedItems.forEach(item => {
                trends.push({ 
                  keyword: item.title.toLowerCase(), 
                  volume: parseInt(item.traffic.replace(/[^0-9]/g, '') || '5000'),
                  source: url.includes('realtime') ? 'Google Trends Real-time' : 'Google Trends RSS'
                });
              });
            }
          }
        } catch (e) {
          console.error(`Failed to fetch RSS from ${url}:`, e);
        }
      }
    } catch (e) {
      console.error("Error fetching Google Trends RSS:", e);
    }

    // 2. Fetch from Google Autocomplete (Discovery Intent)
    const prefixes = [
      "new unblocked games ", 
      "trending io games ", 
      "rising web games ", 
      "popular games right now ",
      "best new games 2026 ",
      "upcoming web games ",
      "new browser games ",
      "trending games on tiktok ",
      "viral web games ",
      "games like roblox ",
      "games like minecraft "
    ];
    for (const prefix of prefixes) {
      try {
        const response = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(prefix)}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        const data = await response.json();
        // data[1] is the array of suggestions
        if (Array.isArray(data[1])) {
          data[1].slice(0, 8).forEach((suggestion: string) => {
            trends.push({ 
              keyword: suggestion.toLowerCase(), 
              volume: Math.floor(Math.random() * 10000) + 5000, // Mock volume for suggestions
              source: `Autocomplete (${prefix})`
            });
          });
        }
      } catch (e) {
        console.error(`Error fetching Autocomplete for ${prefix}:`, e);
      }
    }

    // 3. Fallback Trends (if everything else fails or is too low)
    if (trends.length < 5) {
      const fallbacks = [
        "slope unblocked", "geometry dash", "subway surfers", "minecraft free", 
        "roblox online", "among us unblocked", "retro bowl", "bitlife", 
        "cookie clicker", "tetris unblocked", "happy wheels", "shell shockers"
      ];
      fallbacks.forEach(f => {
        trends.push({ 
          keyword: f, 
          volume: Math.floor(Math.random() * 50000) + 10000,
          source: 'System Fallback'
        });
      });
    }

// Deduplicate and process
    let uniqueTrends = Array.from(new Map(trends.map(t => [t.keyword, t])).values());

    // Filter for game-related keywords or remove obviously non-game ones
    const GAME_MARKERS = [
      'game', 'play', 'online', 'unblocked', 'io', 'sim', 'free', 'multiplayer', 'rpg', 'fps', 'puzzle', 'arcade', 'web', 'browser', 'flash', 'html5', 'poki', 'crazy', 'retro', 'clicker', 'simulator', 'mod', 'cheat', 'hack', 'codes', 'guide', 'walkthrough',
      'apk', 'mod', 'mobile', 'steam', 'epic', 'xbox', 'ps5', 'nintendo', 'switch'
    ];
    const NOISE_MARKERS = [
      'weather', 'news', 'politics', 'election', 'stock', 'market', 'price', 'death', 'accident', 'crash', 'satellite', 'nasa', 'court', 'trial', 'protest', 'war', 'strike', 'missing', 'found', 'dead', 'arrested', 'shooting', 'fire', 'storm', 'flood', 'earthquake', 'hurricane', 'tornado', 'vaccine', 'covid', 'pandemic', 'hospital', 'doctor', 'police', 'shooting', 'murder', 'crime', 'victim', 'suspect', 'investigation', 'lawsuit', 'verdict', 'sentence', 'prison', 'jail',
      'lyrics', 'meaning', 'definition', 'near me', 'how to', 'why', 'what is', 'job', 'salary', 'career', 'university', 'college', 'school', 'class'
    ];

    uniqueTrends = uniqueTrends.filter(trend => {
      const kw = trend.keyword.toLowerCase();
      
      // If it contains a game marker, it's likely relevant
      const hasGameMarker = GAME_MARKERS.some(m => kw.includes(m));
      
      // If it contains a noise marker, it's likely irrelevant
      const hasNoiseMarker = NOISE_MARKERS.some(m => kw.includes(m));

      // Heuristic: Keep if it has a game marker OR doesn't have a noise marker
      // We want to be more inclusive for Google Trends to catch rising names
      if (trend.source.includes('Google Trends')) {
        // Keep if it has a game marker OR is a short phrase (likely a title) that doesn't have noise
        return hasGameMarker || (kw.split(' ').length <= 3 && !hasNoiseMarker);
      }
      
      return !hasNoiseMarker || hasGameMarker;
    });

    if (isPreview) {
      return NextResponse.json({
        success: true,
        trends: uniqueTrends,
        count: uniqueTrends.length
      });
    }

    // Get settings
    let { data: settings } = await supabase
      .from("Settings")
      .select("*")
      .eq("id", "global")
      .single();

    if (!settings) {
      const { data: newSettings } = await supabase
        .from("Settings")
        .insert({ id: "global" })
        .select()
        .single();
      settings = newSettings;
    }

    // Prepare bulk upsert for TrendingKeyword
    const upsertData = uniqueTrends.map(trend => ({
      keyword: trend.keyword,
      searchVolume: trend.volume,
      status: "detected",
      lastUpdated: new Date().toISOString()
    }));

    const { error: upsertError } = await supabase
      .from("TrendingKeyword")
      .upsert(upsertData, { onConflict: 'keyword' });

    if (upsertError) throw upsertError;

    // Auto-boost game trend scores if setting is enabled
    if (settings?.autoBoostTrending) {
      console.log('[TREND MINE] Auto-boosting games based on trends');
      
      // Collect all potential game words from trends
      const allWords = Array.from(new Set(uniqueTrends.flatMap(t => t.keyword.split(' ').filter(w => w.length > 3))));
      
      if (allWords.length > 0) {
        // Find ALL games that might match ANY of these words
        const { data: matchingGames } = await supabase
          .from("Game")
          .select("id, title, trendScore")
          .or(allWords.map(word => `title.ilike.%${word}%`).join(','));

        if (matchingGames && matchingGames.length > 0) {
          // Create a map for faster lookup
          const gameUpdates: { [id: string]: number } = {};
          
          for (const trend of uniqueTrends) {
            const trendWords = trend.keyword.split(' ').filter(w => w.length > 3);
            const boost = trend.volume / 1000;
            
            for (const game of matchingGames) {
              const matches = trendWords.some(word => game.title.toLowerCase().includes(word.toLowerCase()));
              if (matches) {
                gameUpdates[game.id] = (gameUpdates[game.id] || game.trendScore || 0) + boost;
              }
            }
          }

          // Apply updates in parallel (still individual calls but fewer if we deduplicate)
          const updatePromises = Object.entries(gameUpdates).map(([id, newScore]) => 
            supabase.from("Game").update({ trendScore: newScore }).eq("id", id)
          );
          
          await Promise.all(updatePromises);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Trend mining complete. Found ${uniqueTrends.length} trends.`,
      totalTrends: uniqueTrends.length,
      source: "Google Trends RSS + Autocomplete"
    });
  } catch (error: any) {
    console.error("[TREND MINE ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
