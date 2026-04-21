import { Article } from '../types'

// Bookmark service for saving articles with offline access
export class BookmarkService {
  private static readonly STORAGE_KEY = 'news-platform-bookmarks'
  private static readonly OFFLINE_STORAGE_KEY = 'news-platform-offline-articles'

  // Get all bookmarked articles
  static getBookmarks(): Article[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading bookmarks:', error)
      return []
    }
  }

  // Save bookmarked articles
  static saveBookmarks(bookmarks: Article[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookmarks))
    } catch (error) {
      console.error('Error saving bookmarks:', error)
    }
  }

  // Add article to bookmarks
  static addBookmark(article: Article): boolean {
    try {
      const bookmarks = this.getBookmarks()
      
      // Check if article is already bookmarked
      if (bookmarks.some(b => b.id === article.id)) {
        return false // Already bookmarked
      }

      // Add bookmark with timestamp
      const bookmarkedArticle = {
        ...article,
        bookmarkedAt: new Date().toISOString(),
        isBookmarked: true
      }

      bookmarks.unshift(bookmarkedArticle) // Add to beginning
      this.saveBookmarks(bookmarks)
      
      // Cache article for offline access
      this.cacheArticleOffline(bookmarkedArticle)
      
      return true
    } catch (error) {
      console.error('Error adding bookmark:', error)
      return false
    }
  }

  // Remove article from bookmarks
  static removeBookmark(articleId: string): boolean {
    try {
      const bookmarks = this.getBookmarks()
      const filteredBookmarks = bookmarks.filter(b => b.id !== articleId)
      
      if (filteredBookmarks.length === bookmarks.length) {
        return false // Article not found
      }

      this.saveBookmarks(filteredBookmarks)
      
      // Remove from offline cache
      this.removeOfflineCache(articleId)
      
      return true
    } catch (error) {
      console.error('Error removing bookmark:', error)
      return false
    }
  }

  // Check if article is bookmarked
  static isBookmarked(articleId: string): boolean {
    const bookmarks = this.getBookmarks()
    return bookmarks.some(b => b.id === articleId)
  }

  // Get bookmark count
  static getBookmarkCount(): number {
    return this.getBookmarks().length
  }

  // Cache article for offline access
  static cacheArticleOffline(article: Article): void {
    try {
      const cachedArticles = this.getOfflineCachedArticles()
      cachedArticles[article.id] = {
        ...article,
        cachedAt: new Date().toISOString()
      }
      
      localStorage.setItem(this.OFFLINE_STORAGE_KEY, JSON.stringify(cachedArticles))
    } catch (error) {
      console.error('Error caching article offline:', error)
    }
  }

  // Get offline cached articles
  static getOfflineCachedArticles(): { [key: string]: any } {
    try {
      const stored = localStorage.getItem(this.OFFLINE_STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Error loading offline cache:', error)
      return {}
    }
  }

  // Get specific offline cached article
  static getOfflineCachedArticle(articleId: string): Article | null {
    const cachedArticles = this.getOfflineCachedArticles()
    return cachedArticles[articleId] || null
  }

  // Remove article from offline cache
  static removeOfflineCache(articleId: string): void {
    try {
      const cachedArticles = this.getOfflineCachedArticles()
      delete cachedArticles[articleId]
      localStorage.setItem(this.OFFLINE_STORAGE_KEY, JSON.stringify(cachedArticles))
    } catch (error) {
      console.error('Error removing offline cache:', error)
    }
  }

  // Clear all bookmarks and offline cache
  static clearAllBookmarks(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      localStorage.removeItem(this.OFFLINE_STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing bookmarks:', error)
    }
  }

  // Get bookmark statistics
  static getBookmarkStats() {
    const bookmarks = this.getBookmarks()
    const cachedArticles = this.getOfflineCachedArticles()
    
    return {
      totalBookmarks: bookmarks.length,
      offlineCached: Object.keys(cachedArticles).length,
      oldestBookmark: bookmarks.length > 0 ? bookmarks[bookmarks.length - 1].bookmarkedAt : null,
      newestBookmark: bookmarks.length > 0 ? bookmarks[0].bookmarkedAt : null
    }
  }

  // Search bookmarks
  static searchBookmarks(query: string): Article[] {
    const bookmarks = this.getBookmarks()
    const lowercaseQuery = query.toLowerCase()
    
    return bookmarks.filter(article => 
      article.title.toLowerCase().includes(lowercaseQuery) ||
      article.description.toLowerCase().includes(lowercaseQuery) ||
      article.content.toLowerCase().includes(lowercaseQuery)
    )
  }

  // Get bookmarks by source
  static getBookmarksBySource(sourceName: string): Article[] {
    const bookmarks = this.getBookmarks()
    return bookmarks.filter(article => 
      article.source.name.toLowerCase().includes(sourceName.toLowerCase())
    )
  }

  // Get recently bookmarked articles (last 7 days)
  static getRecentBookmarks(days: number = 7): Article[] {
    const bookmarks = this.getBookmarks()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    return bookmarks.filter(article => {
      const bookmarkDate = new Date(article.bookmarkedAt || article.publishedAt)
      return bookmarkDate >= cutoffDate
    })
  }

  // Export bookmarks
  static exportBookmarks(): string {
    const bookmarks = this.getBookmarks()
    return JSON.stringify(bookmarks, null, 2)
  }

  // Import bookmarks
  static importBookmarks(bookmarksJson: string): { success: boolean; imported: number; errors: string[] } {
    try {
      const importedBookmarks = JSON.parse(bookmarksJson)
      if (!Array.isArray(importedBookmarks)) {
        return { success: false, imported: 0, errors: ['Invalid format: expected array'] }
      }

      const existingBookmarks = this.getBookmarks()
      const existingIds = new Set(existingBookmarks.map(b => b.id))
      const errors: string[] = []
      let imported = 0

      for (const article of importedBookmarks) {
        if (!article.id) {
          errors.push('Article missing ID')
          continue
        }

        if (existingIds.has(article.id)) {
          errors.push(`Article "${article.title}" already bookmarked`)
          continue
        }

        if (this.addBookmark(article)) {
          imported++
        } else {
          errors.push(`Failed to bookmark "${article.title}"`)
        }
      }

      return { success: true, imported, errors }
    } catch (error) {
      return { success: false, imported: 0, errors: ['Invalid JSON format'] }
    }
  }
}
