import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { gameId, iframeUrl } = await request.json();

    if (!iframeUrl) {
      return NextResponse.json({ success: false, error: "Iframe URL is required" }, { status: 400 });
    }

    const { data: game } = await supabase
      .from("Game")
      .select("*")
      .eq("id", gameId)
      .single();

    if (!game) {
      return NextResponse.json({ success: false, error: "Game not found" }, { status: 404 });
    }

    await supabase
      .from("Game")
      .update({
        iframeUrl: iframeUrl,
        updatedAt: new Date().toISOString()
      })
      .eq("id", gameId);

    return NextResponse.json({ 
      success: true, 
      message: "Game activated successfully! It is no longer a shadow page." 
    });

  } catch (error: any) {
    console.error("[ACTIVATE GAME ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
