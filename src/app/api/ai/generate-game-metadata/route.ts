import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const envKeys = Object.keys(process.env).filter(k => k.includes('KEY') || k.includes('GEMINI') || k.includes('GOOGLE'));
    
    let apiKey = process.env.GEMINI_API_KEY || 
                 process.env.API_KEY || 
                 process.env.GOOGLE_API_KEY ||
                 process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    const isPlaceholder = (val: string | undefined) => 
      !val || val === "MY_GEMINI_API_KEY" || val === "undefined" || val === "your-api-key";

    // Brute force search for a key starting with AIza if the standard ones fail
    if (isPlaceholder(apiKey)) {
      const possibleKey = Object.values(process.env).find(val => 
        typeof val === 'string' && val.startsWith('AIza') && val.length > 20
      );
      if (possibleKey) {
        apiKey = possibleKey;
      }
    }
    
    if (isPlaceholder(apiKey)) {
      return NextResponse.json({ 
        error: "Gemini API Key is missing or set to a placeholder value.",
        detectedKeys: envKeys,
        isPlaceholder: true
      }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const { keyword } = await req.json();

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate game metadata for a browser game called "${keyword}". 
      Focus on the core game title.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            faq: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  q: { type: Type.STRING },
                  a: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const gameData = JSON.parse(response.text || "{}");
    return NextResponse.json(gameData);

  } catch (error: any) {
    console.error("Gemini Server Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
