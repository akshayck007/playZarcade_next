import Link from "next/link";
import { LayoutDashboard, Gamepad2, Layers, TrendingUp, Settings, Search, Users, FileText, RefreshCw, LogOut, Star, Layout } from "lucide-react";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { isAdmin, checkAdminStatus } from "@/lib/auth";
import Image from "next/image";

export const runtime = "edge";
export const revalidate = 0;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies: () => cookies() });
  
  // Use getUser() for more reliable verification in server components
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    console.log("Admin access denied: No user found or session expired", userError);
    redirect("/login?reason=no_user");
  }

  // Authoritative DB check + fallback to email list
  const isAuthorized = await checkAdminStatus(user.id) || isAdmin(user);

  if (!isAuthorized) {
    console.log(`Admin access denied for: ${user.email}`);
    redirect("/?reason=not_admin&email=" + encodeURIComponent(user.email || 'unknown'));
  }

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Gamepad2, label: "Games", href: "/admin/games" },
    { icon: Star, label: "Featured Order", href: "/admin/sections/featured" },
    { icon: Layout, label: "Home Tabs", href: "/admin/sections" },
    { icon: RefreshCw, label: "GamePix Sync", href: "/admin/games/sync" },
    { icon: Gamepad2, label: "Retro Bulk Import", href: "/admin/retro-import" },
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

        <div className="absolute bottom-0 w-full p-6 border-t border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-black text-black overflow-hidden relative">
              {user.user_metadata?.avatar_url ? (
                <Image 
                  src={user.user_metadata.avatar_url} 
                  alt="Admin" 
                  fill 
                  className="object-cover" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                user.email?.substring(0, 2).toUpperCase()
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold truncate">{user.user_metadata?.full_name || user.email}</span>
              <span className="text-[10px] text-white/40">Super Admin</span>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        {children}
      </main>
    </div>
  );
}
