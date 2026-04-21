export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  author: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
  url: string;
  imageUrl?: string;
  category: string;
  relevanceScore?: number;
  bookmarkedAt?: string;
  isBookmarked?: boolean;
  cachedAt?: string;
}

export interface NewsCategory {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface SearchFilters {
  category?: string;
  dateRange?: {
    from: string;
    to: string;
  };
  relevance?: number;
}
