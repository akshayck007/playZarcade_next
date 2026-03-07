import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const prisma = getPrisma();
  try {
    const data = await request.json();

    await prisma.settings.upsert({
      where: { id: "global" },
      update: data,
      create: { id: "global", ...data }
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[SETTINGS UPDATE ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
