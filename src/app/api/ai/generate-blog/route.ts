import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from 'next/server';

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    // Log available keys (names only) to help debug
    const envKeys = Object.keys(process.env).filter(k => k.includes('KEY') || k.includes('GEMINI') || k.includes('GOOGLE'));
    console.log('Available env keys on server:', envKeys);

    // 1. Get API Key - Server-side only
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
        console.log('Found a valid-looking key in env values!');
        apiKey = possibleKey;
      }
    }
    
    if (isPlaceholder(apiKey)) {
      return NextResponse.json({ 
        error: "Gemini API Key is missing or set to a placeholder value. Please go to the 'Secrets' panel in the sidebar and add your GEMINI_API_KEY.",
        detectedKeys: envKeys,
        isPlaceholder: true
      }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // 2. Get the prompt from the request (optional, but good for flexibility)
    const { prompt } = await req.json();

    // 3. Generate Content (Removed Google Search grounding to avoid quota issues)
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            excerpt: { type: Type.STRING },
            content: { type: Type.STRING },
            tags: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            slug: { type: Type.STRING },
            coverImage: { type: Type.STRING }
          },
          required: ["title", "excerpt", "content", "tags", "slug", "coverImage"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Gemini returned an empty response.");
    }

    const blogData = JSON.parse(response.text);
    return NextResponse.json(blogData);

  } catch (error: any) {
    console.error("Gemini Server Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
