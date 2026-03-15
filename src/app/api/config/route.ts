import { NextResponse } from 'next/server';

export const runtime = "edge";

export async function GET() {
  // Check multiple possible names the platform might use
  const apiKey = process.env.GEMINI_API_KEY || 
                 process.env.API_KEY || 
                 process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  // Log available keys (names only for security) to help debug
  const keys = Object.keys(process.env).filter(k => k.includes('KEY') || k.includes('GEMINI'));
  console.log('Server-side available keys:', keys);

  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "undefined") {
    return NextResponse.json({ 
      error: "Key not found on server",
      detectedKeys: keys 
    }, { status: 404 });
  }

  return NextResponse.json({ apiKey });
}
