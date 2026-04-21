import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, ExternalLink } from 'lucide-react';
import NewsCalendar from './NewsCalendar';
import { DailyNewsService } from '../services/dailyNewsService';
import { Article } from '../types';

const NewsArchivePage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load today's news by default
    const today = new Date().toISOString().split('T')[0];
    if (DailyNewsService.hasNewsForDate(today)) {
      setSelectedDate(today);
      setArticles(DailyNewsService.getNewsForDate(today));
    }
  }, []);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setLoading(true);
    
    // Simulate loading for better UX
    setTimeout(() => {
      const dateArticles = DailyNewsService.getNewsForDate(date);
      setArticles(dateArticles);
      setLoading(false);
    }, 300);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const stats = DailyNewsService.getArchiveStats();

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to News
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">News Archive</h1>
        <p className="text-gray-600">
          Browse news by date - {stats.totalDays} days archived, {stats.totalArticles} articles
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-1">
          <NewsCalendar
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
          />
        </div>

        {/* News Display */}
        <div className="lg:col-span-2">
          {selectedDate ? (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">{formatDate(selectedDate)}</span>
                </div>
                <p className="text-sm text-gray-500">
                  {articles.length} article{articles.length !== 1 ? 's' : ''} available
                </p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
                </div>
              ) : articles.length > 0 ? (
                <div className="space-y-4">
                  {articles.map((article) => (
                    <div
                      key={article.id}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                    >
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary-600 transition-colors"
                        >
                          {article.title}
                        </a>
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {article.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4 text-gray-500">
                          <span className="font-medium">{article.source.name}</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(article.publishedAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700"
                        >
                          Read more
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No articles found
                  </h3>
                  <p className="text-gray-600">
                    Select a different date from the calendar
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Select a date
              </h3>
              <p className="text-gray-600">
                Choose a date from the calendar to view news from that day
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsArchivePage;
