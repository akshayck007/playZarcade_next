'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { UserPlus, ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // For now, we'll just simulate a signup
    setTimeout(() => {
      setIsLoading(false);
      alert("Account created! (Demo mode)");
      router.push('/login');
    }, 1000);
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
          <p className="text-white/40 font-medium">Create an account to track your high scores.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Username</label>
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="gamer123"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-500 text-black py-4 rounded-2xl font-black uppercase tracking-tight flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50"
          >
            {isLoading ? "Creating Account..." : (
              <>
                Sign Up <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

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
