'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { LogIn, UserPlus, ArrowRight, Chrome, Mail, Lock, Loader2 } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default function LoginPage() {
  const supabase = createClientComponentClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const reason = searchParams.get('reason');
    if (reason === 'no_user') {
      setError("Session expired or not found. Please log in again.");
    } else if (reason === 'not_admin') {
      setError("Access denied. You do not have administrator privileges.");
    }

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/');
      }
    };
    checkUser();
  }, [router, supabase.auth]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
      setIsGoogleLoading(false);
    }
  };

  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const handleMagicLink = async () => {
    if (!email) {
      setError("Please enter your email first");
      return;
    }
    setIsMagicLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      if (error) throw error;
      setMagicSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send magic link");
    } finally {
      setIsMagicLoading(false);
    }
  };

  const isDev = typeof window !== 'undefined' && (window.location.hostname.includes('run.app') || window.location.hostname.includes('localhost'));

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass p-10 rounded-3xl border border-white/10 space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">
            Welcome <span className="text-emerald-500">Back</span>
          </h1>
          <p className="text-white/40 font-medium text-sm">Sign in with Google to save your progress and compete on leaderboards.</p>
        </div>

        {isDev && (
          <div className="p-4 bg-neon-cyan/5 border border-neon-cyan/20 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-neon-cyan">Dev Admin Helper</span>
              <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
            </div>
            <p className="text-[10px] text-white/40 leading-relaxed uppercase font-bold">
              If Google Login fails, ensure this URL is in your Supabase Redirect Allow List:
            </p>
            <code className="block p-2 bg-black/40 rounded text-[9px] font-mono text-neon-cyan break-all">
              {typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : ''}
            </code>
            <button 
              type="button"
              onClick={handleMagicLink}
              disabled={isMagicLoading}
              className="w-full py-2 bg-neon-cyan/10 border border-neon-cyan/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-neon-cyan hover:bg-neon-cyan/20 transition-all flex items-center justify-center gap-2"
            >
              {isMagicLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : magicSent ? "Link Sent!" : "Send Magic Link (Email Login)"}
            </button>
            <Link 
              href="/dev-admin"
              className="block w-full py-2 text-center text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white/40 transition-all"
            >
              Go to Dev Admin Bypass
            </Link>
          </div>
        )}

        <div className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-xs font-bold uppercase tracking-widest text-center">
              {error}
            </div>
          )}

          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
            className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black uppercase tracking-tight flex items-center justify-center gap-3 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 group"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Chrome className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-lg">Continue with Google</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-white/20 uppercase font-black tracking-widest leading-relaxed">
            By signing in, you agree to our <br />
            <Link href="/terms-of-service" className="hover:text-white transition-colors underline">Terms</Link> & <Link href="/privacy-policy" className="hover:text-white transition-colors underline">Privacy Policy</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
