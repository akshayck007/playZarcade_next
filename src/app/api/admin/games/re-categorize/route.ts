import { NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Get Multiplayer and Others categories
    const { data: categories } = await supabase
      .from("Category")
      .select("id, name, slug");
    
    const multiplayerCat = categories?.find(c => c.slug === 'multiplayer' || c.name.toLowerCase() === 'multiplayer');
    const othersCat = categories?.find(c => c.slug === 'others' || c.name.toLowerCase() === 'others');
    const uncategorizedCat = categories?.find(c => c.slug === 'uncategorized' || c.name.toLowerCase() === 'uncategorized');

    if (!multiplayerCat) {
      return NextResponse.json({ success: false, error: "Multiplayer category not found. Please create it first." });
    }

    // 2. Find games with "multiplayer", "2 player", "two player", etc. in title
    const { data: gamesToUpdate } = await supabase
      .from("Game")
      .select("id, title, categoryId")
      .or('title.ilike.%multiplayer%,title.ilike.%2 player%,title.ilike.%two player%,title.ilike.%online multiplayer%');

    if (!gamesToUpdate || gamesToUpdate.length === 0) {
      return NextResponse.json({ success: true, message: "No games found with multiplayer-related keywords in title." });
    }

    const updates = [];
    let updatedCount = 0;

    for (const game of gamesToUpdate) {
      // If it's already in Multiplayer, skip
      if (game.categoryId === multiplayerCat.id) continue;

      // Update the category to Multiplayer
      const { error } = await supabase
        .from("Game")
        .update({ categoryId: multiplayerCat.id })
        .eq("id", game.id);
      
      if (!error) {
        updates.push({ id: game.id, title: game.title, from: categories?.find(c => c.id === game.categoryId)?.name || "Unknown" });
        updatedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully moved ${updatedCount} games to Multiplayer category.`,
      updates 
    });
  } catch (error: any) {
    console.error("[RE-CATEGORIZE ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
