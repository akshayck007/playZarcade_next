import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Retro Arcade | Play Classic NES, SNES, GBA Games Online',
  description: 'Play thousands of classic retro games from NES, SNES, Game Boy Advance, Sega Genesis, and more directly in your browser. No downloads, no plugins, just pure nostalgia.',
  openGraph: {
    title: 'Retro Arcade | Play Classic Games Online',
    description: 'The ultimate browser-based retro gaming experience. Pixel-perfect emulation for all your favorite classic consoles.',
    images: ['https://picsum.photos/seed/retro-arcade/1200/630'],
  },
  keywords: ['retro games', 'nes online', 'snes online', 'gba online', 'browser emulator', 'classic games', 'play retro games free'],
};

export default function RetroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
