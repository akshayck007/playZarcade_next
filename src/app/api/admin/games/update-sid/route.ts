import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { sid } = await request.json();
  
  if (!sid) {
    return NextResponse.json({ success: false, error: "SID is required" }, { status: 400 });
  }

  try {
    let totalUpdated = 0;
    let hasMore = true;
    let offset = 0;
    const limit = 500;

    while (hasMore) {
      // Fetch a chunk of games
      const { data: games, error: fetchError } = await supabase
        .from("Game")
        .select("id, iframeUrl, slug, title, description, thumbnail, categoryId, tags, trendScore, isPublished, playCount")
        .not("iframeUrl", "is", null)
        .range(offset, offset + limit - 1);

      if (fetchError) throw fetchError;
      if (!games || games.length === 0) {
        hasMore = false;
        break;
      }

      const updates = [];
      for (const game of games) {
        let newUrl = game.iframeUrl;
        if (newUrl && newUrl.includes('sid=')) {
          newUrl = newUrl.replace(/sid=[^&]+/, `sid=${sid}`);
        } else if (newUrl && !newUrl.includes('sid=')) {
          if (newUrl.includes('gamepix.com')) {
            const separator = newUrl.includes('?') ? '&' : '?';
            newUrl = `${newUrl}${separator}sid=${sid}`;
          }
        }

        if (newUrl !== game.iframeUrl) {
          updates.push({
            ...game,
            iframeUrl: newUrl
          });
        }
      }

      if (updates.length > 0) {
        const { error: updateError } = await supabase
          .from("Game")
          .upsert(updates, { onConflict: 'id' });
        
        if (updateError) {
          console.error(`Error updating chunk at offset ${offset}:`, updateError);
        } else {
          totalUpdated += updates.length;
        }
      }

      offset += limit;
      if (games.length < limit) hasMore = false;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated SID for ${totalUpdated} games.`,
      updatedCount: totalUpdated
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
