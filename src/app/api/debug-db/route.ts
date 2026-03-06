import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany();
    const games = await prisma.game.findMany();
    return NextResponse.json({ 
      categoriesCount: categories.length, 
      gamesCount: games.length,
      categories 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
