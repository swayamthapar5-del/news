import React, { useState, useEffect } from 'react'
import { Clock, ExternalLink, Bookmark, BookmarkCheck, Search, Trash2, Download, Upload, Wifi, Timer } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useBookmarks } from '../hooks/useBookmarks'
import { Article } from '../types'
import { ReadingTimeCalculator } from '../utils/readingTime'
import { applyThumbnailFallback, getArticleThumbnail } from '../utils/thumbnail'

const SavedArticlesPage: React.FC = () => {
  const { 
    bookmarks, 
    loading, 
    error, 
    removeBookmark, 
    clearAllBookmarks, 
    searchBookmarks, 
    getBookmarkStats,
    getOfflineArticle 
  } = useBookmarks()

  const [searchQuery, setSearchQuery] = useState('')
  const [filteredBookmarks, setFilteredBookmarks] = useState<Article[]>([])
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest')
  const [showOfflineOnly, setShowOfflineOnly] = useState(false)

  useEffect(() => {
    if (bookmarks.length > 0) {
      let filtered = bookmarks

      // Apply search filter
      if (searchQuery) {
        filtered = searchBookmarks(searchQuery)
      }

      // Apply offline filter
      if (showOfflineOnly) {
        filtered = filtered.filter(article => getOfflineArticle(article.id) !== null)
      }

      // Apply sorting
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.bookmarkedAt || b.publishedAt).getTime() - new Date(a.bookmarkedAt || a.publishedAt).getTime()
          case 'oldest':
            return new Date(a.bookmarkedAt || a.publishedAt).getTime() - new Date(b.bookmarkedAt || b.publishedAt).getTime()
          case 'title':
            return a.title.localeCompare(b.title)
          default:
            return 0
        }
      })

      setFilteredBookmarks(filtered)
    }
  }, [bookmarks.length, searchQuery, sortBy, showOfflineOnly])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString()
  }

  const handleRemoveBookmark = (articleId: string) => {
    if (confirm('Are you sure you want to remove this bookmark?')) {
      removeBookmark(articleId)
    }
  }

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all bookmarks? This action cannot be undone.')) {
      clearAllBookmarks()
    }
  }

  const handleExport = () => {
    try {
      const bookmarksJson = JSON.stringify(bookmarks, null, 2)
      const blob = new Blob([bookmarksJson], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bookmarks-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting bookmarks:', error)
      alert('Failed to export bookmarks')
    }
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        // Import functionality would be implemented here
        alert('Import functionality coming soon!')
      } catch (error) {
        console.error('Error importing bookmarks:', error)
        alert('Failed to import bookmarks')
      }
    }
    reader.readAsText(file)
  }

  const getReadingTime = (article: Article) => {
    return ReadingTimeCalculator.calculateArticleReadingTime(
      article.title,
      article.description,
      article.content
    )
  }

  const stats = getBookmarkStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Articles</h1>
        <p className="text-gray-600">Your personal reading list with offline access</p>
      </div>

      {/* Stats and Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="text-sm">
              <span className="font-semibold text-gray-900">{stats.totalBookmarks}</span>
              <span className="text-gray-600 ml-1">bookmarked articles</span>
            </div>
            <div className="text-sm">
              <span className="font-semibold text-green-600">{stats.offlineCached}</span>
              <span className="text-gray-600 ml-1">available offline</span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              <Download size={16} />
              <span>Export</span>
            </button>
            <label className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors cursor-pointer">
              <Upload size={16} />
              <span>Import</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            {bookmarks.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                <Trash2 size={16} />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search saved articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Sort by Title</option>
            </select>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOfflineOnly}
                onChange={(e) => setShowOfflineOnly(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Offline Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Articles List */}
      {filteredBookmarks.length === 0 ? (
        <div className="text-center py-12">
          <Bookmark size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || showOfflineOnly ? 'No articles found' : 'No saved articles yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || showOfflineOnly 
              ? 'Try adjusting your search or filters' 
              : 'Start bookmarking articles to build your reading list'
            }
          </p>
          {!searchQuery && !showOfflineOnly && (
            <Link to="/" className="btn-primary">
              Browse Articles
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookmarks.map((article) => {
            const isOffline = getOfflineArticle(article.id) !== null
            return (
              <div key={article.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="lg:w-48">
                    <img
                      src={getArticleThumbnail(article, 720, 480)}
                      alt={article.title}
                      className="w-full h-32 lg:h-48 object-cover rounded-lg"
                      onError={(event) => applyThumbnailFallback(event, 720, 480)}
                      loading="lazy"
                    />
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                            {article.category}
                          </span>
                          {isOffline && (
                            <div className="flex items-center space-x-1 text-green-600">
                              <Wifi size={14} />
                              <span className="text-xs">Offline Available</span>
                            </div>
                          )}
                          <span className="text-xs text-gray-500">
                            Bookmarked {formatDate(article.bookmarkedAt || article.publishedAt)}
                          </span>
                        </div>
                        
                        <Link to={`/article/${article.id}`}>
                          <h2 className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                            {article.title}
                          </h2>
                        </Link>
                        
                        <p className="text-gray-600 line-clamp-3 mb-4">{article.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock size={14} />
                              <span>{formatDate(article.publishedAt)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Timer size={14} />
                              <span>{getReadingTime(article).formatted}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-gray-400">Source:</span>
                              <span className="font-medium">{article.source.name}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <ExternalLink size={14} />
                              <span>Read Original</span>
                            </a>
                            <button
                              onClick={() => handleRemoveBookmark(article.id)}
                              className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-800 transition-colors"
                            >
                              <BookmarkCheck size={14} />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SavedArticlesPage
