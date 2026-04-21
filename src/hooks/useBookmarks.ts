import { useState, useEffect } from 'react'
import { Article } from '../types'
import { BookmarkService } from '../services/bookmarkService'

// React hook for bookmark functionality
export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load bookmarks on mount
  useEffect(() => {
    loadBookmarks()
  }, [])

  const loadBookmarks = () => {
    try {
      setLoading(true)
      const savedBookmarks = BookmarkService.getBookmarks()
      setBookmarks(savedBookmarks)
      setError(null)
    } catch (err) {
      setError('Failed to load bookmarks')
      console.error('Error loading bookmarks:', err)
    } finally {
      setLoading(false)
    }
  }

  const addBookmark = (article: Article): boolean => {
    try {
      const success = BookmarkService.addBookmark(article)
      if (success) {
        loadBookmarks() // Reload bookmarks
      }
      return success
    } catch (err) {
      setError('Failed to add bookmark')
      console.error('Error adding bookmark:', err)
      return false
    }
  }

  const removeBookmark = (articleId: string): boolean => {
    try {
      const success = BookmarkService.removeBookmark(articleId)
      if (success) {
        loadBookmarks() // Reload bookmarks
      }
      return success
    } catch (err) {
      setError('Failed to remove bookmark')
      console.error('Error removing bookmark:', err)
      return false
    }
  }

  const isBookmarked = (articleId: string): boolean => {
    return BookmarkService.isBookmarked(articleId)
  }

  const toggleBookmark = (article: Article): boolean => {
    if (isBookmarked(article.id)) {
      return removeBookmark(article.id)
    } else {
      return addBookmark(article)
    }
  }

  const clearAllBookmarks = () => {
    try {
      BookmarkService.clearAllBookmarks()
      loadBookmarks()
      setError(null)
    } catch (err) {
      setError('Failed to clear bookmarks')
      console.error('Error clearing bookmarks:', err)
    }
  }

  const searchBookmarks = (query: string): Article[] => {
    return BookmarkService.searchBookmarks(query)
  }

  const getBookmarkStats = () => {
    return BookmarkService.getBookmarkStats()
  }

  const getOfflineArticle = (articleId: string): Article | null => {
    return BookmarkService.getOfflineCachedArticle(articleId)
  }

  return {
    bookmarks,
    loading,
    error,
    addBookmark,
    removeBookmark,
    isBookmarked,
    toggleBookmark,
    clearAllBookmarks,
    searchBookmarks,
    getBookmarkStats,
    getOfflineArticle,
    bookmarkCount: bookmarks.length,
    refreshBookmarks: loadBookmarks
  }
}
