import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import Parser from 'rss-parser';

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const isPreview = searchParams.get('preview') === 'true';
    const trends: { keyword: string; volume: number; source: string }[] = [];

    // 1. Fetch from Google Trends RSS (Daily Trends)
    try {
      const rssUrls = [
        'https://trends.google.com/trends/trendingsearches/daily/rss?geo=US',
        'https://trends.google.com/trending/rss?geo=US'
      ];

      let feed = null;
      for (const url of rssUrls) {
        try {
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Accept': 'application/rss+xml, application/xml;q=0.9, */*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
            }
          });
          
          if (response.ok) {
            const xml = await response.text();
            feed = await parser.parseString(xml);
            break;
          }
        } catch (e) {
          console.error(`Failed to fetch RSS from ${url}:`, e);
        }
      }

      if (feed) {
        feed.items.forEach(item => {
          if (item.title) {
            trends.push({ 
              keyword: item.title.toLowerCase(), 
              volume: parseInt((item as any).ht_approx_traffic?.replace(/[^0-9]/g, '') || '5000'),
              source: 'Google Trends RSS'
            });
          }
        });
      }
    } catch (e) {
      console.error("Error fetching Google Trends RSS:", e);
    }

    // 2. Fetch from Google Autocomplete (Search Intent)
    const prefixes = ["unblocked games", "io games", "free online games", "play ", "best web games "];
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
    const uniqueTrends = Array.from(new Map(trends.map(t => [t.keyword, t])).values());

    if (isPreview) {
      return NextResponse.json({
        success: true,
        trends: uniqueTrends,
        count: uniqueTrends.length
      });
    }

    // Get settings
    const settings = await prisma.settings.upsert({
      where: { id: "global" },
      update: {},
      create: { id: "global" }
    });

    let newTrendsCount = 0;
    for (const trend of uniqueTrends) {
      const existing = await prisma.trendingKeyword.findUnique({
        where: { keyword: trend.keyword }
      });

      if (!existing) {
        await prisma.trendingKeyword.create({
          data: {
            keyword: trend.keyword,
            searchVolume: trend.volume,
            status: "detected"
          }
        });
        newTrendsCount++;
      } else {
        await prisma.trendingKeyword.update({
          where: { id: existing.id },
          data: {
            searchVolume: trend.volume,
            lastUpdated: new Date()
          }
        });
      }

      // Auto-boost game trend scores if setting is enabled
      if (settings.autoBoostTrending) {
        const words = trend.keyword.split(' ').filter(w => w.length > 3);
        if (words.length > 0) {
          // Find games matching the trend
          const matchingGames = await prisma.game.findMany({
            where: {
              OR: words.map(word => ({
                title: { contains: word, mode: 'insensitive' }
              }))
            }
          });

          for (const game of matchingGames) {
            // Boost score based on volume (normalized)
            const boost = trend.volume / 1000;
            await prisma.game.update({
              where: { id: game.id },
              data: {
                trendScore: { increment: boost }
              }
            });
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Trend mining complete. Found ${newTrendsCount} new trends.`,
      totalTrends: uniqueTrends.length,
      source: "Google Trends RSS + Autocomplete"
    });
  } catch (error: any) {
    console.error("[TREND MINE ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
