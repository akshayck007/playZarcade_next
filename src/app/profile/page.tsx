'use client';

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User, Mail, Calendar, History, Heart, Gamepad2, LogOut, Download } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { RecentlyPlayed, Favorites } from '@/components/RecentlyPlayed';

export default function ProfilePage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);
      setLoading(false);
    };

    getSession();
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-24">
      {/* Hero Header */}
      <div className="relative h-64 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-cyan/20 to-[#050505]" />
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/arcade/1920/1080')] bg-cover bg-center opacity-20 grayscale" />
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Profile Card */}
          <div className="w-full md:w-80 shrink-0 space-y-6">
            <div className="glass p-8 rounded-3xl border border-white/10 space-y-6 text-center">
              <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-neon-cyan shadow-[0_0_30px_rgba(0,243,255,0.3)]">
                {user.user_metadata?.avatar_url ? (
                  <Image 
                    src={user.user_metadata.avatar_url} 
                    alt="Profile" 
                    fill 
                    className="object-cover"
                    referrerPolicy="no-referrer"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center">
                    <User className="w-16 h-16 text-neon-cyan" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h1 className="text-xl font-black uppercase tracking-tight truncate">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </h1>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center justify-center gap-2">
                  <Mail className="w-3 h-3" />
                  {user.email}
                </p>
              </div>

              <div className="pt-6 border-t border-white/5 flex flex-col gap-3">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/20">
                  <span>Joined</span>
                  <span className="text-white">{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="w-full py-3 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Terminate Session
                </button>
              </div>
            </div>

            {/* Stats Card */}
            <div className="glass p-8 rounded-3xl border border-white/10 grid grid-cols-2 gap-4">
              <div className="text-center space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Level</p>
                <p className="text-2xl font-black text-neon-cyan">12</p>
              </div>
              <div className="text-center space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">XP</p>
                <p className="text-2xl font-black text-neon-magenta">2.4K</p>
              </div>
            </div>

            {/* PWA Card */}
            <div className="glass p-8 rounded-3xl border border-neon-cyan/20 space-y-4 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-transparent" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-neon-cyan/10 rounded-lg flex items-center justify-center">
                    <Download className="w-4 h-4 text-neon-cyan" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">App Protocol</span>
                </div>
                <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
                  Install PlayZ Arcade on your device for a native gaming experience.
                </p>
                <button 
                  onClick={() => {
                    const event = new Event('beforeinstallprompt');
                    window.dispatchEvent(event);
                  }}
                  className="w-full py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-neon-cyan transition-all"
                >
                  Download App
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 w-full space-y-16">
            <div className="space-y-12">
              <Favorites />
              <RecentlyPlayed />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
