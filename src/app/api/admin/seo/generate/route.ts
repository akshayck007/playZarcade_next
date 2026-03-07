import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = "edge";

const MODIFIERS = ["unblocked", "online", "fullscreen", "mobile", "pc"];

export async function POST(request: Request) {
  try {
    const { gameId } = await request.json();
    
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });

    let count = 0;
    for (const modifier of MODIFIERS) {
      const seoSlug = `play-${game.slug}-${modifier}`;
      
      const existing = await prisma.seoPage.findUnique({
        where: { slug: seoSlug }
      });

      if (!existing) {
        await prisma.seoPage.create({
          data: {
            gameId: game.id,
            slug: seoSlug,
            modifier: modifier,
          }
        });
        count++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Generated ${count} SEO pages for ${game.title}` 
    });
  } catch (error: any) {
    console.error("[SEO GEN ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
