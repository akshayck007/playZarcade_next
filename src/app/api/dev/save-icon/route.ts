import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { base64Image } = await req.json();

    if (!base64Image) {
      return NextResponse.json({ success: false, error: "No image data provided" }, { status: 400 });
    }

    // Check if we are in a Node.js environment (local dev or AI Studio)
    if (typeof process !== 'undefined' && process.env.NEXT_RUNTIME !== 'edge') {
      try {
        const fs = await import('fs');
        const path = await import('path');
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
      } catch (fsErr) {
        console.error("FS Error:", fsErr);
        return NextResponse.json({ success: false, error: "File system not available" }, { status: 501 });
      }
    }

    // On Edge (Cloudflare), we can't save to the file system
    return NextResponse.json({ 
      success: false, 
      error: "File system access is not available in this environment (Edge Runtime). This feature only works in local development." 
    }, { status: 501 });
  } catch (err: any) {
    console.error("Icon saving error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
