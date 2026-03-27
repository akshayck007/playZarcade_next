import Link from "next/link";
import { LayoutDashboard, Gamepad2, Layers, TrendingUp, Settings, Search, Users, FileText, RefreshCw, LogOut, Star, Layout, Terminal, Sparkles } from "lucide-react";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { isAdmin, checkAdminStatus } from "@/lib/auth";
import Image from "next/image";

export const runtime = "edge";
export const revalidate = 0;

export default async function DevAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies: () => cookies() });
  
  const { data: { user } } = await supabase.auth.getUser();
  
  // Developer Mode: No strict auth gate for /dev-admin
  // This allows the user to access dev tools without mandatory login friction

  const menuItems = [
    { icon: LayoutDashboard, label: "Dev Dashboard", href: "/dev-admin" },
    { icon: Gamepad2, label: "Games", href: "/admin/games" },
    { icon: Layers, label: "Categories", href: "/dev-admin/categories" },
    { icon: Sparkles, label: "Icon Generator", href: "/dev-admin/generate-icon" },
    { icon: TrendingUp, label: "Trends", href: "/admin/trends" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  return (
    <div className="flex min-h-screen bg-[#050505]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 h-screen overflow-y-auto">
        <div className="p-6">
          <Link href="/" className="text-2xl font-black uppercase tracking-tighter italic text-neon-cyan">
            PlayZ <span className="text-white">DEV</span>
          </Link>
        </div>
        
        <nav className="px-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all group"
            >
              <item.icon className="w-5 h-5 group-hover:text-neon-cyan transition-colors" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neon-cyan flex items-center justify-center font-black text-black overflow-hidden relative">
              {user?.user_metadata?.avatar_url ? (
                <Image 
                  src={user.user_metadata.avatar_url} 
                  alt="Admin" 
                  fill 
                  className="object-cover" 
                  referrerPolicy="no-referrer"
                  unoptimized
                />
              ) : (
                user?.email?.substring(0, 2).toUpperCase() || "DV"
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold truncate">{user?.user_metadata?.full_name || user?.email || "Dev User"}</span>
              <span className="text-[10px] text-white/40">Developer Mode</span>
            </div>
          </div>
          {user && <SignOutButton />}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <div className="mb-8 p-4 bg-neon-cyan/10 border border-neon-cyan/20 rounded-2xl flex items-center gap-4">
          <Terminal className="w-5 h-5 text-neon-cyan" />
          <span className="text-[10px] font-black uppercase tracking-widest text-neon-cyan">Developer Environment Active</span>
        </div>
        {children}
      </main>
    </div>
  );
}
