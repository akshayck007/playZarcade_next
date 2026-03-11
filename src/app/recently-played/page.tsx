import { RecentlyPlayed, Favorites } from "@/components/RecentlyPlayed";
import { History } from "lucide-react";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default function RecentlyPlayedPage() {
  return (
    <div className="space-y-16 py-10">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter flex items-center gap-4 cyber-text-glow text-neon-cyan">
          <History className="w-10 h-10 md:w-16 md:h-16" />
          Recently <span className="text-white">Played</span>
        </h1>
        <p className="text-white/40 font-mono text-sm max-w-2xl">
          [SYSTEM_LOG]: Accessing local session history. Your recently played games and favorites are stored locally in your browser for quick access.
        </p>
      </div>

      <div className="space-y-24">
        <RecentlyPlayed />
        <Favorites />
      </div>
      
      {/* Empty State handled by components themselves, but we can add a fallback if both are empty */}
      <div className="pt-20 border-t border-white/5">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10 text-center">
          End of Session History
        </p>
      </div>
    </div>
  );
}
