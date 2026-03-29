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
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    "contentBody" TEXT,
    "categoryId" UUID REFERENCES public."Category"(id) ON DELETE SET NULL,
    "trendScore" INTEGER DEFAULT 0,
    "playCount" INTEGER DEFAULT 0,
    thumbnail TEXT,
    "thumbnailUrl" TEXT, -- Some parts of the app use thumbnail, some thumbnailUrl
    "iframeUrl" TEXT,
    "isRetro" BOOLEAN DEFAULT false,
    "console" TEXT,
    "romUrl" TEXT,
    "isPublished" BOOLEAN DEFAULT true,
    "isFeatured" BOOLEAN DEFAULT false,
    controls JSONB DEFAULT '{}'::jsonb,
    faq JSONB DEFAULT '[]'::jsonb,
    "qualityScore" FLOAT DEFAULT 0,
    tags TEXT[] DEFAULT '{}'::text[],
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Settings Table
CREATE TABLE IF NOT EXISTS public."Settings" (
    id TEXT PRIMARY KEY, -- usually 'global'
    "siteName" TEXT DEFAULT 'PlayZ Arcade',
    "defaultTheme" TEXT DEFAULT 'dark',
    "theme" TEXT DEFAULT 'dark',
    "retroEnabled" BOOLEAN DEFAULT true,
    "trendingMode" TEXT DEFAULT 'trending',
    "featuredMode" TEXT DEFAULT 'manual',
    "autoBoostTrending" BOOLEAN DEFAULT true,
    "autoCreateShadowGames" BOOLEAN DEFAULT false,
    "maintenanceMode" BOOLEAN DEFAULT false,
    "publicRegistration" BOOLEAN DEFAULT true,
    "adsenseId" TEXT,
    "adsTxt" TEXT,
    "googleVerification" TEXT,
    "faviconUrl" TEXT,
    "logoUrl" TEXT,
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
    "gameId" TEXT REFERENCES public."Game"(id) ON DELETE CASCADE,
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
    "gameId" TEXT REFERENCES public."Game"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE("userId", "gameId")
);

-- 8. User History Table (Cloud Sync)
CREATE TABLE IF NOT EXISTS public."UserHistory" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "userId" UUID NOT NULL, -- References auth.users(id)
    "gameId" TEXT REFERENCES public."Game"(id) ON DELETE CASCADE,
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
    "shadowType" TEXT DEFAULT 'game', -- game, article
    "relevantGameIds" UUID[] DEFAULT '{}'::UUID[]
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

-- 11. SEO Pages Table
CREATE TABLE IF NOT EXISTS public."SeoPage" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    "gameId" TEXT REFERENCES public."Game"(id) ON DELETE CASCADE,
    modifier TEXT,
    "customTitle" TEXT,
    "customDescription" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public."SeoPage" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on SeoPage" ON public."SeoPage" FOR SELECT USING (true);
CREATE POLICY "Allow all access for anon on SeoPage" ON public."SeoPage" FOR ALL USING (true) WITH CHECK (true);

-- 12. Storage Setup (Run these manually in Supabase SQL Editor)
-- Note: storage.buckets and storage.objects are in the 'storage' schema

-- Create the roms bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('roms', 'roms', true)
ON CONFLICT (id) DO NOTHING;

-- Create the assets bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for 'roms' bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'roms');
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'roms');
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (bucket_id = 'roms');
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'roms');

-- Storage Policies for 'assets' bucket
CREATE POLICY "Public Access Assets" ON storage.objects FOR SELECT USING (bucket_id = 'assets');
CREATE POLICY "Public Upload Assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'assets');
CREATE POLICY "Public Update Assets" ON storage.objects FOR UPDATE USING (bucket_id = 'assets');
CREATE POLICY "Public Delete Assets" ON storage.objects FOR DELETE USING (bucket_id = 'assets');

-- 13. Profiles Table
CREATE TABLE IF NOT EXISTS public."Profile" (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    "fullName" TEXT,
    "avatarUrl" TEXT,
    role TEXT DEFAULT 'user',
    "xp" INTEGER DEFAULT 0,
    "level" INTEGER DEFAULT 1,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public."Profile" ENABLE ROW LEVEL SECURITY;

-- Policies for Profile
CREATE POLICY "Anyone can view profiles" ON public."Profile" FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public."Profile" FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow all access for anon on Profile" ON public."Profile" FOR ALL USING (true) WITH CHECK (true);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $
BEGIN
  INSERT INTO public."Profile" (id, email, "fullName", "avatarUrl")
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 14. Comments Table
CREATE TABLE IF NOT EXISTS public."Comment" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "gameId" TEXT NOT NULL REFERENCES public."Game"(id) ON DELETE CASCADE,
    "userId" UUID NOT NULL REFERENCES public."Profile"(id) ON DELETE CASCADE,
    "parentId" UUID REFERENCES public."Comment"(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    "isLovedByAdmin" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. Comment Interactions Table (Likes/Dislikes)
CREATE TABLE IF NOT EXISTS public."CommentInteraction" (
    "commentId" UUID NOT NULL REFERENCES public."Comment"(id) ON DELETE CASCADE,
    "userId" UUID NOT NULL REFERENCES public."Profile"(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('like', 'dislike')),
    PRIMARY KEY ("commentId", "userId")
);

-- Enable RLS
ALTER TABLE public."Comment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CommentInteraction" ENABLE ROW LEVEL SECURITY;

-- Policies for Comments
CREATE POLICY "Anyone can view comments" ON public."Comment" FOR SELECT USING (true);
CREATE POLICY "Authenticated users can post comments" ON public."Comment" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own comments" ON public."Comment" FOR UPDATE USING (auth.uid() = "userId");
CREATE POLICY "Users can delete their own comments" ON public."Comment" FOR DELETE USING (auth.uid() = "userId");
CREATE POLICY "Allow all access for anon on Comment" ON public."Comment" FOR ALL USING (true) WITH CHECK (true);

-- Policies for Interactions
CREATE POLICY "Anyone can view interactions" ON public."CommentInteraction" FOR SELECT USING (true);
CREATE POLICY "Authenticated users can interact" ON public."CommentInteraction" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all access for anon on CommentInteraction" ON public."CommentInteraction" FOR ALL USING (true) WITH CHECK (true);
