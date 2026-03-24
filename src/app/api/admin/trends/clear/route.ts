import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';

export const runtime = "edge";

export async function DELETE(req: Request) {
  try {
    console.log('[Trends API] Clearing all trends...');
    
    const { error } = await supabase
      .from("TrendingKeyword")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

    if (error) {
      console.error('[Trends API] Clear All Error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log('[Trends API] All trends cleared successfully.');
    revalidatePath('/admin/trends');

    return NextResponse.json({ 
      success: true, 
      message: "All trends cleared successfully." 
    });
  } catch (error: any) {
    console.error("[TREND CLEAR ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
