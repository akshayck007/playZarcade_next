import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data: categories, error: catError } = await supabase.from("Category").select("*");
    const { data: games, error: gameError } = await supabase.from("Game").select("*");
    
    if (catError || gameError) {
      return NextResponse.json({ catError, gameError }, { status: 500 });
    }

    return NextResponse.json({ 
      categoriesCount: categories?.length || 0, 
      gamesCount: games?.length || 0,
      categories 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
