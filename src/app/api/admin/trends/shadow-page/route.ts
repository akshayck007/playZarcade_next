import { NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase";
import { GoogleGenAI, Type } from "@google/genai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { trendId, keyword, type } = await req.json();

    if (!trendId || !keyword) {
      return NextResponse.json({ success: false, error: "Missing trendId or keyword" }, { status: 400 });
    }

    // 1. Get API Key
    const apiKey = 
      (process.env as any).API_KEY || 
      process.env.NEXT_PUBLIC_GEMINI_API_KEY || 
      (process.env as any).NEXT_PUBLIC_MY_GEMINI_API_KEY;
    
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("Gemini API Key is missing.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // 2. Generate Content based on type
    const prompt = type === 'article' 
      ? `Write a trending SEO-optimized article about "${keyword}". 
         Focus on why it's trending in the browser gaming world. 
         Include a catchy title, introduction, 3 main points, and a conclusion.
         Format as JSON with fields: title, content (markdown), slug.`
      : `Create a "Shadow Page" for a trending game called "${keyword}". 
         This is a landing page for a game that people are searching for but might not be on our site yet.
         Include a catchy title, a detailed description (300 words), how to play (if known or predicted), and SEO tags.
         Format as JSON with fields: title, content (markdown), slug, seoDescription.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            slug: { type: Type.STRING },
            seoDescription: { type: Type.STRING }
          },
          required: ["title", "content", "slug"]
        }
      }
    });

    const shadowData = JSON.parse(response.text || "{}");

    // 3. Save to database (Update TrendingKeyword)
    const { error: updateError } = await supabase
      .from("TrendingKeyword")
      .update({
        status: "shadow_page_live",
        shadowTitle: shadowData.title,
        shadowContent: shadowData.content,
        shadowSlug: shadowData.slug,
        shadowSeoDescription: shadowData.seoDescription || "",
        shadowType: type || 'game',
        lastUpdated: new Date().toISOString()
      })
      .eq("id", trendId);

    if (updateError) throw updateError;

    return NextResponse.json({ 
      success: true, 
      message: `${type === 'article' ? 'Article' : 'Shadow Page'} created successfully!`,
      data: shadowData
    });

  } catch (error: any) {
    console.error("[SHADOW PAGE ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ success: false, error: "Missing or invalid IDs" }, { status: 400 });
    }

    const { error } = await supabase
      .from("TrendingKeyword")
      .delete()
      .in("id", ids);

    if (error) throw error;

    return NextResponse.json({ success: true, message: `${ids.length} trends deleted successfully` });
  } catch (error: any) {
    console.error("[DELETE TRENDS ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
