import { GoogleGenAI } from "@google/genai";

export async function generatePwaIcon() {
  const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
  
  const prompt = "A playful cyberpunk gaming icon featuring the letters 'Pz' in a vibrant, neon-lit font. The aesthetic is futuristic yet fun, with bright cyan and magenta accents, sharp digital edges, and a high-tech arcade feel. The background is a deep, textured black to make the neon pop. Professional logo design, square format, centered.";
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: prompt,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
      },
    },
  });

  let base64Image = "";
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      base64Image = part.inlineData.data;
      break;
    }
  }

  return base64Image;
}
