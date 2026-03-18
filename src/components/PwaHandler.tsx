'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function PwaHandler() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // 1. Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('[PWA] ServiceWorker registration successful with scope: ', registration.scope);
          },
          (err) => {
            console.log('[PWA] ServiceWorker registration failed: ', err);
          }
        );
      });
    }

    // 2. Handle Install Prompt
    const handleBeforeInstallPrompt = (e: any) => {
      console.log('[PWA] beforeinstallprompt event fired');
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      // Only show if not already installed
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, we can't detect beforeinstallprompt, so we might want to show it manually
    // but only if it's not already in standalone mode
    if (isIOSDevice && !window.matchMedia('(display-mode: standalone)').matches) {
      // Check if we should show it (maybe after a delay or some interaction)
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    console.log('[PWA] handleInstall clicked');
    if (isIOS) {
      alert('To install: Tap the Share button in Safari and then "Add to Home Screen"');
      setShowPrompt(false);
      return;
    }

    if (!deferredPrompt) {
      console.log('[PWA] No deferredPrompt available');
      return;
    }
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-[9999]"
        >
          <div className="glass p-6 rounded-3xl border border-neon-cyan/30 shadow-[0_0_50px_rgba(0,243,255,0.15)] flex items-center gap-6 relative overflow-hidden group pointer-events-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            <div className="w-16 h-16 bg-neon-cyan/10 rounded-2xl flex items-center justify-center shrink-0 border border-neon-cyan/20 relative z-10">
              <Download className="w-8 h-8 text-neon-cyan animate-bounce" />
            </div>

            <div className="flex-1 space-y-1 relative z-10">
              <h3 className="text-sm font-black uppercase tracking-tight text-white">Install PlayZ Arcade</h3>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                {isIOS 
                  ? 'Tap Share → Add to Home Screen for full-screen gaming.'
                  : 'Add to home screen for instant access & full-screen gaming.'}
              </p>
            </div>

            <div className="flex flex-col gap-2 relative z-10">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleInstall();
                }}
                className="bg-neon-cyan text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(0,243,255,0.4)] cursor-pointer active:scale-95"
              >
                {isIOS ? 'How To' : 'Install'}
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPrompt(false);
                }}
                className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors text-center cursor-pointer p-1"
              >
                Later
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
