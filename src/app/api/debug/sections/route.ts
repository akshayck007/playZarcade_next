import { NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabase
    .from("Section")
    .select("*")
    .order("order", { ascending: true });
  return NextResponse.json({ data, error });
}
