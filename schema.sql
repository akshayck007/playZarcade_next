-- SQL Schema for PlayZ Arcade
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS public."Category" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Games Table
CREATE TABLE IF NOT EXISTS public."Game" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    "categoryId" UUID REFERENCES public."Category"(id) ON DELETE SET NULL,
    "trendScore" INTEGER DEFAULT 0,
    "playCount" INTEGER DEFAULT 0,
    thumbnail TEXT,
    "thumbnailUrl" TEXT, -- Some parts of the app use thumbnail, some thumbnailUrl
    "iframeUrl" TEXT,
    "isPublished" BOOLEAN DEFAULT true,
    "isFeatured" BOOLEAN DEFAULT false,
    controls JSONB DEFAULT '{}'::jsonb,
    faq JSONB DEFAULT '[]'::jsonb,
    "qualityScore" FLOAT DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Settings Table
CREATE TABLE IF NOT EXISTS public."Settings" (
    id TEXT PRIMARY KEY, -- usually 'global'
    "siteName" TEXT DEFAULT 'PlayZ Arcade',
    "defaultTheme" TEXT DEFAULT 'dark',
    "trendingMode" TEXT DEFAULT 'trending',
    "autoBoostTrending" BOOLEAN DEFAULT true,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Sections Table (for home page organization)
CREATE TABLE IF NOT EXISTS public."Section" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    "order" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Section Items Table (mapping games to sections)
CREATE TABLE IF NOT EXISTS public."SectionItem" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "sectionId" UUID REFERENCES public."Section"(id) ON DELETE CASCADE,
    "gameId" UUID REFERENCES public."Game"(id) ON DELETE CASCADE,
    "order" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Blog Posts Table
CREATE TABLE IF NOT EXISTS public."BlogPost" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}'::text[],
    "coverImage" TEXT,
    "publishedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public."Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Game" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Section" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SectionItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."BlogPost" ENABLE ROW LEVEL SECURITY;

-- Create Policies (Allow public read access)
CREATE POLICY "Allow public read access on Category" ON public."Category" FOR SELECT USING (true);
CREATE POLICY "Allow public read access on Game" ON public."Game" FOR SELECT USING (true);
CREATE POLICY "Allow public read access on Settings" ON public."Settings" FOR SELECT USING (true);
CREATE POLICY "Allow public read access on Section" ON public."Section" FOR SELECT USING (true);
CREATE POLICY "Allow public read access on SectionItem" ON public."SectionItem" FOR SELECT USING (true);
CREATE POLICY "Allow public read access on BlogPost" ON public."BlogPost" FOR SELECT USING (true);

-- Allow all access for service role / admin (Supabase handles this by default for service_role, 
-- but if you use the anon key for dev-admin, you might need these during development)
-- WARNING: In production, you should restrict these to authenticated admins only.
CREATE POLICY "Allow all access for anon on Category" ON public."Category" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for anon on Game" ON public."Game" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for anon on Settings" ON public."Settings" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for anon on Section" ON public."Section" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for anon on SectionItem" ON public."SectionItem" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for anon on BlogPost" ON public."BlogPost" FOR ALL USING (true) WITH CHECK (true);

-- 7. User Favorites Table
CREATE TABLE IF NOT EXISTS public."UserFavorite" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "userId" UUID NOT NULL, -- References auth.users(id)
    "gameId" UUID REFERENCES public."Game"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE("userId", "gameId")
);

-- 8. User History Table (Cloud Sync)
CREATE TABLE IF NOT EXISTS public."UserHistory" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "userId" UUID NOT NULL, -- References auth.users(id)
    "gameId" UUID REFERENCES public."Game"(id) ON DELETE CASCADE,
    "lastPlayedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE("userId", "gameId")
);

-- 9. Trending Keywords Table
CREATE TABLE IF NOT EXISTS public."TrendingKeyword" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    keyword TEXT NOT NULL UNIQUE,
    "searchVolume" INTEGER DEFAULT 0,
    status TEXT DEFAULT 'detected', -- detected, shadow_page_live, archived
    type TEXT DEFAULT 'top', -- top, rising
    source TEXT DEFAULT 'Google Trends',
    "unifiedScore" INTEGER DEFAULT 0,
    "lastUpdated" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "shadowTitle" TEXT,
    "shadowContent" TEXT,
    "shadowSlug" TEXT,
    "shadowSeoDescription" TEXT,
    "shadowIframeUrl" TEXT,
    "shadowThumbnailUrl" TEXT,
    "shadowType" TEXT DEFAULT 'game' -- game, article
);

-- Enable RLS for new tables
ALTER TABLE public."UserFavorite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."UserHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TrendingKeyword" ENABLE ROW LEVEL SECURITY;

-- Policies for UserFavorite (Owner only)
CREATE POLICY "Users can view their own favorites" ON public."UserFavorite" FOR SELECT USING (auth.uid() = "userId");
CREATE POLICY "Users can insert their own favorites" ON public."UserFavorite" FOR INSERT WITH CHECK (auth.uid() = "userId");
CREATE POLICY "Users can delete their own favorites" ON public."UserFavorite" FOR DELETE USING (auth.uid() = "userId");

-- Policies for UserHistory (Owner only)
CREATE POLICY "Users can view their own history" ON public."UserHistory" FOR SELECT USING (auth.uid() = "userId");
CREATE POLICY "Users can insert their own history" ON public."UserHistory" FOR INSERT WITH CHECK (auth.uid() = "userId");
CREATE POLICY "Users can update their own history" ON public."UserHistory" FOR UPDATE USING (auth.uid() = "userId");
CREATE POLICY "Users can delete their own history" ON public."UserHistory" FOR DELETE USING (auth.uid() = "userId");

-- Policies for TrendingKeyword (Public read, Admin write)
CREATE POLICY "Allow public read access on TrendingKeyword" ON public."TrendingKeyword" FOR SELECT USING (true);
CREATE POLICY "Allow all access for anon on TrendingKeyword" ON public."TrendingKeyword" FOR ALL USING (true) WITH CHECK (true);
