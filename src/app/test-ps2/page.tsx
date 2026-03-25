'use client';

import React, { useState } from 'react';
import RetroPlayer from '@/components/RetroPlayer';
import { Navbar } from '@/components/Navbar';
import { Gamepad2, AlertCircle, Info, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function TestPS2Page() {
  const [romUrl, setRomUrl] = useState("https://gta.net.ua/iso/vcs/Grand%20Theft%20Auto%20Vice%20City%20Stories%20(SLES-54622)(R-E).iso");
  const [system, setSystem] = useState("play");
  const [isStarted, setIsStarted] = useState(false);

  const title = "GTA Vice City Stories (PS2 Test)";

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-neon-cyan selection:text-black">
      <Navbar categories={[]} />
      
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <Link href="/retro" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/40 hover:text-neon-cyan transition-colors group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Arcade
              </Link>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic leading-none">
                PS2 <span className="text-neon-cyan">EMULATOR</span> TEST
              </h1>
              <p className="text-white/40 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse"></span>
                EXPERIMENTAL FEATURE: BROWSER-BASED PS2 EMULATION
              </p>
            </div>
          </div>

          {/* Test Controls */}
          <div className="glass p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">ROM URL (ISO/BIN)</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={romUrl}
                    onChange={(e) => setRomUrl(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 transition-all"
                    placeholder="Enter ISO URL..."
                  />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Core / System</label>
                <select 
                  value={system}
                  onChange={(e) => setSystem(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 transition-all appearance-none"
                >
                  <option value="play">PlayStation 2 (Play!)</option>
                  <option value="psx">PlayStation 1 (PCSX ReARMed)</option>
                  <option value="psp">PSP (PPSSPP)</option>
                </select>
              </div>
            </div>

            {!isStarted ? (
              <button 
                onClick={() => setIsStarted(true)}
                className="w-full bg-neon-cyan text-black py-6 rounded-2xl font-black uppercase tracking-tighter text-xl hover:bg-white transition-all shadow-[0_0_30px_rgba(0,243,255,0.3)] flex items-center justify-center gap-3 group"
              >
                <Gamepad2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                Initialize Emulation
              </button>
            ) : (
              <button 
                onClick={() => setIsStarted(false)}
                className="w-full bg-white/5 border border-white/10 text-white/40 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
              >
                Reset Emulator
              </button>
            )}
          </div>

          {/* Player Area */}
          {isStarted && (
            <div className="space-y-6">
              <div className="glass p-4 rounded-[2rem] border border-white/10 shadow-2xl shadow-neon-cyan/5">
                <RetroPlayer 
                  romUrl={romUrl}
                  system={system}
                  title={title}
                />
              </div>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass p-8 rounded-3xl border border-white/10 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 flex items-center justify-center">
                <Info className="w-5 h-5 text-neon-cyan" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight">Performance</h3>
              <p className="text-white/40 text-sm leading-relaxed">
                PS2 emulation in the browser is extremely resource-intensive. High-end hardware and hardware acceleration are required for playable speeds.
              </p>
            </div>

            <div className="glass p-8 rounded-3xl border border-white/10 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-neon-magenta/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-neon-magenta" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight">CORS Policy</h3>
              <p className="text-white/40 text-sm leading-relaxed">
                The source server must allow cross-origin requests. If the game fails to load, the server hosting the ISO likely has CORS restrictions enabled.
              </p>
            </div>

            <div className="glass p-8 rounded-3xl border border-white/10 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <ExternalLink className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight">File Size</h3>
              <p className="text-white/40 text-sm leading-relaxed">
                Large ISO files (1GB+) may take several minutes to download into the browser's memory before the emulator can start.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
