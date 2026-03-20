import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { base64Image } = await req.json();

    if (!base64Image) {
      return NextResponse.json({ success: false, error: "No image data provided" }, { status: 400 });
    }

    const buffer = Buffer.from(base64Image, 'base64');
    
    // Save to public folder
    const publicPath = path.join(process.cwd(), 'public');
    const icon192Path = path.join(publicPath, 'icon-192.png');
    const icon512Path = path.join(publicPath, 'icon-512.png');
    const faviconIcoPath = path.join(publicPath, 'favicon.ico');
    const faviconPngPath = path.join(publicPath, 'favicon.png');

    fs.writeFileSync(icon192Path, buffer);
    fs.writeFileSync(icon512Path, buffer);
    fs.writeFileSync(faviconIcoPath, buffer);
    fs.writeFileSync(faviconPngPath, buffer);

    return NextResponse.json({ 
      success: true, 
      url: `/icon-512.png?t=${Date.now()}` 
    });
  } catch (err: any) {
    console.error("Icon saving error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
