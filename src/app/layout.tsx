import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { GoogleAnalytics } from '@next/third-parties/google';
import { ThemeProvider } from "@/components/ThemeProvider";
import { SyncManager } from "@/components/SyncManager";
import { PwaHandler } from "@/components/PwaHandler";
import Script from 'next/script';

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.APP_URL?.replace(/\/$/, '') || 'https://playzarcade.com';
  
  const { data: settings } = await supabase
    .from("Settings")
    .select("*")
    .eq("id", "global")
    .maybeSingle();

  const title = "PlayZ Arcade | Best Free Browser Games Online - No Downloads Required";
  const description = "Play thousands of free browser games instantly on PlayZ Arcade. From action-packed shooters to brain-teasing puzzles, we offer the best high-performance gaming with no downloads. Stay updated with our latest intel reports and trending gaming themes.";
  const ogImage = `${baseUrl}/icon-512.png`;

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    manifest: "/manifest.json",
    alternates: {
      canonical: "/",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title,
      description,
      url: baseUrl,
      siteName: "PlayZ Arcade",
      images: [
        {
          url: ogImage,
          width: 512,
          height: 512,
          alt: "PlayZ Arcade Logo",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      site: "@playzarcade",
      creator: "@playzarcade",
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "PlayZ Arcade",
    },
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/favicon.png", type: "image/png" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      ],
      apple: [
        { url: "/icon-192.png" },
        { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
    },
    verification: {
      google: settings?.googleVerification,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#050505",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Parallelize queries for better performance
  const [categoriesResult, settingsResult] = await Promise.all([
    supabase
      .from("Category")
      .select("*")
      .order("name", { ascending: true }),
    supabase
      .from("Settings")
      .select("*")
      .eq("id", "global")
      .maybeSingle()
  ]);

  const categories = categoriesResult.data || [];
  const settings = settingsResult.data;

  const baseUrl = process.env.APP_URL?.replace(/\/$/, '') || 'https://playzarcade.com';

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "PlayZ Arcade",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PlayZ Arcade",
    "url": baseUrl,
    "logo": `${baseUrl}/icon-512.png`,
    "sameAs": [
      "https://twitter.com/playzarcade",
      "https://facebook.com/playzarcade",
      "https://instagram.com/playzarcade",
      "https://linkedin.com/company/playzarcade",
      "https://youtube.com/playzarcade"
    ]
  };

  return (
    <html lang="en" className={cn(inter.variable, jetbrainsMono.variable)}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="min-h-screen bg-background">
        {settings?.adsenseId && (
          <Script 
            async 
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.adsenseId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <Script id="global-click-logger" strategy="afterInteractive">
          {`
            window.addEventListener('click', (e) => {
              console.log('GLOBAL CLICK:', e.target);
            }, true);
          `}
        </Script>
        
        <ThemeProvider>
          <SyncManager />
          <PwaHandler />
          <Navbar categories={categories} />

          <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
            {children}
          </main>

          <footer className="border-t border-white/5 px-6 py-12 mt-20 bg-dark-surface/50 backdrop-blur-md relative z-10">
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-sm font-bold uppercase mb-4">Platform</h3>
                <ul className="space-y-2 text-sm text-foreground/50">
                  <li><Link href="/about" className="hover:text-neon-cyan transition-colors">About Us</Link></li>
                  <li><Link href="/blog" className="hover:text-neon-magenta transition-colors">Blog</Link></li>
                  <li><Link href="/contact" className="hover:text-neon-cyan transition-colors">Contact</Link></li>
                  <li><Link href="/sitemap.xml" className="hover:text-neon-lime transition-colors">Sitemap</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase mb-4">Legal</h3>
                <ul className="space-y-2 text-sm text-foreground/50">
                  <li><Link href="/privacy-policy" className="hover:text-neon-cyan transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms-of-service" className="hover:text-neon-lime transition-colors">Terms of Service</Link></li>
                  <li><Link href="/cookie-policy" className="hover:text-neon-magenta transition-colors">Cookie Policy</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase mb-4">Trending</h3>
                <ul className="space-y-2 text-sm text-foreground/50">
                  <li><Link href="/game/slope-unblocked" className="hover:text-neon-cyan transition-colors">Slope Unblocked</Link></li>
                  <li><Link href="/game/monkey-mart" className="hover:text-neon-magenta transition-colors">Monkey Mart</Link></li>
                  <li><Link href="/game/subway-surfers" className="hover:text-neon-lime transition-colors">Subway Surfers</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase mb-4">Connect</h3>
                <div className="flex flex-wrap gap-4">
                  <a href="https://twitter.com/playzarcade" target="_blank" rel="noopener noreferrer" className="w-8 h-8 glass rounded-full flex items-center justify-center hover:bg-neon-cyan hover:text-black transition-all">
                    <span className="sr-only">X (Twitter)</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a href="https://facebook.com/playzarcade" target="_blank" rel="noopener noreferrer" className="w-8 h-8 glass rounded-full flex items-center justify-center hover:bg-neon-magenta hover:text-black transition-all">
                    <span className="sr-only">Facebook</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                  <a href="https://instagram.com/playzarcade" target="_blank" rel="noopener noreferrer" className="w-8 h-8 glass rounded-full flex items-center justify-center hover:bg-neon-lime hover:text-black transition-all">
                    <span className="sr-only">Instagram</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                  <a href="https://linkedin.com/company/playzarcade" target="_blank" rel="noopener noreferrer" className="w-8 h-8 glass rounded-full flex items-center justify-center hover:bg-neon-cyan hover:text-black transition-all">
                    <span className="sr-only">LinkedIn</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  </a>
                  <a href="https://youtube.com/playzarcade" target="_blank" rel="noopener noreferrer" className="w-8 h-8 glass rounded-full flex items-center justify-center hover:bg-neon-magenta hover:text-black transition-all">
                    <span className="sr-only">YouTube</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                </div>
              </div>
            </div>
            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 text-xs text-foreground/30 text-center">
              &copy; {new Date().getFullYear()} PlayZ Arcade. All rights reserved.
            </div>
          </footer>
        </ThemeProvider>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
        
        {/* Facebook Pixel Placeholder */}
        <Script id="fb-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID || "YOUR_PIXEL_ID"}');
            fbq('track', 'PageView');
          `}
        </Script>
      </body>
    </html>
  );
}
