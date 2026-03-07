import { getPrisma } from "@/lib/prisma";
import { GameCard } from "@/components/GameCard";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 300;

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const prisma = getPrisma();

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      games: {
        where: { isPublished: true },
        orderBy: { playCount: 'desc' }
      }
    }
  });

  if (!category) {
    // 1. Check if it's an SEO Shadow Page
    const seoPage = await prisma.seoPage.findUnique({
      where: { slug },
      include: { game: true }
    });

    if (seoPage) {
      redirect(`/game/${seoPage.game.slug}`);
    }

    // 2. Check if it's a trending page or something else
    if (slug === 'trending') {
      const trendingGames = await prisma.game.findMany({
        where: { isPublished: true },
        orderBy: { trendScore: 'desc' },
        take: 50
      });

      return (
        <div className="space-y-12">
          <div className="flex flex-col gap-4">
            <h1 className="text-5xl font-black uppercase tracking-tighter italic">
              Trending <span className="text-emerald-500">Games</span>
            </h1>
            <p className="text-white/40 max-w-2xl font-medium">
              The hottest games on PlayZ Arcade right now. Based on real-time player data and engagement.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {trendingGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      );
    }

    notFound();
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="w-2 h-10 bg-emerald-500 rounded-full"></span>
          <h1 className="text-5xl font-black uppercase tracking-tighter italic">
            {category.name} <span className="text-emerald-500">Games</span>
          </h1>
        </div>
        {category.seoContent && (
          <div className="prose prose-invert max-w-none text-white/50 leading-relaxed" dangerouslySetInnerHTML={{ __html: category.seoContent }} />
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {category.games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>

      {category.games.length === 0 && (
        <div className="h-[400px] glass rounded-3xl flex flex-col items-center justify-center p-12 text-center space-y-4">
          <p className="text-white/20 font-black uppercase tracking-[0.5em] text-xl">No Games Found</p>
          <p className="text-white/40 max-w-md">We are currently adding more games to this category. Check back soon!</p>
          <Link href="/" className="bg-emerald-500 text-black px-8 py-3 rounded-full font-black uppercase tracking-tight hover:bg-emerald-400 transition-colors">
            Back to Home
          </Link>
        </div>
      )}
    </div>
  );
}
