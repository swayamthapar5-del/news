import { useState, useEffect, useCallback, useRef } from 'react'
import { Article } from '../types'
import { RealtimeService } from '../services/realtimeService'
import { debugLog } from '../utils/logger'

// React hook for real-time news
export const useRealtimeNews = () => {
  const [articles, setArticles] = useState<Article[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const articlesRef = useRef<Article[]>([])

  // Update ref when articles change
  useEffect(() => {
    articlesRef.current = articles
  }, [articles])

  useEffect(() => {
    const realtimeService = RealtimeService.getInstance()
    
    const unsubscribe = realtimeService.subscribe((newArticles) => {
      debugLog('Subscription callback received articles:', newArticles.length)
      // Only update articles if the data has actually changed
      const hasChanged = newArticles.length !== articlesRef.current.length || 
                        !newArticles.every((article, index) => article.id === articlesRef.current[index]?.id)
      
      if (hasChanged) {
        debugLog('Articles changed, updating state')
        setArticles(newArticles)
        setLastUpdate(new Date())
        setIsConnected(true)
      }
    })

    // Set initial connection status
    setIsConnected(realtimeService['isRunning'])

    return () => {
      unsubscribe()
      setIsConnected(false)
    }
  }, [])

  const forceRefresh = useCallback(async () => {
    const realtimeService = RealtimeService.getInstance()
    const refreshedArticles = await realtimeService.forceRefresh()
    setArticles(refreshedArticles)
    setLastUpdate(new Date())
  }, [])

  return {
    articles,
    isConnected,
    lastUpdate,
    forceRefresh,
    status: RealtimeService.getInstance().getStatus()
  }
}
