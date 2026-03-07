import prisma from "@/lib/prisma";
import { TrendingUp, Search, ArrowUpRight, Plus } from "lucide-react";
import { TrendMiningConsole } from "@/components/admin/TrendMiningConsole";
import { GenerateSeoButton } from "@/components/admin/GenerateSeoButton";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function AdminTrendsPage() {
  const trends = await prisma.trendingKeyword.findMany({
    orderBy: { searchVolume: 'desc' }
  });

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black uppercase tracking-tighter">Trend Monitor</h1>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Real-time search trends & Keyword discovery</p>
        </div>
        <TrendMiningConsole />
      </div>

      {/* Trend Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-8 rounded-3xl space-y-4 border border-white/5">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
            <span className="text-xs font-black text-emerald-500 uppercase">+24% Today</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Active Trends</span>
            <h3 className="text-3xl font-black tracking-tighter">{trends.length} Keywords</h3>
          </div>
        </div>
        
        <div className="glass p-8 rounded-3xl space-y-4 border border-white/5">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
              <Search className="w-6 h-6 text-white/40" />
            </div>
            <span className="text-xs font-black text-white/40 uppercase">Global Data</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Total Search Volume</span>
            <h3 className="text-3xl font-black tracking-tighter">1.2M+</h3>
          </div>
        </div>

        <div className="glass p-8 rounded-3xl space-y-4 border border-white/5">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-white/40" />
            </div>
            <span className="text-xs font-black text-emerald-500 uppercase">Ready to Sync</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">New Opportunities</span>
            <h3 className="text-3xl font-black tracking-tighter">12 Games</h3>
          </div>
        </div>
      </div>

      {/* Trends Table */}
      <div className="glass rounded-3xl overflow-hidden border border-white/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Keyword</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Volume</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Status</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Last Updated</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {trends.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <TrendingUp className="w-12 h-12 text-white/10" />
                    <p className="text-sm font-bold text-white/20 uppercase tracking-widest">No trends detected yet. Click refresh to start mining.</p>
                  </div>
                </td>
              </tr>
            ) : (
              trends.map((trend) => (
                <tr key={trend.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold group-hover:text-emerald-500 transition-colors">{trend.keyword}</span>
                      <ArrowUpRight className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-xs font-bold text-white/60">{trend.searchVolume.toLocaleString()}</span>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      trend.status === 'game_live' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                      trend.status === 'content_ready' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                      'bg-white/5 text-white/40 border-white/10'
                    }`}>
                      {trend.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className="text-xs text-white/40">{new Date(trend.lastUpdated).toLocaleDateString()}</span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <GenerateSeoButton 
                        trendId={trend.id} 
                        status={trend.status} 
                        keyword={trend.keyword} 
                      />
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
