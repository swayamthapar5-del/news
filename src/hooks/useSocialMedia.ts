import { useState, useEffect } from 'react'
import { SocialMediaService, SocialMediaPost, SocialAnalytics, SocialShareOptions } from '../services/socialMediaService'

export const useSocialFeeds = (topic?: string) => {
  const [feeds, setFeeds] = useState<SocialMediaPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSocialFeeds()
  }, [topic])

  const fetchSocialFeeds = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const socialService = SocialMediaService.getInstance()
      const socialFeeds = await socialService.getTrendingSocialFeeds(topic)
      setFeeds(socialFeeds)
    } catch (err) {
      setError('Failed to fetch social feeds')
      console.error('Social feeds error:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshFeeds = () => {
    fetchSocialFeeds()
  }

  return {
    feeds,
    loading,
    error,
    refreshFeeds
  }
}

export const useUserGeneratedContent = (articleId: string) => {
  const [ugc, setUgc] = useState<SocialMediaPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (articleId) {
      fetchUGC()
    }
  }, [articleId])

  const fetchUGC = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const socialService = SocialMediaService.getInstance()
      const userContent = await socialService.getUserGeneratedContent(articleId)
      setUgc(userContent)
    } catch (err) {
      setError('Failed to fetch user-generated content')
      console.error('UGC error:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshUGC = () => {
    fetchUGC()
  }

  return {
    ugc,
    loading,
    error,
    refreshUGC
  }
}

export const useShortFormVideos = (topic?: string) => {
  const [videos, setVideos] = useState<SocialMediaPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchVideos()
  }, [topic])

  const fetchVideos = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const socialService = SocialMediaService.getInstance()
      const shortVideos = await socialService.getShortFormVideos(topic)
      setVideos(shortVideos)
    } catch (err) {
      setError('Failed to fetch short-form videos')
      console.error('Short videos error:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshVideos = () => {
    fetchVideos()
  }

  return {
    videos,
    loading,
    error,
    refreshVideos
  }
}

export const useSocialAnalytics = (articleId: string) => {
  const [analytics, setAnalytics] = useState<SocialAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (articleId) {
      fetchAnalytics()
    }
  }, [articleId])

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const socialService = SocialMediaService.getInstance()
      const socialAnalytics = await socialService.getSocialAnalytics(articleId)
      setAnalytics(socialAnalytics)
    } catch (err) {
      setError('Failed to fetch social analytics')
      console.error('Analytics error:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshAnalytics = () => {
    fetchAnalytics()
  }

  return {
    analytics,
    loading,
    error,
    refreshAnalytics
  }
}

export const useSocialSharing = () => {
  const [sharing, setSharing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const shareToSocial = async (platform: string, options: SocialShareOptions): Promise<boolean> => {
    setSharing(true)
    setError(null)
    
    try {
      const socialService = SocialMediaService.getInstance()
      const success = await socialService.shareToSocial(platform, options)
      return success
    } catch (err) {
      setError('Failed to share to social media')
      console.error('Sharing error:', err)
      return false
    } finally {
      setSharing(false)
    }
  }

  return {
    shareToSocial,
    sharing,
    error
  }
}

export const useSocialLogin = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getProviders = () => {
    const socialService = SocialMediaService.getInstance()
    return socialService.getSocialLoginProviders()
  }

  const authenticate = async (provider: string, code: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const socialService = SocialMediaService.getInstance()
      const result = await socialService.authenticateWithSocial(provider, code)
      return result
    } catch (err) {
      setError('Authentication failed')
      console.error('Social login error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    getProviders,
    authenticate,
    loading,
    error
  }
}
