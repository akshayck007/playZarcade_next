import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import RetroContent from './RetroContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Retro Arcade | Play Classic Games Online | PlayZ Arcade',
  description: 'Play thousands of classic retro games from NES, SNES, GBA, N64, and more directly in your browser. Pixel-perfect emulation, no downloads required.',
  openGraph: {
    title: 'Retro Arcade | Play Classic Games Online',
    description: 'Relive your childhood with our massive collection of retro games. Play NES, SNES, Sega, and more in high quality.',
    images: ['https://picsum.photos/seed/retro-arcade-og/1200/630'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Retro Arcade | Play Classic Games Online',
    description: 'Play classic retro games directly in your browser. NES, SNES, GBA, and more!',
  }
};

export default async function RetroPage() {
  const supabase = createServerComponentClient({ cookies });
  
  // Fetch initial data on the server
  const [settingsResult, gamesResult] = await Promise.all([
    supabase
      .from("Settings")
      .select("retroEnabled")
      .eq("id", "global")
      .maybeSingle(),
    supabase
      .from('Game')
      .select('*, Category(*)')
      .eq('isPublished', true)
      .eq('isRetro', true)
      .order('playCount', { ascending: false })
      .limit(20)
  ]);

  const retroEnabled = settingsResult.data?.retroEnabled !== false;
  const initialGames = gamesResult.data || [];

  return (
    <RetroContent 
      initialGames={initialGames} 
      retroEnabled={retroEnabled} 
    />
  );
}
