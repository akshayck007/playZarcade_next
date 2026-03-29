import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenAI } from "@google/genai";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // 1. Find keywords that are "pending" or "trending" but don't have shadow pages yet
    const { data: keywords } = await supabase
      .from("TrendingKeyword")
      .select("*")
      .eq("status", "pending")
      .limit(20); // Generate up to 20 articles per run

    if (!keywords || keywords.length === 0) {
      return NextResponse.json({ success: true, message: "No pending keywords to process." });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
    const results = [];

    for (const trend of keywords) {
      const currentYear = new Date().getFullYear();
      const prompt = `
        Research the trending topic "${trend.keyword}" for ${currentYear} using Google Search.
        Create a high-quality, SEO-optimized article for a gaming arcade platform.
        
        Instructions:
        1. Create a catchy, click-worthy title.
        2. Write a comprehensive article (500+ words) in Markdown.
        3. Include sections like "What is ${trend.keyword}?", "How to Play", "Tips & Tricks", and "Latest Updates".
        4. Generate a URL-friendly slug.
        5. Generate a meta description (SEO description).
        6. Return ONLY a JSON object:
        {
          "title": "The Title",
          "content": "The full markdown content",
          "slug": "the-url-slug",
          "seoDescription": "The meta description"
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

      const generatedData = JSON.parse(response.text || "{}");

      if (generatedData.content) {
        await supabase
          .from("TrendingKeyword")
          .update({
            shadowTitle: generatedData.title,
            shadowContent: generatedData.content,
            shadowSlug: generatedData.slug,
            shadowSeoDescription: generatedData.seoDescription,
            status: "shadow_page_live",
            lastUpdated: new Date().toISOString()
          })
          .eq("id", trend.id);
        
        results.push({ keyword: trend.keyword, status: "generated" });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("[GENERATE ARTICLES CRON ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
