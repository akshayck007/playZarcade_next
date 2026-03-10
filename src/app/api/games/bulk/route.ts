import { NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids')?.split(',').filter(Boolean);

  if (!ids || ids.length === 0) {
    return NextResponse.json({ success: true, games: [] });
  }

  try {
    const { data, error } = await supabase
      .from("Game")
      .select("*, Category(name, slug)")
      .in("id", ids)
      .eq("isPublished", true);

    if (error) throw error;

    // Sort by original order of IDs to maintain preference
    const sortedGames = ids.map(id => data.find(g => g.id === id)).filter(Boolean);

    return NextResponse.json({ success: true, games: sortedGames });
  } catch (error: any) {
    console.error("[GAMES BULK API ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
