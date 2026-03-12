export interface User {
  id: string;
  email: string;
  username: string;
  xp: number;
  isAdmin: boolean;
  createdAt?: string;
}

export interface Game {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  previewVideo: string;
  category: string;
  trending: boolean;
  isFeatured: boolean;
  qualityScore: number;
  tags: string[];
  iframeUrl: string;
  playCount?: number;
  _count?: { likes: number };
  isLiked?: boolean;
}

export interface Settings {
  id: string;
  siteName: string;
  defaultTheme: string;
  adsTxt?: string;
  featuredMode?: 'manual' | 'quality';
  trendingMode?: 'manual' | 'quality';
}

export interface Section {
  id: string;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
  items?: SectionItem[];
}

export interface SectionItem {
  id: string;
  sectionId: string;
  gameId: string;
  order: number;
  game?: Game;
}

export interface Score {
  id: string;
  value: number;
  userId: string;
  gameId: string;
  createdAt: string;
  user: { username: string; email?: string };
  game: { title: string; slug: string };
}
