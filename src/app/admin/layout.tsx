import Link from "next/link";
import { LayoutDashboard, Gamepad2, Layers, TrendingUp, Settings, Search, Users, FileText, RefreshCw } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Gamepad2, label: "Games", href: "/admin/games" },
    { icon: RefreshCw, label: "GamePix Sync", href: "/admin/games/sync" },
    { icon: Layers, label: "Categories", href: "/admin/categories" },
    { icon: TrendingUp, label: "Trends", href: "/admin/trends" },
    { icon: FileText, label: "SEO Pages", href: "/admin/seo" },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  return (
    <div className="flex min-h-screen bg-[#050505]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 h-screen overflow-y-auto">
        <div className="p-6">
          <Link href="/" className="text-2xl font-black uppercase tracking-tighter italic text-emerald-500">
            PlayZ <span className="text-white">CMS</span>
          </Link>
        </div>
        
        <nav className="px-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all group"
            >
              <item.icon className="w-5 h-5 group-hover:text-emerald-500 transition-colors" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-black text-black">
              AD
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold">Admin User</span>
              <span className="text-[10px] text-white/40">Super Admin</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        {children}
      </main>
    </div>
  );
}
