const { GoogleGenAI } = require("@google/genai");
const fs = require('fs');
const path = require('path');

async function run() {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("API key missing");
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });
  
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

  if (!base64Image) {
    console.error("No image generated");
    process.exit(1);
  }

  const buffer = Buffer.from(base64Image, 'base64');
  const publicPath = path.join(process.cwd(), 'public');
  fs.writeFileSync(path.join(publicPath, 'icon-192.png'), buffer);
  fs.writeFileSync(path.join(publicPath, 'icon-512.png'), buffer);
  console.log("Icons saved successfully");
}

run();
