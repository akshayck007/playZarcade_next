import prisma from "@/lib/prisma";
import { Gamepad2, Users, Play, TrendingUp, ArrowUpRight, ArrowDownRight, Search } from "lucide-react";
import Link from "next/link";
import { AdminHeaderActions } from "@/components/admin/AdminHeaderActions";

export default async function AdminDashboard() {
  const stats = [
    { label: "Total Games", value: await prisma.game.count(), icon: Gamepad2, trend: "+12%", isPositive: true },
    { label: "Total Users", value: await prisma.user.count(), icon: Users, trend: "+5%", isPositive: true },
    { label: "Daily Plays", value: "124,502", icon: Play, trend: "-2%", isPositive: false },
    { label: "Trend Score", value: "84.2", icon: TrendingUp, trend: "+18%", isPositive: true },
  ];

  const recentGames = await prisma.game.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { category: true }
  });

  const topGames = await prisma.game.findMany({
    take: 5,
    orderBy: { playCount: 'desc' },
    include: { category: true }
  });

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black uppercase tracking-tighter">Admin Dashboard</h1>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Platform Overview & Growth Metrics</p>
        </div>
        <AdminHeaderActions />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="glass p-8 rounded-3xl space-y-4 border border-white/5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-emerald-500" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-black uppercase tracking-widest ${stat.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                {stat.trend}
                {stat.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{stat.label}</span>
              <h3 className="text-3xl font-black tracking-tighter">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Games */}
        <div className="glass rounded-3xl overflow-hidden border border-white/5">
          <div className="p-8 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-xl font-black uppercase tracking-tight">Recently Added</h2>
            <Link href="/admin/games" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-emerald-500 transition-colors">View All</Link>
          </div>
          <div className="divide-y divide-white/5">
            {recentGames.map((game) => (
              <div key={game.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 relative">
                    <img src={game.thumbnail} alt="" className="object-cover w-full h-full" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold group-hover:text-emerald-500 transition-colors">{game.title}</span>
                    <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">{game.category?.name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-bold">{new Date(game.createdAt).toLocaleDateString()}</span>
                  <span className="block text-[10px] text-white/30 uppercase tracking-widest">Added Date</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing */}
        <div className="glass rounded-3xl overflow-hidden border border-white/5">
          <div className="p-8 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-xl font-black uppercase tracking-tight">Top Performing</h2>
            <Link href="/admin/analytics" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-emerald-500 transition-colors">Analytics</Link>
          </div>
          <div className="divide-y divide-white/5">
            {topGames.map((game) => (
              <div key={game.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 relative">
                    <img src={game.thumbnail} alt="" className="object-cover w-full h-full" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold group-hover:text-emerald-500 transition-colors">{game.title}</span>
                    <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">{game.category?.name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-bold text-emerald-500">{game.playCount.toLocaleString()}</span>
                  <span className="block text-[10px] text-white/30 uppercase tracking-widest">Plays</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
