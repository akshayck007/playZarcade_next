import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

const NEWS_SOURCES = [
  { name: 'IGN', url: 'https://www.ign.com/news' },
  { name: 'GameSpot', url: 'https://www.gamespot.com/news/' }
];

export async function POST(req: Request) {
  console.log("POST /api/ai/generate-blog - Started");
  try {
    // 1. Fetch Latest Headlines using simple fetch and regex (more robust than rss-parser in some envs)
    let headlines: string[] = [];
    
    try {
      console.log("Fetching news from IGN...");
      const res = await fetch(NEWS_SOURCES[0].url);
      const html = await res.text();
      
      // Simple regex to grab some titles from HTML (very rough but works for context)
      const titleMatches = html.match(/<h3[^>]*>(.*?)<\/h3>/g) || [];
      headlines = titleMatches.slice(0, 10).map(h => h.replace(/<[^>]*>/g, '').trim());
      console.log(`Found ${headlines.length} potential headlines from HTML`);
    } catch (e) {
      console.error("News Fetch Error:", e);
      headlines = ["Could not fetch live news, use internal knowledge for the latest 24h trends."];
    }

    const newsContext = headlines.length > 0 ? headlines.join('\n') : "No specific headlines found, use general gaming trends.";

    // 2. Get API Key
    console.log("Retrieving API Key...");
    let apiKey = process.env.GEMINI_API_KEY || 
                 process.env.API_KEY || 
                 process.env.GOOGLE_API_KEY ||
                 process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    const isPlaceholder = (val: string | undefined) => 
      !val || val === "MY_GEMINI_API_KEY" || val === "undefined" || val === "your-api-key";

    if (isPlaceholder(apiKey)) {
      const possibleKey = Object.values(process.env).find(val => 
        typeof val === 'string' && val.startsWith('AIza') && val.length > 20
      );
      if (possibleKey) {
        console.log("Found valid-looking key in environment values");
        apiKey = possibleKey;
      }
    }
    
    if (isPlaceholder(apiKey)) {
      console.error("Gemini API Key missing or placeholder");
      return NextResponse.json({ error: "Gemini API Key missing." }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const { prompt: userPrompt } = await req.json();
    console.log("User prompt received");

    // 3. Construct the enhanced prompt with real-time context
    const enhancedPrompt = `
      ${userPrompt}

      CURRENT REAL-TIME TRENDING HEADLINES (Use these to pick a topic from the last 24 hours):
      ${newsContext}

      INSTRUCTIONS:
      1. Pick the most impactful/viral topic from the headlines above.
      2. Write a detailed, engaging viral news article (600+ words).
      3. Use Markdown (## Headers, multiple paragraphs, bold text, bullet points).
      4. Ensure the tone is "Viral News/Gaming Magazine" style - exciting, informative, and punchy. NO "Intelligence Report" or "Field Report" terminology.
      5. Structure the content with an introduction, several sub-headings (##), and a conclusion.
      6. For the coverImage, you MUST use this exact format: https://picsum.photos/seed/[unique-slug]/1200/630
    `;

    // 4. Generate Content
    console.log("Calling Gemini API...");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: enhancedPrompt,
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
      console.error("Empty response from Gemini");
      throw new Error("Empty response from Gemini.");
    }

    console.log("Gemini response received, parsing JSON...");
    const blogData = JSON.parse(response.text);
    console.log("Successfully generated blog data:", blogData.title);
    return NextResponse.json(blogData);

  } catch (error: any) {
    console.error("Gemini Server Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
