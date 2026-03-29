import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    // 1. Get site name from settings
    const { data: settings } = await supabase
      .from("Settings")
      .select("siteName")
      .eq("id", "global")
      .single();

    const siteName = settings?.siteName || "PlayZ Arcade";

    // 2. Initialize Gemini
    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
    
    // 3. Generate Icon using Gemini 2.5 Flash Image
    const prompt = `A professional, modern, and minimalist square app icon for a gaming website named "${siteName}". The design should be vibrant, high-quality, and suitable for a favicon. Use a gaming-related symbol (like a controller, pixel art, or a lightning bolt) with a clean background. Neon colors on a dark background.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    let base64Data = "";
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        base64Data = part.inlineData.data;
        break;
      }
    }

    if (!base64Data) {
      throw new Error("No image data generated from AI");
    }

    return NextResponse.json({ 
      success: true, 
      base64: base64Data 
    });

  } catch (error: any) {
    console.error("[GENERATE ICON ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
