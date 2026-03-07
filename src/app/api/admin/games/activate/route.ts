import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { gameId, iframeUrl } = await request.json();

    if (!iframeUrl) {
      return NextResponse.json({ success: false, error: "Iframe URL is required" }, { status: 400 });
    }

    const game = await prisma.game.findUnique({
      where: { id: gameId }
    });

    if (!game) {
      return NextResponse.json({ success: false, error: "Game not found" }, { status: 404 });
    }

    await prisma.game.update({
      where: { id: gameId },
      data: {
        iframeUrl: iframeUrl,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Game activated successfully! It is no longer a shadow page." 
    });

  } catch (error: any) {
    console.error("[ACTIVATE GAME ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
