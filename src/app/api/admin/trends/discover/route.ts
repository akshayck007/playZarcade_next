import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from "@google/genai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = 
      (process.env as any).API_KEY || 
      process.env.NEXT_PUBLIC_GEMINI_API_KEY || 
      (process.env as any).NEXT_PUBLIC_MY_GEMINI_API_KEY;
    
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("Gemini API Key is missing.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a Trend Discovery AI for a gaming platform called PlayZ Arcade.
      
      User Prompt: "${prompt}"
      
      Task:
      1. Use Google Search to find current trending search terms, keywords, or specific game titles related to the prompt.
      2. Focus on web-based, browser, or "unblocked" games that are popular right now (past 24h to 1 week).
      3. Return a list of specific keywords with estimated search volume (relative scale 1000-100000).
      
      Return the result as a JSON array of objects with fields: keyword (string), volume (number), source (string).
      Example: [{"keyword": "bloxd.io", "volume": 45000, "source": "Gemini Discovery"}]`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              keyword: { type: Type.STRING },
              volume: { type: Type.NUMBER },
              source: { type: Type.STRING }
            },
            required: ["keyword", "volume", "source"]
          }
        }
      }
    });

    const trends = JSON.parse(response.text || "[]");

    return NextResponse.json({ 
      success: true, 
      trends 
    });

  } catch (error: any) {
    console.error("[TREND DISCOVERY ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
