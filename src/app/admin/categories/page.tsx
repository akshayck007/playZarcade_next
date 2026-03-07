import { getPrisma } from "@/lib/prisma";
import { Plus, Edit, Trash2, Gamepad2, Layers } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const prisma = getPrisma();
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { games: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black uppercase tracking-tighter">Categories</h1>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Organize your games into {categories.length} segments</p>
        </div>
        <button className="bg-emerald-500 text-black px-6 py-3 rounded-full font-black uppercase tracking-tight hover:bg-emerald-400 transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          New Category
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="glass p-8 rounded-3xl space-y-6 border border-white/5 hover:border-emerald-500/30 transition-all group">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                <Layers className="w-6 h-6 text-emerald-500 group-hover:text-black transition-colors" />
              </div>
              <div className="flex gap-2">
                <button className="p-2 glass rounded-lg hover:bg-white/10 transition-colors">
                  <Edit className="w-4 h-4 text-white/40" />
                </button>
                <button className="p-2 glass rounded-lg hover:bg-red-500/20 transition-colors group/del">
                  <Trash2 className="w-4 h-4 text-white/40 group-hover/del:text-red-500" />
                </button>
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-2xl font-black uppercase tracking-tighter">{cat.name}</h3>
              <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest">Slug: {cat.slug}</p>
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold">{cat._count.games} Games</span>
              </div>
              <Link href={`/${cat.slug}`} target="_blank" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-emerald-500 transition-colors">
                View Page
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
