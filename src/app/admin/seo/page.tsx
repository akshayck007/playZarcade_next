import { supabase } from "@/lib/supabase";
import { FileText, Search, ExternalLink, Trash2, Plus, Globe } from "lucide-react";
import Link from "next/link";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function AdminSeoPagesPage() {
  const { data: seoPagesRaw } = await supabase
    .from("SeoPage")
    .select("*, Game(*)")
    .order("createdAt", { ascending: false });

  const seoPages = (seoPagesRaw || []).map(p => ({ ...p, game: p.Game }));

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black uppercase tracking-tighter">SEO Landing Pages</h1>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Manage {seoPages.length} programmatic landing pages</p>
        </div>
        <button className="bg-emerald-500 text-black px-8 py-3 rounded-full font-black uppercase tracking-tight hover:bg-emerald-400 transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Bulk Generate
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-8 rounded-3xl space-y-4 border border-white/5">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-emerald-500" />
            </div>
            <span className="text-xs font-black text-emerald-500 uppercase">Indexing Active</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Total SEO Pages</span>
            <h3 className="text-3xl font-black tracking-tighter">{seoPages.length}</h3>
          </div>
        </div>
        
        <div className="glass p-8 rounded-3xl space-y-4 border border-white/5">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
              <Search className="w-6 h-6 text-white/40" />
            </div>
            <span className="text-xs font-black text-white/40 uppercase">Organic Reach</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Monthly Impressions</span>
            <h3 className="text-3xl font-black tracking-tighter">450k+</h3>
          </div>
        </div>

        <div className="glass p-8 rounded-3xl space-y-4 border border-white/5">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white/40" />
            </div>
            <span className="text-xs font-black text-emerald-500 uppercase">Coverage</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Keyword Variations</span>
            <h3 className="text-3xl font-black tracking-tighter">15 / Game</h3>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
        <input 
          type="text" 
          placeholder="Search by keyword, slug or game title..." 
          className="w-full glass py-4 pl-16 pr-8 rounded-2xl text-sm font-bold placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
        />
      </div>

      {/* SEO Pages Table */}
      <div className="glass rounded-3xl overflow-hidden border border-white/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Page Slug</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Target Game</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Modifier</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Created</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {seoPages.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <FileText className="w-12 h-12 text-white/10" />
                    <p className="text-sm font-bold text-white/20 uppercase tracking-widest">No SEO pages generated yet. Use Bulk Generate to start.</p>
                  </div>
                </td>
              </tr>
            ) : (
              seoPages.map((page) => (
                <tr key={page.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold group-hover:text-emerald-500 transition-colors">{page.slug}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-xs font-bold text-white/60">{page.game.title}</span>
                  </td>
                  <td className="p-6">
                    <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white/60 border border-white/10">
                      {page.modifier}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className="text-xs text-white/40">{new Date(page.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/play/${page.slug}`} target="_blank" className="p-2 glass rounded-lg hover:bg-white/10 transition-colors">
                        <ExternalLink className="w-4 h-4 text-white/40" />
                      </Link>
                      <button className="p-2 glass rounded-lg hover:bg-red-500/20 transition-colors group/del">
                        <Trash2 className="w-4 h-4 text-white/40 group-hover/del:text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
