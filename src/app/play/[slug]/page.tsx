import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { GameCard } from "@/components/GameCard";
import { Play, Shield, Zap, Monitor, Smartphone, Globe } from "lucide-react";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 300;

interface SeoPageProps {
  params: Promise<{ slug: string }>;
}


// SEO Modifiers and their templates
const MODIFIERS: Record<string, { title: string, desc: string, icon: any }> = {
  "unblocked": {
    title: "Unblocked",
    desc: "Play without restrictions. Optimized for school and work networks.",
    icon: Shield
  },
  "online": {
    title: "Online",
    desc: "Instant play in your browser. No downloads or installation required.",
    icon: Globe
  },
  "fullscreen": {
    title: "Fullscreen",
    desc: "Immersive gameplay experience. Play in full window mode with zero lag.",
    icon: Zap
  },
  "mobile": {
    title: "on Mobile",
    desc: "Fully responsive touch controls. Play on iPhone, Android or Tablet.",
    icon: Smartphone
  },
  "pc": {
    title: "on PC",
    desc: "High-performance desktop version. Use keyboard and mouse for precision.",
    icon: Monitor
  }
};

function parseSeoSlug(fullSlug: string) {
  // Pattern: play-{gameSlug}-{modifier}
  // Example: play-slope-unblocked
  const parts = fullSlug.split("-");
  if (parts[0] !== "play") return null;
  
  const modifier = parts[parts.length - 1];
  if (!MODIFIERS[modifier]) return null;

  const gameSlug = parts.slice(1, -1).join("-");
  return { gameSlug, modifier };
}

export async function generateMetadata({ params }: SeoPageProps) {
  const { slug } = await params;
  const parsed = parseSeoSlug(slug);
  if (!parsed) return { title: "Page Not Found" };

  const { data: game } = await supabase
    .from("Game")
    .select("*")
    .eq("slug", parsed.gameSlug)
    .maybeSingle();
  if (!game) return { title: "Game Not Found" };

  const modInfo = MODIFIERS[parsed.modifier];
  return {
    title: `Play ${game.title} ${modInfo.title} | Free Online Game`,
    description: `Experience ${game.title} ${modInfo.title}. ${modInfo.desc} Join ${game.playCount.toLocaleString()} players now.`,
  };
}

export default async function SeoPlayPage({ params }: SeoPageProps) {
  const { slug } = await params;
  const parsed = parseSeoSlug(slug);
  if (!parsed) notFound();

  const { data: game } = await supabase
    .from("Game")
    .select("*, Category(*)")
    .eq("slug", parsed.gameSlug)
    .eq("isPublished", true)
    .maybeSingle();

  if (!game) notFound();

  const modInfo = MODIFIERS[parsed.modifier];
  const Icon = modInfo.icon;

  const { data: relatedGames } = await supabase
    .from("Game")
    .select("*")
    .eq("categoryId", game.categoryId)
    .neq("id", game.id)
    .eq("isPublished", true)
    .order("playCount", { ascending: false })
    .limit(12);

  return (
    <div className="space-y-12">
      {/* Hero / Play Section */}
      <section className="relative h-[500px] rounded-3xl overflow-hidden glass border border-white/10">
        <div className="absolute inset-0 opacity-20">
          <Image 
            src={game.thumbnail} 
            alt="" 
            fill
            className="object-cover blur-xl"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="relative h-full flex flex-col items-center justify-center text-center p-12 space-y-8">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-500 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
            <Icon className="w-3 h-3" />
            {modInfo.title} Mode Active
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl font-black uppercase tracking-tighter">
              Play {game.title} <span className="text-emerald-500">{modInfo.title}</span>
            </h1>
            <p className="text-white/60 max-w-2xl mx-auto text-lg leading-relaxed">
              {modInfo.desc} You are about to play the most popular {game.category?.name} game on PlayZ Arcade.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <Link 
              href={`/game/${game.slug}`} 
              className="bg-white text-black px-12 py-4 rounded-full font-black uppercase tracking-tight text-xl hover:bg-emerald-500 transition-colors flex items-center gap-3"
            >
              <Play className="w-6 h-6 fill-current" />
              Start Game
            </Link>
            <span className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold">No Download Required • Free to Play</span>
          </div>
        </div>
      </section>

      {/* SEO Content Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-12">
          <section className="space-y-6">
            <h2 className="text-3xl font-black uppercase tracking-tighter">Why Play {game.title} {modInfo.title}?</h2>
            <div className="prose prose-invert max-w-none text-white/60 leading-relaxed">
              <p>
                Playing <strong>{game.title}</strong> in <strong>{modInfo.title}</strong> mode offers several advantages for gamers. 
                Our platform ensures that you get the lowest latency and the highest frame rates possible for a browser-based experience.
              </p>
              <p>
                {game.description}
              </p>
              <h3>Key Features of {modInfo.title} Mode:</h3>
              <ul>
                <li>Optimized performance for {parsed.modifier === 'mobile' ? 'touch devices' : 'web browsers'}.</li>
                <li>Zero lag and instant loading times.</li>
                <li>Save your progress and compete on global leaderboards.</li>
                <li>Safe and secure environment for all ages.</li>
              </ul>
            </div>
          </section>

          {/* Related Content / Articles */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tight">Game Guide & Tips</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="glass p-6 rounded-2xl space-y-3">
                <h3 className="font-bold text-emerald-500">How to Win</h3>
                <p className="text-xs text-white/40">Master the controls and learn the patterns. Consistency is key to reaching the top of the leaderboard in {game.title}.</p>
              </div>
              <div className="glass p-6 rounded-2xl space-y-3">
                <h3 className="font-bold text-emerald-500">Secret Shortcuts</h3>
                <p className="text-xs text-white/40">Did you know there are hidden paths in {game.title}? Explore every corner to find ways to beat your friends&apos; scores.</p>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          <div className="glass p-8 rounded-3xl space-y-6 border border-white/5">
            <h3 className="text-sm font-black uppercase tracking-widest text-white/40">Other Modes</h3>
            <div className="flex flex-wrap gap-2">
              {Object.keys(MODIFIERS).filter(m => m !== parsed.modifier).map(m => (
                <Link 
                  key={m} 
                  href={`/play-${game.slug}-${m}`}
                  className="px-4 py-2 bg-white/5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-colors border border-white/10"
                >
                  {m}
                </Link>
              ))}
            </div>
          </div>

          <div className="h-[400px] glass rounded-3xl flex flex-col items-center justify-center p-6 text-center border-dashed border-white/10">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-4">Advertisement</span>
            <div className="w-full h-full bg-white/5 rounded-2xl flex items-center justify-center">
              <span className="text-xs text-white/10 font-bold uppercase">Square Ad Slot</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Related Games */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
            <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
            More {game.Category?.name} Games
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {relatedGames?.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </div>
      </section>
    </div>
  );
}
