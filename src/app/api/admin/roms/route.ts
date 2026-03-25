import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const romsDir = path.join(process.cwd(), 'public', 'roms');
    
    if (!fs.existsSync(romsDir)) {
      return NextResponse.json({ files: [] });
    }

    const files = fs.readdirSync(romsDir)
      .filter(file => !file.startsWith('.'))
      .map(file => {
        const ext = path.extname(file).toLowerCase();
        const title = file.replace(ext, '')
          .replace(/\(.*\)/g, '')
          .replace(/\[.*\]/g, '')
          .trim();
        
        return {
          filename: file,
          title,
          url: `/roms/${file}`,
          extension: ext.replace('.', '')
        };
      });

    return NextResponse.json({ files });
  } catch (error: any) {
    console.error('[ROMS_LIST_ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
