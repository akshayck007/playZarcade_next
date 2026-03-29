'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { UserPlus, ArrowRight, Chrome, Mail, Lock, User, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/');
      }
    };
    checkUser();
  }, [router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: username,
          }
        }
      });

      if (error) throw error;
      
      alert("Check your email for the confirmation link!");
      router.push('/login');
    } catch (err: any) {
      setError(err.message || "Failed to create account");
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

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass p-10 rounded-3xl border border-white/10 space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">
            Join the <span className="text-emerald-500">Arcade</span>
          </h1>
          <p className="text-white/40 font-medium text-sm">Create an account with Google to track your high scores and earn XP.</p>
        </div>

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
                <span className="text-lg">Sign up with Google</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-white/20 uppercase font-black tracking-widest leading-relaxed">
            By signing up, you agree to our <br />
            <Link href="/terms-of-service" className="hover:text-white transition-colors underline">Terms</Link> & <Link href="/privacy-policy" className="hover:text-white transition-colors underline">Privacy Policy</Link>
          </p>
        </div>

        <div className="pt-6 border-t border-white/5 text-center">
          <p className="text-sm text-white/40">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-500 font-bold hover:underline">Log in here</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
