import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { GoogleGenAI, Type } from "@google/genai";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

// AI Filtering and Categorization
async function processTrendsWithAI(trends: { keyword: string; volume: number; source: string; thumbnailUrl?: string; gameUrl?: string }[]) {
  try {
    // Pre-filter obviously non-gaming trends to save tokens and improve quality
    const filteredTrends = trends.filter(t => {
      const k = t.keyword.toLowerCase();
      // Discard common noise (celebrities, sports teams, news, industry drama)
      const noise = [
        'vs', 'schedule', 'live stream', 'weather', 'election', 'news', 'death', 'died', 'arrested', 'court', 'trial', 'concert', 'tour', 'result', 'score',
        'translation', 'layoff', 'restructuring', 'investment', 'megathread', 'opinion', 'looking for', 'review', 'integration', 'transform', 'invest', 'restructure',
        'update', 'patch notes', 'leak', 'rumor', 'trailer', 'announcement', 'delay', 'canceled', 'cancelled'
      ];
      if (noise.some(n => k.includes(n))) return false;
      if (k.length < 3) return false;
      // Filter out titles that look like sentences (likely news or discussions)
      if (k.split(' ').length > 8) return false;
      return true;
    });

    if (filteredTrends.length === 0) return [];

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these gaming search trends for a web arcade:
      ${JSON.stringify(filteredTrends.slice(0, 30))} 
      
      Tasks:
      1. Keep ONLY specific game titles.
      2. Discard news, reviews, or general industry talk.
      3. Assign 'unifiedScore' (0-150) for viral potential.
      4. Categorize: Action, Puzzle, Adventure, Strategy, Sports, Simulation, Arcade, Racing.
      
      Return JSON array only.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              keyword: { type: Type.STRING },
              category: { type: Type.STRING },
              unifiedScore: { type: Type.NUMBER },
              seoTitle: { type: Type.STRING },
              seoDescription: { type: Type.STRING },
              source: { type: Type.STRING },
              thumbnailUrl: { type: Type.STRING }
            },
            required: ["keyword", "category", "unifiedScore", "seoTitle", "seoDescription"]
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Processing Error:", error);
    return null;
  }
}

async function fetchRedditTrends() {
  const subreddits = ['webgames', 'gaming', 'incremental_games'];
  const redditTrends: { keyword: string; volume: number; source: string }[] = [];
  
  for (const sub of subreddits) {
    try {
      const res = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=15`, {
        headers: { 'User-Agent': 'PlayZ-Arcade-Bot/1.0' }
      });
      if (res.ok) {
        const data = await res.json();
        const posts = data.data.children;
        posts.forEach((post: any) => {
          redditTrends.push({
            keyword: post.data.title,
            volume: Math.min(post.data.ups * 5, 10000), 
            source: `Reddit (r/${sub})`
          });
        });
      }
    } catch (e) {
      console.error(`Reddit fetch failed for r/${sub}:`, e);
    }
  }
  return redditTrends;
}

async function fetchCompetitorTrends() {
  const competitors = [
    { name: 'Poki', url: 'https://poki.com/en/popular' },
    { name: 'CrazyGames', url: 'https://www.crazygames.com/t/popular' }
  ];
  const compTrends: { keyword: string; volume: number; source: string; thumbnailUrl?: string; gameUrl?: string }[] = [];
  
  for (const comp of competitors) {
    try {
      const res = await fetch(comp.url, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      if (res.ok) {
        const html = await res.text();
        
        // More specific regex for game titles in common patterns
        const seen = new Set();
        
        // Pattern 1: alt tags (usually on game thumbnails)
        const altMatches = html.matchAll(/alt="([^"]+)"/g);
        for (const match of altMatches) {
          const title = match[1].trim();
          if (title.length > 3 && title.length < 40 && !seen.has(title.toLowerCase())) {
            if (!['poki', 'crazygames', 'logo', 'popular', 'games', 'play', 'online'].includes(title.toLowerCase())) {
              compTrends.push({
                keyword: title,
                volume: 25000,
                source: comp.name
              });
              seen.add(title.toLowerCase());
            }
          }
        }

        // Pattern 2: data-title or aria-label
        const labelMatches = html.matchAll(/(?:aria-label|data-title)="([^"]+)"/g);
        for (const match of labelMatches) {
          const title = match[1].trim();
          if (title.length > 3 && title.length < 40 && !seen.has(title.toLowerCase())) {
            compTrends.push({
              keyword: title,
              volume: 25000,
              source: comp.name
            });
            seen.add(title.toLowerCase());
          }
        }
      }
    } catch (e) {
      console.error(`Competitor fetch failed for ${comp.name}:`, e);
    }
  }
  return compTrends;
}

async function fetchTikTokTrends() {
  try {
    const jsonResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for the top 5 viral browser games or gaming hashtags currently trending on TikTok. 
      Return as a JSON array of objects with 'keyword' and 'reason'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              keyword: { type: Type.STRING },
              reason: { type: Type.STRING }
            },
            required: ["keyword", "reason"]
          }
        },
        tools: [{ googleSearch: {} }]
      }
    });
    
    const tiktokData = JSON.parse(jsonResponse.text);
    return tiktokData.map((item: any) => ({
      keyword: item.keyword,
      volume: 12000,
      source: 'TikTok'
    }));
  } catch (e) {
    console.error("TikTok trend fetch failed:", e);
    return [];
  }
}

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

    // Fetch existing keywords to get their IDs for upsert
    const { data: existingKeywords, error: fetchError } = await supabase
      .from("TrendingKeyword")
      .select("id, keyword, searchVolume");
    
    if (fetchError) {
      console.error('[TREND MINE] POST: Error fetching existing keywords:', fetchError);
    }

    // Prepare bulk upsert for TrendingKeyword
    const upsertData = trends.map(trend => {
      const keywordLower = trend.keyword.toLowerCase();
      const existing = existingKeywords?.find(k => k.keyword.toLowerCase() === keywordLower);
      const previousVolume = existing ? (existing as any).searchVolume : 0;
      
      // Calculate Trend Velocity (Growth Rate)
      const velocity = previousVolume > 0 ? (trend.volume - previousVolume) / previousVolume : 0;
      
      const item: any = {
        keyword: trend.keyword,
        searchVolume: trend.volume,
        status: (trend.volume > 15000 || velocity > 0.5 || (trend.unifiedScore || 0) > 80) ? "shadow_page_live" : "detected",
        type: (trend.source || '').includes('Rising') ? 'rising' : 'top',
        source: trend.source || 'Google Trends',
        unifiedScore: trend.unifiedScore || 0,
        lastUpdated: new Date().toISOString(),
        shadowSlug: trend.keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        shadowType: 'game',
        shadowIframeUrl: trend.iframeUrl || "",
        shadowThumbnailUrl: trend.thumbnailUrl || "",
        shadowTitle: trend.seoTitle || `${trend.keyword} - Play Online Now`,
        shadowSeoDescription: trend.seoDescription || `Play ${trend.keyword} online for free. Discover the latest trending games and unblocked web games on PlayZ Arcade.`
      };
      
      return item;
    });

    console.log(`[TREND MINE] POST: Upserting ${upsertData.length} items. Sample keyword:`, upsertData[0]?.keyword);

    if (upsertData.length === 0) {
      console.warn('[TREND MINE] POST: No data to upsert.');
      return NextResponse.json({ success: false, error: "No trends processed to save." }, { status: 400 });
    }

    const { data: savedData, error: upsertError } = await supabase
      .from("TrendingKeyword")
      .upsert(upsertData, { onConflict: 'keyword' })
      .select();

    if (upsertError) {
      console.error('[TREND MINE] POST: Upsert Error:', upsertError);
      return NextResponse.json({ success: false, error: upsertError.message }, { status: 500 });
    }

    console.log(`[TREND MINE] POST: Successfully saved ${savedData?.length || 0} trends.`);

    revalidatePath('/admin/trends');

    return NextResponse.json({ 
      success: true, 
      message: `Trend mining complete. Saved ${savedData?.length || 0} trends.`,
      count: savedData?.length || 0
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
        'https://trends.google.com/trends/trendingsearches/daily/rss?geo=US',
        'https://trends.google.com/trends/trendingsearches/realtime/rss?geo=US&category=e', // Entertainment
        'https://trends.google.com/trends/trendingsearches/realtime/rss?geo=US&category=t'  // Sci/Tech
      ];

      for (const url of rssUrls) {
        try {
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              'Accept': 'application/rss+xml, application/xml;q=0.9, */*;q=0.8'
            }
          });
          
          if (response.ok) {
            const xml = await response.text();
            const parsedItems = parseTrendsRss(xml);
            
            if (parsedItems.length > 0) {
              console.log(`[TREND MINE] Fetched ${parsedItems.length} items from Google Trends: ${url}`);
              parsedItems.forEach(item => {
                trends.push({ 
                  keyword: item.title.toLowerCase(), 
                  volume: parseInt(item.traffic.replace(/[^0-9]/g, '') || '5000'),
                  source: 'Google Trends'
                });
              });
            }
          } else {
            console.warn(`[TREND MINE] Google Trends RSS failed (${response.status}): ${url}`);
          }
        } catch (e) {
          console.error(`[TREND MINE] Google Trends RSS error for ${url}:`, e);
        }
      }
    } catch (e) {
      console.error(`[TREND MINE] Google Trends main loop error:`, e);
    }

    // 2. Fetch from Reddit
    const redditTrends = await fetchRedditTrends();
    trends.push(...redditTrends);

    // 3. Fetch from Competitors
    const compTrends = await fetchCompetitorTrends();
    trends.push(...compTrends);

    // 4. Fetch from TikTok
    const tiktokTrends = await fetchTikTokTrends();
    trends.push(...tiktokTrends);

    // 5. Fetch from Google Autocomplete (Discovery Intent)
    const currentYear = new Date().getFullYear();
    const prefixes = [
      "new unblocked games ", 
      "trending io games ", 
      "rising web games ", 
      "popular games right now ",
      `best new games ${currentYear} `,
      "upcoming web games ",
      "new browser games ",
      "trending games on tiktok ",
      "viral web games ",
      "games like roblox ",
      "games like minecraft ",
      "browser game play games online rising ",
      "top browser games past 24 hours ",
      "newly released browser games this week "
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
              source: prefix.includes('rising') || prefix.includes('new') ? 'Rising Autocomplete' : `Autocomplete (${prefix})`
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

    // 6. AI Processing and Unified Scoring
    console.log(`[TREND MINE] AI processing ${uniqueTrends.length} keywords from multiple sources...`);
    const aiResults = await processTrendsWithAI(uniqueTrends);
    
    if (aiResults && Array.isArray(aiResults)) {
      // Merge AI results with trend data
      uniqueTrends = aiResults.map(aiItem => {
        const original = uniqueTrends.find(t => t.keyword.toLowerCase() === aiItem.keyword.toLowerCase());
        return {
          keyword: aiItem.keyword,
          volume: original ? original.volume : 5000,
          source: aiItem.source || (original ? original.source : 'AI Discovery'),
          category: aiItem.category,
          unifiedScore: aiItem.unifiedScore,
          seoTitle: aiItem.seoTitle,
          seoDescription: aiItem.seoDescription,
          iframeUrl: aiItem.iframeUrl,
          thumbnailUrl: aiItem.thumbnailUrl || (original as any)?.thumbnailUrl
        };
      }).filter(t => t.unifiedScore > 40); // Keep reasonably scored trends
    } else {
      // If AI fails, apply a strict keyword filter to raw trends
      const gamingKeywords = ['game', 'play', 'online', 'unblocked', 'io', 'simulator', 'mod', 'apk', 'multiplayer', 'free', 'browser', 'web', 'arcade'];
      uniqueTrends = uniqueTrends.filter(t => 
        gamingKeywords.some(gk => t.keyword.toLowerCase().includes(gk)) || 
        ['Poki', 'CrazyGames', 'Reddit (r/webgames)'].includes(t.source)
      ).slice(0, 20); 
    }

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

    // Fetch existing keywords to get their IDs for upsert
    const { data: existingKeywords, error: fetchError } = await supabase
      .from("TrendingKeyword")
      .select("id, keyword, searchVolume");
    
    if (fetchError) {
      console.error('[TREND MINE] GET: Error fetching existing keywords:', fetchError);
    }

    // Prepare bulk upsert for TrendingKeyword
    const upsertData = uniqueTrends.map(trend => {
      const keywordLower = trend.keyword.toLowerCase();
      const existing = existingKeywords?.find(k => k.keyword.toLowerCase() === keywordLower);
      const previousVolume = existing ? (existing as any).searchVolume : 0;
      
      // Calculate Trend Velocity (Growth Rate)
      const velocity = previousVolume > 0 ? (trend.volume - previousVolume) / previousVolume : 0;
      const unifiedScore = (trend as any).unifiedScore || 0;
      
      const item: any = {
        keyword: trend.keyword,
        searchVolume: trend.volume,
        status: (trend.volume > 15000 || velocity > 0.5 || unifiedScore > 80) ? "shadow_page_live" : "detected", // Automatic Shadow Page Creation if Score > 80
        type: (trend.source || '').includes('Rising') || velocity > 0.5 ? 'rising' : 'top',
        source: trend.source || 'Google Trends',
        unifiedScore: unifiedScore,
        lastUpdated: new Date().toISOString(),
        shadowTitle: (trend as any).seoTitle || `${trend.keyword} - Play Online Now`,
        shadowSeoDescription: (trend as any).seoDescription || `Play ${trend.keyword} online for free. Discover the latest trending games and unblocked web games on PlayZ Arcade.`,
        shadowIframeUrl: (trend as any).iframeUrl,
        shadowThumbnailUrl: (trend as any).thumbnailUrl,
        shadowSlug: trend.keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        shadowType: 'game'
      };
      
      return item;
    });

    console.log(`[TREND MINE] GET: Upserting ${upsertData.length} items. Sample keyword:`, upsertData[0]?.keyword);

    if (upsertData.length === 0) {
      console.warn('[TREND MINE] GET: No data to upsert.');
      return NextResponse.json({ success: false, error: "No trends discovered to save." }, { status: 404 });
    }

    const { data: savedData, error: upsertError } = await supabase
      .from("TrendingKeyword")
      .upsert(upsertData, { onConflict: 'keyword' })
      .select();

    if (upsertError) {
      console.error('[TREND MINE] GET: Upsert Error:', upsertError);
      return NextResponse.json({ success: false, error: upsertError.message }, { status: 500 });
    }

    console.log(`[TREND MINE] GET: Successfully saved ${savedData?.length || 0} trends.`);

    revalidatePath('/admin/trends');

    return NextResponse.json({ 
      success: true, 
      message: `Trend mining complete. Saved ${savedData?.length || 0} trends.`,
      totalTrends: savedData?.length || 0,
      source: aiResults ? "AI Processed" : "Google Trends RSS + Autocomplete"
    });
  } catch (error: any) {
    console.error("[TREND MINE ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
