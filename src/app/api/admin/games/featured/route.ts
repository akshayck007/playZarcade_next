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

    // Also manage SectionItem for the 'featured' section
    const { data: section } = await supabase
      .from("Section")
      .select("id")
      .eq("slug", "featured")
      .single();

    if (section) {
      if (isFeatured) {
        // Add to SectionItem if not already there
        const { data: existing } = await supabase
          .from("SectionItem")
          .select("id")
          .eq("sectionId", section.id)
          .eq("gameId", gameId)
          .single();

        if (!existing) {
          // Get max order
          const { data: maxItem } = await supabase
            .from("SectionItem")
            .select("order")
            .eq("sectionId", section.id)
            .order("order", { ascending: false })
            .limit(1);
          
          const nextOrder = maxItem && maxItem.length > 0 ? (maxItem[0].order + 1) : 0;

          await supabase
            .from("SectionItem")
            .insert({
              id: crypto.randomUUID(),
              sectionId: section.id,
              gameId,
              order: nextOrder
            });
        }
      } else {
        // Remove from SectionItem
        await supabase
          .from("SectionItem")
          .delete()
          .eq("sectionId", section.id)
          .eq("gameId", gameId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[FEATURED TOGGLE ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
