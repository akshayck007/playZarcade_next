import React from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Markdown from '@/components/Markdown';
import { Calendar, Tag, ChevronLeft, Share2, Clock, Gamepad2 } from 'lucide-react';

export const runtime = "edge";
export const dynamic = 'force-dynamic';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createServerComponentClient({ cookies });
  
  const { data: post, error } = await supabase
    .from('BlogPost')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !post) {
    notFound();
  }

  // Fetch some related games for the sidebar/bottom
  const { data: relatedGames } = await supabase
    .from('Game')
    .select('*, Category(name, slug)')
    .limit(4);

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-24 font-sans selection:bg-emerald-500 selection:text-black">
      {/* Immersive Hero Section */}
      <div className="relative w-full h-[80vh] overflow-hidden">
        <Image 
          src={post.coverImage || `https://picsum.photos/seed/${post.slug}/1920/1080`}
          alt={post.title}
          fill
          className="object-cover scale-105 animate-slow-zoom"
          priority
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-[#050505]" />
        
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="max-w-5xl mx-auto w-full text-center space-y-12">
            <div className="flex items-center justify-center gap-4">
              <div className="h-[1px] w-8 bg-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Latest News</span>
              <div className="h-[1px] w-8 bg-emerald-500" />
            </div>
            
            <h1 className="text-5xl md:text-[8vw] font-black uppercase tracking-tighter italic leading-[0.9] cyber-text-glow">
              {post.title}
            </h1>
            
            <div className="flex items-center justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-white/40">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" />
                {new Date(post.publishedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" />
                6 MIN READ
              </span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-[1px] h-12 bg-gradient-to-b from-emerald-500 to-transparent" />
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-20 mt-24">
        {/* Main Content */}
        <main className="lg:col-span-8 space-y-16">
          <div className="relative">
            <div className="absolute -left-8 top-0 bottom-0 w-[1px] bg-white/5 hidden md:block" />
            <div className="prose prose-invert prose-emerald max-w-none 
              prose-h2:text-3xl prose-h2:font-black prose-h2:uppercase prose-h2:tracking-tight prose-h2:italic
              prose-p:text-white/70 prose-p:leading-relaxed prose-p:text-lg prose-p:font-mono
              prose-strong:text-emerald-500 prose-strong:font-black
              prose-li:text-white/60 prose-li:font-mono
              prose-blockquote:border-emerald-500 prose-blockquote:bg-emerald-500/5 prose-blockquote:py-2 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl
            ">
              <Markdown content={post.content} />
            </div>
          </div>
          
          {/* Tags & Share */}
          <div className="pt-12 border-t border-white/5 space-y-8">
            <div className="flex flex-wrap gap-2">
              {post.tags?.map((tag: string) => (
                <span key={tag} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:border-emerald-500/50 hover:text-emerald-500 transition-all cursor-default">
                  #{tag}
                </span>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <Link 
                href="/blog" 
                className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-emerald-500"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to News
              </Link>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Broadcast</span>
                <button className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-16">
          {/* Related Games - Recipe 3 Inspired */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
                <Gamepad2 className="w-4 h-4 text-emerald-500" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest">Recommended Games</h3>
            </div>
            
            <div className="space-y-4">
              {relatedGames?.map((game: any) => (
                <Link 
                  key={game.id} 
                  href={`/game/${game.slug}`}
                  className="group flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-all"
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden grayscale group-hover:grayscale-0 transition-all bg-white/5">
                    <Image 
                      src={game.thumbnail || game.thumbnailUrl || `https://picsum.photos/seed/${game.slug}/200/200`} 
                      alt={game.title} 
                      fill 
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black uppercase tracking-tight truncate group-hover:text-emerald-500 transition-colors">{game.title}</h4>
                    <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">{game.Category?.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter - Recipe 5 Inspired */}
          <div className="p-8 bg-emerald-500 space-y-6 transform skew-x-[-2deg]">
            <div className="transform skew-x-[2deg] space-y-6">
              <h3 className="text-2xl font-black uppercase tracking-tighter text-black leading-none">
                Stay <br /> Updated
              </h3>
              <p className="text-xs text-black/70 font-bold uppercase tracking-tight leading-relaxed">
                Get the latest gaming news and updates delivered to your inbox daily.
              </p>
              <div className="space-y-2">
                <input 
                  type="email" 
                  placeholder="YOUR@EMAIL.COM" 
                  className="w-full bg-black/10 border border-black/20 rounded-none px-4 py-4 text-[10px] font-black placeholder:text-black/30 focus:outline-none focus:bg-black/20 transition-all text-black"
                />
                <button className="w-full py-4 bg-black text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black/90 transition-all">
                  Subscribe Now
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
