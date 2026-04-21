import React, { useState, useEffect, Component } from "react";
import {
  Clock,
  TrendingUp,
  RefreshCw,
  Wifi,
  WifiOff,
  Bookmark,
  BookmarkCheck,
  Timer,
  AlertCircle,
  ExternalLink,
  BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";
import { Article } from "../types";
import { useRealtimeNews } from "../hooks/useRealtimeNews";
import { useBookmarks } from "../hooks/useBookmarks";
import { ReadingTimeCalculator } from "../utils/readingTime";
import { getDynamicLineClamp } from "../utils/contextAnalyzer";
import { applyThumbnailFallback, getArticleThumbnail } from "../utils/thumbnail";
import { generateContextBrief } from "../utils/contextBrief";
import { debugLog } from "../utils/logger";
import {
  getTrustPresentation
} from "../utils/newsTrust";
import { NewsVerificationService, VerificationResult } from "../services/verificationService";
import { AIService } from "../services/aiService";

class NewsFeedErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('NewsFeed Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'An error occurred while loading the news feed'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const NewsFeed: React.FC = () => {
  const { articles, isConnected, lastUpdate, forceRefresh } = useRealtimeNews();
  const { toggleBookmark, isBookmarked } = useBookmarks();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationById, setVerificationById] = useState<Record<string, VerificationResult>>({});

  const handleBookmarkToggle = (article: any) => {
    toggleBookmark(article);
  };

  const getReadingTime = (article: any) => {
    if (!article) {
      return { minutes: 0, formatted: '0 min' };
    }
    return ReadingTimeCalculator.calculateArticleReadingTime(
      article.title || '',
      article.description || '',
      article.content || ''
    );
  };

  useEffect(() => {
    let isActive = true;

    const verifyFeedArticles = async () => {
      if (articles.length === 0) {
        setVerificationById({});
        return;
      }

      try {
        const sampleArticles = articles.slice(0, 30) as Article[];
        const verificationService = NewsVerificationService.getInstance();
        const results = await verificationService.verifyMultipleArticles(sampleArticles);

        if (!isActive) return;

        const nextMap: Record<string, VerificationResult> = {};
        sampleArticles.forEach((article, index) => {
          const result = results[index];
          if (result) {
            nextMap[article.id] = result;
          }
        });

        setVerificationById(nextMap);
      } catch (verificationError) {
        console.error("Failed to verify feed articles:", verificationError);
      }
    }

    verifyFeedArticles();

    return () => {
      isActive = false;
    };
  }, [articles]);

  const analyzeArticlesWithAI = async (articlesToAnalyze: any[]) => {
    try {
      for (const article of articlesToAnalyze) {
        try {
          await AIService.analyzeContent(article);
        } catch (error) {
          console.error('Failed to analyze article:', article.id, error);
        }
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
    }
  };

  useEffect(() => {
    debugLog('Articles updated:', articles.length);
    if (articles.length > 0) {
      debugLog('Sample article:', articles[0]);
      debugLog('Sample article URL:', articles[0]?.url);
      debugLog('All article URLs:', articles.map(a => ({ title: a.title, url: a.url })));
      setLoading(false);
      setError(null);
      analyzeArticlesWithAI(articles); // Call analyzeArticlesWithAI
    } else {
      // Set loading to false after 5 seconds if no articles are loaded
      const timeout = setTimeout(() => {
        if (articles.length === 0) {
          setLoading(false);
          setError("No articles available at the moment. Please try again later.");
        }
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [articles]);

  const handleForceRefresh = async () => {
    debugLog('Force refresh called');
    setLoading(true);
    try {
      await forceRefresh();
      debugLog('Force refresh completed');
      setError(null);
    } catch (err) {
      console.error('Force refresh error:', err);
      setError("Failed to refresh news. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  const getRelevanceBadge = (score?: number) => {
    if (!score) return null;
    if (score >= 0.8)
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
          High Relevance
        </span>
      );
    if (score >= 0.6)
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
          Medium Relevance
        </span>
      );
    return (
      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
        Low Relevance
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Latest News</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="news-card animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg mb-4">{error}</div>
        <button onClick={handleForceRefresh} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <section className="mb-6 sm:mb-10">
        <div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-primary tracking-tight mb-2 font-headline">Latest News</h1>
          <p className="text-secondary text-sm sm:text-base md:text-lg font-medium leading-relaxed max-w-xl font-body">
            Curated high-level and informative news, tailored for the discerning reader.
          </p>
        </div>
      </section>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4 mb-2 sm:mb-0">
          <div className="flex items-center space-x-1">
            <TrendingUp size={16} className="text-green-600" />
            <span>{articles.length} articles</span>
          </div>
          <span>•</span>
          <span>All available news</span>
          {lastUpdate && (
            <>
              <span>•</span>
              <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
            </>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            {isConnected ? (
              <>
                <Wifi size={16} className="text-green-600" />
                <span className="text-green-600">Live</span>
              </>
            ) : (
              <>
                <WifiOff size={16} className="text-gray-400" />
                <span className="text-gray-400">Offline</span>
              </>
            )}
          </div>
          <button
            onClick={handleForceRefresh}
            className="flex items-center space-x-1 px-2 py-1 text-gray-600 hover:text-primary-600 transition-colors"
            title="Force refresh"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article: any) => {
          const contextBrief = generateContextBrief(article);
          const trustPresentation = getTrustPresentation(verificationById[article.id]);

          return (
          <article key={article.id} className="bg-surface-container-lowest rounded-xl overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-[0px_12px_32px_rgba(25,28,30,0.06)]">
            <div className="aspect-[16/10] overflow-hidden">
              <img
                src={getArticleThumbnail(article, 960, 600)}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(event) => applyThumbnailFallback(event, 960, 600)}
                loading="lazy"
              />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
                  {article.category || 'General'}
                </span>
                {getRelevanceBadge(article.relevanceScore)}
                <span className={`px-2 py-1 text-xs rounded-full ${trustPresentation.badgeClass}`}>
                  {verificationById[article.id] ? trustPresentation.label : 'Analyzing Trust'}
                </span>
              </div>
              {article.url ? (
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <h2 className="text-2xl font-bold text-primary leading-tight mb-3 font-headline group-hover:text-tertiary-container transition-colors flex items-center gap-2">
                    {article.title}
                    <ExternalLink size={16} className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h2>
                </a>
              ) : (
                <div className="block">
                  <h2 className="text-2xl font-bold text-primary leading-tight mb-3 font-headline opacity-60">
                    {article.title}
                  </h2>
                  <p className="text-xs text-red-500">No external link available</p>
                </div>
              )}
              <p 
                className="text-secondary text-sm leading-relaxed mb-6 line-clamp-3 font-body"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: getDynamicLineClamp(article).lineClamp,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {article.description}
              </p>
              <div className="mb-5 rounded-lg border border-blue-100 bg-blue-50/70 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700 mb-1">
                  Context Brief
                </p>
                <p className="text-sm text-blue-900 leading-relaxed mb-2">
                  {contextBrief.summary}
                </p>
                <p className="text-xs text-blue-800 leading-relaxed">
                  {contextBrief.whyItMatters}
                </p>
              </div>
              <div className="mt-auto pt-6 flex items-center justify-between border-t border-outline-variant/15">
                <div className="flex items-center gap-2 text-outline text-[11px] font-bold uppercase tracking-wider">
                  <Clock size={14} />
                  <span>{formatDate(article.publishedAt)}</span>
                  <span className="w-1 h-1 bg-outline-variant rounded-full"></span>
                  <Timer size={14} />
                  <span>{getReadingTime(article).formatted}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBookmarkToggle(article)}
                    className="text-outline hover:text-primary transition-colors"
                    title={
                      isBookmarked(article.id)
                        ? "Remove bookmark"
                        : "Bookmark article"
                    }
                  >
                    {isBookmarked(article.id) ? (
                      <BookmarkCheck size={20} className="text-tertiary" />
                    ) : (
                      <Bookmark size={20} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </article>
        )})}
      </div>

      {articles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">
            No relevant articles found for this category.
          </p>
        </div>
      )}
      
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-[#ffffff]/90 dark:bg-[#182034]/95 backdrop-blur-2xl shadow-[0px_-12px_32px_rgba(25,28,30,0.06)] rounded-t-3xl">
        <Link to="/" className="flex flex-col items-center justify-center bg-[#d5e3fd] dark:bg-[#003374] text-[#182034] dark:text-[#ffffff] rounded-2xl px-4 py-2 transition-opacity active:scale-90 duration-150">
          <TrendingUp size={24} />
          <span className="font-body text-[10px] font-bold tracking-widest uppercase mt-1">Feed</span>
        </Link>
        <Link to="/bias-map" className="flex flex-col items-center justify-center text-[#57657b] dark:text-[#bec6e0] px-4 py-2 hover:opacity-80 transition-opacity active:scale-90 duration-150">
          <BarChart3 size={24} />
          <span className="font-body text-[10px] font-bold tracking-widest uppercase mt-1">Bias</span>
        </Link>
        <Link to="/saved" className="flex flex-col items-center justify-center text-[#57657b] dark:text-[#bec6e0] px-4 py-2 hover:opacity-80 transition-opacity active:scale-90 duration-150">
          <Bookmark size={24} />
          <span className="font-body text-[10px] font-bold tracking-widest uppercase mt-1">Saved</span>
        </Link>
      </nav>
    </div>
  );
};

const NewsFeedWithBoundary: React.FC = () => (
  <NewsFeedErrorBoundary>
    <NewsFeed />
  </NewsFeedErrorBoundary>
);

export default NewsFeedWithBoundary;
