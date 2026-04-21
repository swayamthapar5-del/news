import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, Clock, ExternalLink } from 'lucide-react'
import { Article } from '../types'
import { searchNews } from '../services/newsService'
import { applyThumbnailFallback, getArticleThumbnail } from '../utils/thumbnail'

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState(query)

  useEffect(() => {
    if (query) {
      performSearch(query)
    }
  }, [query])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    try {
      setLoading(true)
      const results = await searchNews(searchQuery)
      setArticles(results)
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.history.pushState({}, '', `/search?q=${encodeURIComponent(searchQuery.trim())}`)
      performSearch(searchQuery.trim())
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString()
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-0 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Search News</h1>
        <p className="text-gray-600 text-sm sm:text-base">Find relevant and informative articles</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for news topics, keywords, or categories..."
            className="w-full px-4 py-3 pl-12 text-base sm:text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
        </div>
      </form>

      {query && (
        <div className="text-gray-600">
          {loading ? (
            <p>Searching for "{query}"...</p>
          ) : (
            <p>Found {articles.length} results for "{query}"</p>
          )}
        </div>
      )}

      {loading && (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="news-card animate-pulse">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="w-full sm:w-32 h-24 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && articles.length > 0 && (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {articles.map((article) => (
            <article key={article.id} className="news-card">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <img
                  src={getArticleThumbnail(article, 480, 320)}
                  alt={article.title}
                  className="w-full sm:w-32 h-24 sm:h-24 object-cover rounded-lg flex-shrink-0"
                  onError={(event) => applyThumbnailFallback(event, 480, 320)}
                  loading="lazy"
                />
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                      {article.category}
                    </span>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock size={14} />
                      <span>{formatDate(article.publishedAt)}</span>
                    </div>
                  </div>
                  <Link to={`/article/${article.id}`}>
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 text-sm line-clamp-2">{article.description}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{article.source.name}</span>
                    <ExternalLink size={14} />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && query && articles.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-600 mb-4">
            No articles found for "{query}"
          </div>
          <p className="text-gray-500 text-sm">
            Try searching with different keywords or browse our categories.
          </p>
        </div>
      )}

      {!query && !loading && (
        <div className="text-center py-12">
          <Search size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Start your search</h3>
          <p className="text-gray-600">
            Enter keywords above to find relevant and informative news articles.
          </p>
        </div>
      )}
    </div>
  )
}

export default SearchPage
