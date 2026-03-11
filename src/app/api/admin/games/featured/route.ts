import { NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const { gameId, isFeatured } = await request.json();

    if (!gameId) {
      return NextResponse.json({ success: false, error: "Game ID is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("Game")
      .update({ isFeatured })
      .eq("id", gameId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[FEATURED TOGGLE ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
