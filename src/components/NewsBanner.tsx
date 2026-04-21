import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { Article } from '../types';
import { debugLog } from '../utils/logger';

interface NewsBannerProps {
  articles: Article[];
}

const NewsBanner: React.FC<NewsBannerProps> = ({ articles }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  debugLog('NewsBanner received articles:', articles.length);

  // Filter for breaking news or important articles
  const bannerArticles = articles.filter(article => 
    article.category === 'breaking' || 
    article.relevanceScore && article.relevanceScore > 0.8 ||
    article.title.toLowerCase().includes('breaking') ||
    article.title.toLowerCase().includes('urgent')
  ).slice(0, 5);

  debugLog('Banner articles found:', bannerArticles.length);

  // Fallback to top articles if no breaking news
  const displayArticles = bannerArticles.length > 0 ? bannerArticles : articles.slice(0, 5);

  debugLog('Display articles:', displayArticles.length);

  // Always show banner if we have any articles
  if (displayArticles.length === 0) {
    debugLog('No articles to display in banner');
    return null;
  }

  useEffect(() => {
    if (!autoPlay || displayArticles.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayArticles.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay, displayArticles.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % displayArticles.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + displayArticles.length) % displayArticles.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (displayArticles.length === 0) {
    return null;
  }

  const currentArticle = displayArticles[currentIndex];

  return (
    <div 
      className="relative w-full bg-gradient-to-r from-primary-600 to-primary-800 text-white overflow-hidden"
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
    >
      {/* Banner Content */}
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 animate-pulse" />
          <span className="text-xs sm:text-sm font-semibold text-yellow-300 uppercase tracking-wider">
            Breaking News
          </span>
        </div>
        
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-2 line-clamp-2">
              {currentArticle.title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-200 line-clamp-2 mb-2">
              {currentArticle.description}
            </p>
            <div className="flex items-center gap-2 sm:gap-4 text-xs text-gray-300">
              <span className="font-medium truncate">{currentArticle.source.name}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">{new Date(currentArticle.publishedAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          {currentArticle.imageUrl && (
            <div className="hidden sm:block w-32 h-24 md:w-48 md:h-32 flex-shrink-0">
              <img
                src={currentArticle.imageUrl}
                alt={currentArticle.title}
                className="w-full h-full object-cover rounded-lg shadow-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      {displayArticles.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 p-2 rounded-full transition-all"
            aria-label="Previous news"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 p-2 rounded-full transition-all"
            aria-label="Next news"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {displayArticles.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {displayArticles.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsBanner;
