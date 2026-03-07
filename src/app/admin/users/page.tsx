import { getPrisma } from "@/lib/prisma";
import { Users, Search, MoreVertical, Shield, Trash2, Mail } from "lucide-react";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const prisma = getPrisma();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black uppercase tracking-tighter">User Management</h1>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Manage {users.length} registered players</p>
        </div>
        <button className="bg-emerald-500 text-black px-8 py-3 rounded-full font-black uppercase tracking-tight hover:bg-emerald-400 transition-colors flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Broadcast Message
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
        <input 
          type="text" 
          placeholder="Search by username or email..." 
          className="w-full glass py-4 pl-16 pr-8 rounded-2xl text-sm font-bold placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
        />
      </div>

      {/* Users Table */}
      <div className="glass rounded-3xl overflow-hidden border border-white/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">User</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Role</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">XP / Level</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Joined</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-black text-emerald-500 border border-white/10">
                      {user.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold group-hover:text-emerald-500 transition-colors">{user.username}</span>
                      <span className="text-[10px] text-white/30 font-mono">{user.email}</span>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-2">
                    {user.isAdmin ? (
                      <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Admin
                      </span>
                    ) : (
                      <span className="bg-white/5 text-white/40 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                        Player
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">{user.xp.toLocaleString()} XP</span>
                    <span className="text-[10px] text-white/30 uppercase tracking-widest">Level {Math.floor(user.xp / 1000) + 1}</span>
                  </div>
                </td>
                <td className="p-6">
                  <span className="text-xs text-white/40">{new Date(user.createdAt).toLocaleDateString()}</span>
                </td>
                <td className="p-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 glass rounded-lg hover:bg-white/10 transition-colors">
                      <MoreVertical className="w-4 h-4 text-white/40" />
                    </button>
                    <button className="p-2 glass rounded-lg hover:bg-red-500/20 transition-colors group/del">
                      <Trash2 className="w-4 h-4 text-white/40 group-hover/del:text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
