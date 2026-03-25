import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  try {
    // In Edge runtime, we fetch the manifest from the public folder
    // This works because the public folder is served as static assets
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const manifestUrl = `${baseUrl}/roms-manifest.json`;
    
    const response = await fetch(manifestUrl);
    if (!response.ok) {
      return NextResponse.json({ files: [] });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[ROMS_LIST_ERROR]', error);
    return NextResponse.json({ files: [] }); // Fallback to empty list
  }
}
