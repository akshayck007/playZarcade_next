import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    await supabase
      .from("Settings")
      .upsert({ id: "global", ...data }, { onConflict: 'id' });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[SETTINGS UPDATE ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
