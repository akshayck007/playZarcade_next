import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed Settings
  await prisma.settings.upsert({
    where: { id: "global" },
    update: {
      siteName: "PlayZ Arcade",
    },
    create: {
      id: "global",
      siteName: "PlayZ Arcade",
      defaultTheme: "dark",
    },
  });

  // Seed Default Categories
  const categories = [
    { name: "Action", slug: "action-games" },
    { name: "Puzzle", slug: "puzzle-games" },
    { name: "Racing", slug: "racing-games" },
    { name: "Multiplayer", slug: "multiplayer-games" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug },
    });
  }

  // Seed Default Sections
  const sections = [
    { name: "Trending Now", slug: "trending-now", order: 1 },
    { name: "New Releases", slug: "new-releases", order: 2 },
    { name: "Editor's Choice", slug: "editors-choice", order: 3 },
  ];

  for (const section of sections) {
    await prisma.section.upsert({
      where: { slug: section.slug },
      update: { name: section.name, order: section.order },
      create: { name: section.name, slug: section.slug, order: section.order },
    });
  }

  // Seed a sample game
  const puzzleCat = await prisma.category.findUnique({ where: { slug: "puzzle-games" } });
  const actionCat = await prisma.category.findUnique({ where: { slug: "action-games" } });
  
  if (puzzleCat) {
    await prisma.game.upsert({
      where: { slug: "2048" },
      update: {},
      create: {
        title: "2048",
        slug: "2048",
        description: "A classic puzzle game where you slide numbered tiles on a grid to combine them and create a tile with the number 2048.",
        categoryId: puzzleCat.id,
        trendScore: 150,
        thumbnail: "https://picsum.photos/seed/2048/800/600",
        iframeUrl: "https://gamepix.com/play/2048",
        isPublished: true,
        isFeatured: true,
      },
    });
  }

  if (actionCat) {
    await prisma.game.upsert({
      where: { slug: "slope" },
      update: {},
      create: {
        title: "Slope",
        slug: "slope",
        description: "Experience the most addictive browser game of the year. Navigate the neon slopes and beat the high score.",
        categoryId: actionCat.id,
        trendScore: 500,
        playCount: 12500,
        thumbnail: "https://picsum.photos/seed/slope/800/600",
        iframeUrl: "https://gamepix.com/play/slope",
        isPublished: true,
        isFeatured: true,
        controls: {
          "left/right": "Move",
          "space": "Pause"
        },
        faq: [
          { "q": "How do I play Slope?", "a": "Use the arrow keys or A/D to steer your ball down the slope." },
          { "q": "Is Slope free?", "a": "Yes, Slope is completely free to play on PlayZ Arcade." }
        ]
      },
    });

    await prisma.game.upsert({
      where: { slug: "tunnel-rush" },
      update: {},
      create: {
        title: "Tunnel Rush",
        slug: "tunnel-rush",
        description: "Fast-paced 3D runner game. Dodge obstacles in a neon tunnel.",
        categoryId: actionCat.id,
        trendScore: 300,
        playCount: 8500,
        thumbnail: "https://picsum.photos/seed/tunnel/800/600",
        iframeUrl: "https://gamepix.com/play/tunnel-rush",
        isPublished: true,
        isFeatured: false,
      },
    });
  }

  console.log("Seeded database");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
