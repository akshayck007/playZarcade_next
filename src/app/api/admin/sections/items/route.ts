import { NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { gameId, sectionSlug, action } = await req.json();

    if (!gameId || !sectionSlug || !action) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // 1. Get Section ID
    const { data: section, error: sectionError } = await supabase
      .from("Section")
      .select("id")
      .eq("slug", sectionSlug)
      .single();

    if (sectionError || !section) {
      return NextResponse.json({ success: false, error: "Section not found" }, { status: 404 });
    }

    if (action === 'add') {
      // 2. Check if already exists
      const { data: existing } = await supabase
        .from("SectionItem")
        .select("id")
        .eq("sectionId", section.id)
        .eq("gameId", gameId)
        .single();

      if (existing) {
        return NextResponse.json({ success: true, message: "Already in section" });
      }

      // 3. Get max order
      const { data: maxItem } = await supabase
        .from("SectionItem")
        .select("order")
        .eq("sectionId", section.id)
        .order("order", { ascending: false })
        .limit(1)
        .single();

      const nextOrder = maxItem ? maxItem.order + 1 : 0;

      // 4. Insert
      const { error: insertError } = await supabase
        .from("SectionItem")
        .insert({
          id: crypto.randomUUID(),
          sectionId: section.id,
          gameId,
          order: nextOrder
        });

      if (insertError) throw insertError;

      // 5. Special case for featured
      if (sectionSlug === 'featured') {
        await supabase.from("Game").update({ isFeatured: true }).eq("id", gameId);
      }

      return NextResponse.json({ success: true, message: "Added to section" });
    } else if (action === 'remove') {
      // 6. Delete
      const { error: deleteError } = await supabase
        .from("SectionItem")
        .delete()
        .eq("sectionId", section.id)
        .eq("gameId", gameId);

      if (deleteError) throw deleteError;

      // 7. Special case for featured
      if (sectionSlug === 'featured') {
        await supabase.from("Game").update({ isFeatured: false }).eq("id", gameId);
      }

      return NextResponse.json({ success: true, message: "Removed from section" });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("[SECTION_ITEM_ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get('gameId');

    if (!gameId) {
      return NextResponse.json({ success: false, error: "Missing gameId" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("SectionItem")
      .select("Section(slug)")
      .eq("gameId", gameId);

    if (error) throw error;

    const sections = data?.map((item: any) => item.Section.slug) || [];

    return NextResponse.json({ success: true, sections });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
