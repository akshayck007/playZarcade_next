import { NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const { items } = await request.json(); // Array of { id: string, order: number }

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ success: false, error: "Items array is required" }, { status: 400 });
    }

    // Perform updates in parallel
    const updatePromises = items.map(item => 
      supabase
        .from("Section")
        .update({ order: item.order })
        .eq("id", item.id)
    );

    const results = await Promise.all(updatePromises);
    const errors = results.filter(r => r.error);

    if (errors.length > 0) {
      console.error("[SECTION REORDER ERRORS]", errors);
      return NextResponse.json({ success: false, error: "Some updates failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[SECTION REORDER API ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
