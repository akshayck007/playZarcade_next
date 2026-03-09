import { NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cleanupMap = [
      { old: "action-games", new: "action" },
      { old: "puzzle-games", new: "puzzle" },
      { old: "racing-games", new: "racing" },
      { old: "multiplayer-games", new: "multiplayer" },
    ];

    const results = [];

    for (const mapping of cleanupMap) {
      // 1. Get the old category
      const { data: oldCat } = await supabase
        .from("Category")
        .select("id, name")
        .eq("slug", mapping.old)
        .single();

      if (!oldCat) {
        results.push({ category: mapping.old, status: "Not found, skipping" });
        continue;
      }

      // 2. Get the new category
      const { data: newCat } = await supabase
        .from("Category")
        .select("id, name")
        .eq("slug", mapping.new)
        .single();

      if (!newCat) {
        results.push({ category: mapping.old, status: `Target category ${mapping.new} not found, skipping` });
        continue;
      }

      // 3. Move games from old to new
      const { error: moveError } = await supabase
        .from("Game")
        .update({ categoryId: newCat.id })
        .eq("categoryId", oldCat.id);

      if (moveError) {
        results.push({ category: mapping.old, status: `Error moving games: ${moveError.message}` });
        continue;
      }

      // 4. Delete the old category
      const { error: deleteError } = await supabase
        .from("Category")
        .delete()
        .eq("id", oldCat.id);

      if (deleteError) {
        results.push({ category: mapping.old, status: `Error deleting category: ${deleteError.message}` });
      } else {
        results.push({ category: mapping.old, status: `Successfully merged into ${mapping.new} and deleted` });
      }
    }

    // Also remove any other categories with 0 games that might be duplicates or empty
    const { data: allCats } = await supabase
      .from("Category")
      .select("id, name, slug, Game(id)");
    
    if (allCats) {
      for (const cat of allCats) {
        const gameCount = (cat as any).Game?.length || 0;
        // If it's empty and not one we just handled, maybe we should delete it?
        // But let's be safe and only delete if it's clearly a duplicate or requested.
        // The user specifically asked for the ones above.
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("[CLEANUP ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
