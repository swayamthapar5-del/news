export interface SocialMediaPost {
  id: string
  platform: 'twitter' | 'facebook' | 'instagram' | 'tiktok' | 'reddit' | 'linkedin'
  content: string
  author: {
    name: string
    username: string
    avatar?: string
    verified: boolean
    followers?: number
  }
  timestamp: string
  metrics: {
    likes: number
    shares: number
    comments: number
    views?: number
  }
  media?: {
    type: 'image' | 'video' | 'gif'
    url: string
    thumbnail?: string
    duration?: number
  }
  url: string
  hashtags: string[]
  mentions: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  relevance: number
}

export interface SocialLoginProvider {
  id: string
  name: string
  displayName: string
  icon: string
  color: string
  scopes: string[]
  authUrl: string
}

export interface SocialShareOptions {
  title: string
  description: string
  url: string
  imageUrl?: string
  hashtags?: string[]
  via?: string
  customMessage?: string
}

export interface SocialAnalytics {
  platform: string
  engagement: number
  reach: number
  impressions: number
  shares: number
  likes: number
  comments: number
  topPosts: SocialMediaPost[]
  trendingHashtags: string[]
  sentiment: {
    positive: number
    neutral: number
    negative: number
  }
}

export class SocialMediaService {
  private static instance: SocialMediaService
  private readonly API_BASE_URL = 'https://api.socialmedia.com/v1'
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  static getInstance(): SocialMediaService {
    if (!SocialMediaService.instance) {
      SocialMediaService.instance = new SocialMediaService()
    }
    return SocialMediaService.instance
  }

  /**
   * Get available social login providers
   */
  getSocialLoginProviders(): SocialLoginProvider[] {
    return [
      {
        id: 'google',
        name: 'google',
        displayName: 'Google',
        icon: 'google',
        color: '#4285F4',
        scopes: ['openid', 'profile', 'email'],
        authUrl: 'https://accounts.google.com/oauth/authorize'
      },
      {
        id: 'facebook',
        name: 'facebook',
        displayName: 'Facebook',
        icon: 'facebook',
        color: '#1877F2',
        scopes: ['email', 'public_profile'],
        authUrl: 'https://www.facebook.com/v18.0/dialog/oauth'
      },
      {
        id: 'twitter',
        name: 'twitter',
        displayName: 'Twitter/X',
        icon: 'twitter',
        color: '#1DA1F2',
        scopes: ['tweet.read', 'users.read'],
        authUrl: 'https://twitter.com/i/oauth2/authorize'
      },
      {
        id: 'linkedin',
        name: 'linkedin',
        displayName: 'LinkedIn',
        icon: 'linkedin',
        color: '#0077B5',
        scopes: ['r_liteprofile', 'r_emailaddress'],
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization'
      }
    ]
  }

  /**
   * Authenticate with social provider
   */
  async authenticateWithSocial(provider: string, code: string): Promise<any> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/${provider}/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      if (!response.ok) {
        throw new Error('Authentication failed')
      }

      return await response.json()
    } catch (error) {
      console.error('Social authentication error:', error)
      throw error
    }
  }

  /**
   * Get live social media feeds for trending topics
   */
  async getTrendingSocialFeeds(topic?: string): Promise<SocialMediaPost[]> {
    try {
      const cacheKey = `social_feeds_${topic || 'global'}`
      const cached = this.getFromCache(cacheKey)
      
      if (cached) {
        return cached
      }

      // Simulate API call with mock data
      const mockPosts = this.generateMockSocialPosts(topic)
      
      // Cache the results
      this.setCache(cacheKey, mockPosts)
      
      return mockPosts
    } catch (error) {
      console.error('Error fetching social feeds:', error)
      return []
    }
  }

  /**
   * Get user-generated content related to news
   */
  async getUserGeneratedContent(articleId: string): Promise<SocialMediaPost[]> {
    try {
      const cacheKey = `ugc_${articleId}`
      const cached = this.getFromCache(cacheKey)
      
      if (cached) {
        return cached
      }

      // Simulate API call with mock data
      const mockUGC = this.generateMockUGC(articleId)
      
      // Cache the results
      this.setCache(cacheKey, mockUGC)
      
      return mockUGC
    } catch (error) {
      console.error('Error fetching UGC:', error)
      return []
    }
  }

  /**
   * Get embedded short-form video content
   */
  async getShortFormVideos(topic?: string): Promise<SocialMediaPost[]> {
    try {
      const cacheKey = `short_videos_${topic || 'trending'}`
      const cached = this.getFromCache(cacheKey)
      
      if (cached) {
        return cached
      }

      // Simulate API call with mock data
      const mockVideos = this.generateMockShortVideos(topic)
      
      // Cache the results
      this.setCache(cacheKey, mockVideos)
      
      return mockVideos
    } catch (error) {
      console.error('Error fetching short videos:', error)
      return []
    }
  }

  /**
   * Share article to social media
   */
  async shareToSocial(platform: string, options: SocialShareOptions): Promise<boolean> {
    try {
      const shareUrls = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(options.customMessage || options.title)}&url=${encodeURIComponent(options.url)}&hashtags=${options.hashtags?.join(',') || ''}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(options.url)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(options.url)}`,
        reddit: `https://reddit.com/submit?url=${encodeURIComponent(options.url)}&title=${encodeURIComponent(options.title)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(`${options.title} ${options.url}`)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(options.url)}&text=${encodeURIComponent(options.title)}`
      }

      const shareUrl = shareUrls[platform as keyof typeof shareUrls]
      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400')
        return true
      }

      return false
    } catch (error) {
      console.error('Error sharing to social:', error)
      return false
    }
  }

  /**
   * Get social media analytics
   */
  async getSocialAnalytics(articleId: string): Promise<SocialAnalytics> {
    try {
      const cacheKey = `analytics_${articleId}`
      const cached = this.getFromCache(cacheKey)
      
      if (cached) {
        return cached
      }

      // Simulate API call with mock data
      const mockAnalytics = this.generateMockAnalytics()
      
      // Cache the results
      this.setCache(cacheKey, mockAnalytics)
      
      return mockAnalytics
    } catch (error) {
      console.error('Error fetching analytics:', error)
      throw error
    }
  }

  /**
   * Generate mock social posts
   */
  private generateMockSocialPosts(topic?: string): SocialMediaPost[] {
    const topics = topic ? [topic] : ['technology', 'politics', 'business', 'science', 'health']
    const posts: SocialMediaPost[] = []

    for (let i = 0; i < 20; i++) {
      const platform = ['twitter', 'facebook', 'instagram', 'reddit', 'linkedin'][Math.floor(Math.random() * 5)] as any
      const randomTopic = topics[Math.floor(Math.random() * topics.length)]
      
      posts.push({
        id: `social_${i}`,
        platform,
        content: this.generateMockContent(platform, randomTopic),
        author: {
          name: this.generateMockName(),
          username: this.generateMockUsername(),
          verified: Math.random() > 0.7,
          followers: Math.floor(Math.random() * 1000000)
        },
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        metrics: {
          likes: Math.floor(Math.random() * 10000),
          shares: Math.floor(Math.random() * 5000),
          comments: Math.floor(Math.random() * 1000),
          views: Math.floor(Math.random() * 100000)
        },
        media: Math.random() > 0.5 ? {
          type: Math.random() > 0.5 ? 'image' : 'video',
          url: `https://picsum.photos/seed/${i}/400/300.jpg`,
          thumbnail: `https://picsum.photos/seed/${i}/200/150.jpg`,
          duration: Math.floor(Math.random() * 60) + 15
        } : undefined,
        url: `https://social.com/post/${i}`,
        hashtags: this.generateMockHashtags(randomTopic),
        mentions: this.generateMockMentions(),
        sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)] as any,
        relevance: Math.random()
      })
    }

    return posts.sort((a, b) => b.metrics.likes - a.metrics.likes)
  }

  /**
   * Generate mock user-generated content
   */
  private generateMockUGC(articleId: string): SocialMediaPost[] {
    const posts: SocialMediaPost[] = []

    for (let i = 0; i < 10; i++) {
      posts.push({
        id: `ugc_${articleId}_${i}`,
        platform: ['twitter', 'facebook', 'instagram', 'reddit'][Math.floor(Math.random() * 4)] as any,
        content: this.generateMockUGCContent(),
        author: {
          name: this.generateMockName(),
          username: this.generateMockUsername(),
          verified: false,
          followers: Math.floor(Math.random() * 10000)
        },
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        metrics: {
          likes: Math.floor(Math.random() * 1000),
          shares: Math.floor(Math.random() * 500),
          comments: Math.floor(Math.random() * 100)
        },
        media: Math.random() > 0.3 ? {
          type: 'image',
          url: `https://picsum.photos/seed/ugc_${i}/400/300.jpg`
        } : undefined,
        url: `https://social.com/ugc/${i}`,
        hashtags: ['#news', '#discussion', '#opinion'],
        mentions: [],
        sentiment: 'neutral',
        relevance: Math.random()
      })
    }

    return posts
  }

  /**
   * Generate mock short-form videos
   */
  private generateMockShortVideos(topic?: string): SocialMediaPost[] {
    const posts: SocialMediaPost[] = []

    for (let i = 0; i < 15; i++) {
      posts.push({
        id: `video_${i}`,
        platform: 'tiktok',
        content: this.generateMockVideoContent(topic),
        author: {
          name: this.generateMockName(),
          username: this.generateMockUsername(),
          verified: Math.random() > 0.8,
          followers: Math.floor(Math.random() * 5000000)
        },
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        metrics: {
          likes: Math.floor(Math.random() * 100000),
          shares: Math.floor(Math.random() * 50000),
          comments: Math.floor(Math.random() * 10000),
          views: Math.floor(Math.random() * 1000000)
        },
        media: {
          type: 'video',
          url: `https://video.com/shorts/${i}`,
          thumbnail: `https://picsum.photos/seed/video_${i}/400/700.jpg`,
          duration: Math.floor(Math.random() * 60) + 15
        },
        url: `https://tiktok.com/@user/video/${i}`,
        hashtags: this.generateMockHashtags(topic),
        mentions: this.generateMockMentions(),
        sentiment: 'positive',
        relevance: Math.random()
      })
    }

    return posts.sort((a, b) => (b.metrics.views || 0) - (a.metrics.views || 0))
  }

  /**
   * Generate mock analytics
   */
  private generateMockAnalytics(): SocialAnalytics {
    return {
      platform: 'all',
      engagement: Math.floor(Math.random() * 10000),
      reach: Math.floor(Math.random() * 100000),
      impressions: Math.floor(Math.random() * 500000),
      shares: Math.floor(Math.random() * 5000),
      likes: Math.floor(Math.random() * 20000),
      comments: Math.floor(Math.random() * 2000),
      topPosts: this.generateMockSocialPosts().slice(0, 5),
      trendingHashtags: ['#trending', '#news', '#viral', '#breaking', '#tech'],
      sentiment: {
        positive: Math.random() * 100,
        neutral: Math.random() * 100,
        negative: Math.random() * 100
      }
    }
  }

  /**
   * Helper methods for generating mock data
   */
  private generateMockContent(platform: string, topic: string): string {
    const templates = {
      twitter: `Breaking ${topic} news! This is huge! ${topic} is changing everything. Read more: #${topic} #breaking #news`,
      facebook: `Just read about the latest developments in ${topic}. This could impact all of us. What are your thoughts? #${topic} #discussion`,
      instagram: `${topic} update! Check out what's happening in the world of ${topic}. #${topic} #trending #news`,
      reddit: `Thoughts on this ${topic} development? Seems like this could be a game changer. #${topic} #discussion`,
      linkedin: `Important ${topic} development announced today. This could have significant implications for the industry. #${topic} #business #innovation`
    }

    return templates[platform as keyof typeof templates] || `Latest ${topic} news and updates. #${topic}`
  }

  private generateMockUGCContent(): string {
    const templates = [
      "I've been following this story and I think there's more to it than meets the eye.",
      "This article raises some important questions that we should all consider.",
      "Great analysis! I've been saying this for months.",
      "Interesting perspective, but I think we need more data before drawing conclusions.",
      "This reminds me of a similar situation from a few years ago."
    ]

    return templates[Math.floor(Math.random() * templates.length)]
  }

  private generateMockVideoContent(topic?: string): string {
    const topics = topic ? [topic] : ['tech', 'news', 'politics', 'science', 'trending']
    const selectedTopic = topics[Math.floor(Math.random() * topics.length)]
    
    return `Quick take on the latest ${selectedTopic} news! You won't believe what just happened. #${selectedTopic} #viral #trending`
  }

  private generateMockName(): string {
    const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emily', 'Chris', 'Lisa', 'Tom', 'Anna']
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']
    
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`
  }

  private generateMockUsername(): string {
    const adjectives = ['happy', 'smart', 'quick', 'brave', 'cool', 'wise', 'bold', 'calm']
    const nouns = ['coder', 'writer', 'thinker', 'maker', 'dreamer', 'leader', 'expert', 'guru']
    const numbers = Math.floor(Math.random() * 9999)
    
    return `@${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${numbers}`
  }

  private generateMockHashtags(topic?: string): string[] {
    const baseHashtags = ['#news', '#trending', '#viral', '#breaking', '#discussion']
    const topicHashtags = topic ? [`#${topic}`, `#${topic}news`] : []
    
    return [...baseHashtags, ...topicHashtags].slice(0, 3)
  }

  private generateMockMentions(): string[] {
    const mentions = ['@newsoutlet', '@expert', '@analyst', '@reporter', '@journalist']
    return mentions.slice(0, Math.floor(Math.random() * 3))
  }

  /**
   * Cache management
   */
  private getFromCache(key: string): any {
    try {
      const cached = localStorage.getItem(`social_cache_${key}`)
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < this.CACHE_DURATION) {
          return data
        }
      }
    } catch (error) {
      console.error('Cache read error:', error)
    }
    return null
  }

  private setCache(key: string, data: any): void {
    try {
      localStorage.setItem(`social_cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.error('Cache write error:', error)
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('social_cache_')) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Cache clear error:', error)
    }
  }
}
