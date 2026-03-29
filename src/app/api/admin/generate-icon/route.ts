import { NextResponse } from 'next/server';
import { generatePwaIcon } from '@/lib/generate-icon';

export const runtime = "edge";

export async function POST() {
  try {
    const base64 = await generatePwaIcon();
    if (!base64) {
      throw new Error("Failed to generate icon");
    }
    return NextResponse.json({ success: true, base64 });
  } catch (error: any) {
    console.error("[GENERATE ICON ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
