import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Newspaper, ArrowRight, Calendar, Tag } from 'lucide-react';
import { format } from 'date-fns';

export async function BlogSection() {
  const { data: posts } = await supabase
    .from('BlogPost')
    .select('*')
    .order('publishedAt', { ascending: false })
    .limit(3);

  if (!posts || posts.length === 0) return null;

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-neon-cyan/10 rounded-xl flex items-center justify-center border border-neon-cyan/20">
            <Newspaper className="w-5 h-5 text-neon-cyan" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight cyber-text-glow">Latest Intel</h2>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Trending News & Game Insights</p>
          </div>
        </div>
        <Link 
          href="/blog" 
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-neon-cyan transition-colors"
        >
          View All Reports
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link 
            key={post.id} 
            href={`/blog/${post.slug}`}
            className="group glass border border-white/5 hover:border-neon-cyan/30 rounded-2xl overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(0,243,255,0.1)]"
          >
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={post.coverImage || 'https://picsum.photos/seed/gaming/800/450'}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {post.tags?.[0] && (
                <div className="absolute top-4 left-4 px-3 py-1 bg-neon-cyan/20 backdrop-blur-md border border-neon-cyan/30 rounded-full text-[8px] font-black uppercase tracking-widest text-neon-cyan">
                  {post.tags[0]}
                </div>
              )}
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-neon-cyan" />
                  {format(new Date(post.publishedAt), 'MMM dd, yyyy')}
                </div>
              </div>

              <h3 className="text-lg font-black uppercase tracking-tight group-hover:text-neon-cyan transition-colors line-clamp-2 leading-tight">
                {post.title}
              </h3>

              <p className="text-xs text-white/50 line-clamp-2 font-mono leading-relaxed">
                {post.excerpt}
              </p>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity">
                  Read Full Report
                </span>
                <ArrowRight className="w-4 h-4 text-neon-cyan transform -translate-x-4 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
