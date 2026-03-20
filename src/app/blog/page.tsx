import React from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Tag, ChevronRight, Newspaper } from 'lucide-react';
import type { Metadata } from 'next';

export const runtime = "edge";
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Arcade Chronicles | PlayZ Arcade Blog",
  description: "Latest gaming news, trends, and insights from the world of browser gaming.",
};

export default async function BlogPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: posts, error } = await supabase
    .from('BlogPost')
    .select('*')
    .order('publishedAt', { ascending: false });

  if (error) {
    console.error("Error fetching blog posts:", error);
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-24 px-4 font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-24">
        {/* Editorial Header */}
        <header className="relative">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-500/10 blur-[120px] rounded-full" />
          <div className="relative space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-[1px] w-12 bg-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">The Intelligence Feed</span>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-[12vw] md:text-[10vw] font-black uppercase tracking-tighter leading-[0.85] italic transform -skew-x-6">
                Arcade <br />
                <span className="text-emerald-500 cyber-text-glow">Chronicles</span>
              </h1>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <p className="text-white/40 max-w-md font-mono text-sm leading-relaxed">
                [SYSTEM_LOG]: Mining global trends for high-impact gaming insights. SEO-maximized reports on the future of interactive entertainment.
              </p>
              <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-white/20">
                <div className="flex flex-col gap-1">
                  <span>Frequency</span>
                  <span className="text-white">Daily Updates</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span>Coverage</span>
                  <span className="text-white">Global Trends</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Blog Grid - Recipe 1 Inspired Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5">
          {posts && posts.length > 0 ? (
            posts.map((post: any) => (
              <Link 
                key={post.id} 
                href={`/blog/${post.slug}`}
                className="group relative bg-[#050505] p-8 space-y-8 hover:bg-emerald-500/[0.02] transition-colors duration-500"
              >
                <div className="relative aspect-[16/10] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                  <Image 
                    src={post.coverImage || `https://picsum.photos/seed/${post.slug}/800/500`}
                    alt={post.title}
                    fill
                    className="object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                      {post.tags?.[0] || 'Gaming'}
                    </span>
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                      {new Date(post.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl font-black uppercase tracking-tight leading-[1.1] group-hover:text-emerald-500 transition-colors">
                    {post.title}
                  </h2>
                  
                  <p className="text-xs text-white/40 line-clamp-3 leading-relaxed font-mono">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-8 flex items-center justify-between border-t border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-emerald-500 transition-colors">
                    Access Report
                  </span>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-40 text-center space-y-6 bg-[#050505]">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
                <Newspaper className="w-16 h-16 text-emerald-500 relative" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-black uppercase tracking-widest">No Intelligence Found</p>
                <p className="text-white/20 text-xs font-mono">The trend mining system is currently scanning for new data.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
