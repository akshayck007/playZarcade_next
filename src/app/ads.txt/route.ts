import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data: settings } = await supabase
      .from("Settings")
      .select("adsTxt")
      .eq("id", "global")
      .single();

    const content = settings?.adsTxt || "gamepix.com, ZA727, DIRECT, f08c47fec0942fa0";

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error fetching ads.txt:", error);
    return new NextResponse("Error loading ads.txt", { status: 500 });
  }
}
