import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenAI } from "@google/genai";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // 1. Find shadow pages that haven't been re-mined in 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: keywords } = await supabase
      .from("TrendingKeyword")
      .select("*")
      .eq("status", "shadow_page_live")
      .or(`lastReMined.is.null,lastReMined.lt.${sevenDaysAgo}`)
      .limit(20); // Process 20 at a time

    if (!keywords || keywords.length === 0) {
      return NextResponse.json({ success: true, message: "No pages need re-mining." });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
    const results = [];

    for (const trend of keywords) {
      const currentYear = new Date().getFullYear();
      const prompt = `
        Update the following article about "${trend.keyword}" for ${currentYear}.
        Research the latest developments from the past 24 hours to 1 week using Google Search.
        
        Original Title: ${trend.shadowTitle}
        Original Content: ${trend.shadowContent}
        
        Instructions:
        1. Keep the same slug: ${trend.shadowSlug}
        2. Update the "Latest News" or "Recent Developments" section with fresh info.
        3. Ensure the tone is professional and helpful.
        4. Use proper Markdown with double newlines between paragraphs.
        5. Return ONLY a JSON object:
        {
          "title": "Updated catchy title",
          "content": "Full updated markdown content",
          "seoDescription": "Updated meta description"
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        }
      });

      const updatedData = JSON.parse(response.text || "{}");

      if (updatedData.content) {
        await supabase
          .from("TrendingKeyword")
          .update({
            shadowTitle: updatedData.title,
            shadowContent: updatedData.content,
            shadowSeoDescription: updatedData.seoDescription,
            lastReMined: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          })
          .eq("id", trend.id);
        
        results.push({ keyword: trend.keyword, status: "updated" });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("[RE-MINE CRON ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
