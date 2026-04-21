import { Article } from '../types'
import { getTopHeadlines, getBreakingNews, getTwitterTweets } from './newsService'
import { debugLog } from '../utils/logger'

// Real-time news service for live updates
export class RealtimeService {
  private static instance: RealtimeService
  private subscribers: Set<(articles: Article[]) => void> = new Set()
  private isRunning = false
  private interval: number | null = null
  private lastUpdate = Date.now()
  private updateInterval = 10000 // 10 seconds
  private cachedArticles: Article[] = []

  static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService()
    }
    return RealtimeService.instance
  }

  // Subscribe to real-time updates
  subscribe(callback: (articles: Article[]) => void) {
    this.subscribers.add(callback)
    
    // Send current articles immediately
    if (this.cachedArticles.length > 0) {
      callback(this.cachedArticles)
    }
    
    // Start polling if not already running
    if (!this.isRunning) {
      this.startPolling()
    }
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback)
      if (this.subscribers.size === 0) {
        this.stopPolling()
      }
    }
  }

  // Start polling for news updates
  private startPolling() {
    if (this.isRunning) return
    
    this.isRunning = true
    this.pollForUpdates()
    
    this.interval = setInterval(() => {
      this.pollForUpdates()
    }, this.updateInterval)
  }

  // Stop polling
  private stopPolling() {
    this.isRunning = false
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }

  // Poll for news updates
  private async pollForUpdates() {
    try {
      debugLog('Polling for news updates...')
      
      // Get latest headlines
      const latestArticles = await getTopHeadlines()
      debugLog('Fetched latest articles:', latestArticles.length)
      const breakingNews = await getBreakingNews()
      debugLog('Fetched breaking news:', breakingNews.length)
      const twitterTweets = await getTwitterTweets(30)
      debugLog('Fetched Twitter tweets:', twitterTweets.length)
      
      // Combine and deduplicate articles
      const allArticles = [...latestArticles, ...breakingNews, ...twitterTweets]
      const uniqueArticles = this.deduplicateArticles(allArticles)
      debugLog('Unique articles after deduplication:', uniqueArticles.length)
      
      // Check if there are new articles
      const hasNewArticles = this.hasNewArticles(uniqueArticles)
      
      if (hasNewArticles) {
        // Create a new array reference only when there are actual changes
        const newArticles = uniqueArticles.slice(0, 100) // Keep only 100 most recent
        const articlesChanged = this.cachedArticles.length !== newArticles.length || 
                               !this.cachedArticles.every((article, index) => 
                                 article.id === newArticles[index]?.id)
        
        if (articlesChanged) {
          this.cachedArticles = newArticles
          this.lastUpdate = Date.now()
          
          // Notify all subscribers
          this.subscribers.forEach(callback => {
            try {
              callback(this.cachedArticles)
            } catch (error) {
              console.error('Error notifying subscriber:', error)
            }
          })
          
          debugLog(`Updated with ${this.cachedArticles.length} articles`)
        }
      }
    } catch (error) {
      console.error('Error polling for updates:', error)
    }
  }

  // Check if there are new articles
  private hasNewArticles(newArticles: Article[]): boolean {
    if (this.cachedArticles.length === 0) return true
    
    // Check if any new article is newer than our last update
    return newArticles.some(article => {
      const articleTime = new Date(article.publishedAt).getTime()
      return articleTime > this.lastUpdate
    })
  }

  // Remove duplicate articles
  private deduplicateArticles(articles: Article[]): Article[] {
    const seen = new Set<string>()
    return articles.filter(article => {
      const key = article.url || article.id || article.title
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  // Get current cached articles
  getCurrentArticles(): Article[] {
    return this.cachedArticles
  }

  // Force refresh
  async forceRefresh(): Promise<Article[]> {
    await this.pollForUpdates()
    return this.cachedArticles
  }

  // Update polling interval
  setUpdateInterval(intervalMs: number) {
    this.updateInterval = intervalMs
    if (this.isRunning) {
      this.stopPolling()
      this.startPolling()
    }
  }

  // Get service status
  getStatus() {
    return {
      isRunning: this.isRunning,
      subscriberCount: this.subscribers.size,
      lastUpdate: this.lastUpdate,
      articleCount: this.cachedArticles.length,
      updateInterval: this.updateInterval
    }
  }
}
