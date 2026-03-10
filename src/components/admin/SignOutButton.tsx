'use client';

import { supabase } from "@/lib/supabase";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-bold text-white/40 hover:text-red-500 hover:bg-red-500/5 transition-all group"
    >
      <LogOut className="w-5 h-5 group-hover:text-red-500 transition-colors" />
      Sign Out
    </button>
  );
}
