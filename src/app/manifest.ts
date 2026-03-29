import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { data: settings } = await supabase
    .from('Settings')
    .select('faviconUrl')
    .eq('id', 'global')
    .maybeSingle();

  const iconUrl = settings?.faviconUrl || '/icon-192.png';
  const icon512Url = settings?.faviconUrl || '/icon-512.png';

  return {
    name: 'PlayZ Arcade',
    short_name: 'PlayZ',
    description: 'The ultimate high-performance browser gaming platform.',
    start_url: '/',
    display: 'standalone',
    background_color: '#050505',
    theme_color: '#00f3ff',
    icons: [
      {
        src: iconUrl,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: iconUrl,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: icon512Url,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: icon512Url,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    orientation: 'portrait-primary',
    categories: ['games', 'entertainment'],
  };
}
