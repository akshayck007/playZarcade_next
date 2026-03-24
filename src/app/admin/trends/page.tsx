import { supabase } from "@/lib/supabase";
import { TrendingUp, Search, Plus } from "lucide-react";
import { TrendMiningConsole } from "@/components/admin/TrendMiningConsole";
import { TrendTable } from "@/components/admin/TrendTable";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function AdminTrendsPage() {
  const { data: trendsRaw } = await supabase
    .from("TrendingKeyword")
    .select("*")
    .order("searchVolume", { ascending: false });

  console.log(`[AdminTrendsPage] Fetched ${trendsRaw?.length || 0} trends from DB.`);
  const trends = trendsRaw || [];
  const totalVolume = trends.reduce((sum, t) => sum + (t.searchVolume || 0), 0);
  const opportunities = trends.filter(t => t.status === 'detected').length;

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
            <h3 className="text-3xl font-black tracking-tighter">
              {totalVolume > 1000000 ? `${(totalVolume / 1000000).toFixed(1)}M+` : totalVolume.toLocaleString()}
            </h3>
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
            <h3 className="text-3xl font-black tracking-tighter">{opportunities} Games</h3>
          </div>
        </div>
      </div>

      {/* Trends Table */}
      <TrendTable initialTrends={trends} />
    </div>
  );
}
