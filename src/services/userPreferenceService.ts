// User preference learning and personalization service
export class UserPreferenceService {
  private static readonly STORAGE_KEY = 'news-platform-preferences'
  
  // Default user preferences
  private static defaultPreferences = {
    topics: ['technology', 'business', 'science'],
    complexity: 'moderate' as 'simple' | 'moderate' | 'complex',
    readingTime: 5,
    biasPreference: 'low' as 'low' | 'medium' | 'high',
    preferredSources: ['reuters', 'bbc', 'ap'],
    readingHistory: [] as string[],
    searchHistory: [] as string[],
    articleInteractions: {} as { [articleId: string]: { read: boolean; bookmarked: boolean; shared: boolean; timeSpent: number } },
    sessionStartTime: Date.now(),
    dailyReadingGoal: 10,
    notificationSettings: {
      breakingNews: true,
      trendingTopics: false,
      personalizedDigest: true
    }
  }

  // Get user preferences
  static getPreferences() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return { ...this.defaultPreferences, ...parsed }
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
    }
    return this.defaultPreferences
  }

  // Save user preferences
  static savePreferences(preferences: any) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences))
    } catch (error) {
      console.error('Error saving preferences:', error)
    }
  }

  // Track article interaction
  static trackArticleInteraction(articleId: string, interaction: {
    read?: boolean
    bookmarked?: boolean
    shared?: boolean
    timeSpent?: number
  }) {
    const preferences = this.getPreferences()
    const current = preferences.articleInteractions[articleId] || { read: false, bookmarked: false, shared: false, timeSpent: 0 }
    
    preferences.articleInteractions[articleId] = {
      ...current,
      ...interaction,
      lastInteraction: Date.now()
    }
    
    this.savePreferences(preferences)
    this.updatePreferencesBasedOnBehavior(articleId, interaction)
  }

  // Update preferences based on user behavior
  private static updatePreferencesBasedOnBehavior(articleId: string, interaction: any) {
    const preferences = this.getPreferences()
    
    // Update reading history
    if (interaction.read && !preferences.readingHistory.includes(articleId)) {
      preferences.readingHistory.push(articleId)
      // Keep only last 100 articles in history
      if (preferences.readingHistory.length > 100) {
        preferences.readingHistory = preferences.readingHistory.slice(-100)
      }
    }
    
    // Learn from reading patterns
    this.analyzeReadingPatterns(preferences)
    
    this.savePreferences(preferences)
  }

  // Analyze reading patterns to update preferences
  private static analyzeReadingPatterns(preferences: any) {
    const recentArticles = preferences.readingHistory.slice(-20)
    if (recentArticles.length < 5) return // Not enough data
    
    // This would analyze article metadata to update preferences
    // For now, we'll keep the existing preferences
  }

  // Add to search history
  static addToSearchHistory(query: string) {
    const preferences = this.getPreferences()
    
    if (!preferences.searchHistory.includes(query)) {
      preferences.searchHistory.unshift(query)
      // Keep only last 50 searches
      if (preferences.searchHistory.length > 50) {
        preferences.searchHistory = preferences.searchHistory.slice(0, 50)
      }
      
      this.savePreferences(preferences)
    }
  }

  // Get personalized recommendations
  static getPersonalizedRecommendations(articles: any[], count: number = 10) {
    const preferences = this.getPreferences()
    
    // Score articles based on user preferences
    const scoredArticles = articles.map(article => {
      let score = 0
      
      // Topic relevance
      if (article.topics) {
        const topicMatches = article.topics.filter((topic: string) => 
          preferences.topics.includes(topic)
        ).length
        score += topicMatches * 0.3
      }
      
      // Source preference
      if (preferences.preferredSources.some((source: string) => 
        article.source.name.toLowerCase().includes(source.toLowerCase())
      )) {
        score += 0.2
      }
      
      // Reading time preference
      if (article.readingTime && article.readingTime <= preferences.readingTime) {
        score += 0.1
      }
      
      // Avoid recently read articles
      if (!preferences.readingHistory.includes(article.id)) {
        score += 0.1
      }
      
      return { ...article, recommendationScore: score }
    })
    
    return scoredArticles
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, count)
  }

  // Get reading statistics
  static getReadingStats() {
    const preferences = this.getPreferences()
    const interactions = Object.values(preferences.articleInteractions)
    
    const stats = {
      totalArticlesRead: interactions.filter((i: any) => i.read).length,
      totalBookmarks: interactions.filter((i: any) => i.bookmarked).length,
      totalShares: interactions.filter((i: any) => i.shared).length,
      averageReadingTime: interactions.reduce((sum: number, i: any) => sum + (i.timeSpent || 0), 0) / interactions.length || 0,
      readingStreak: this.calculateReadingStreak(preferences.readingHistory),
      dailyProgress: this.calculateDailyProgress(preferences)
    }
    
    return stats
  }

  // Calculate reading streak
  private static calculateReadingStreak(readingHistory: string[]) {
    // Simplified streak calculation
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
    
    const hasReadToday = readingHistory.some(id => {
      const interaction = this.getPreferences().articleInteractions[id]
      return interaction?.read && new Date(interaction.lastInteraction || 0).toDateString() === today
    })
    
    const hasReadYesterday = readingHistory.some(id => {
      const interaction = this.getPreferences().articleInteractions[id]
      return interaction?.read && new Date(interaction.lastInteraction || 0).toDateString() === yesterday
    })
    
    if (hasReadToday) return hasReadYesterday ? 2 : 1
    return 0
  }

  // Calculate daily reading progress
  private static calculateDailyProgress(preferences: any) {
    const today = new Date().toDateString()
    const todayRead = Object.values(preferences.articleInteractions).filter((interaction: any) => 
      interaction.read && new Date(interaction.lastInteraction || 0).toDateString() === today
    ).length
    
    return {
      read: todayRead,
      goal: preferences.dailyReadingGoal,
      percentage: Math.min((todayRead / preferences.dailyReadingGoal) * 100, 100)
    }
  }

  // Update notification settings
  static updateNotificationSettings(settings: any) {
    const preferences = this.getPreferences()
    preferences.notificationSettings = { ...preferences.notificationSettings, ...settings }
    this.savePreferences(preferences)
  }

  // Reset preferences to default
  static resetPreferences() {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  // Export preferences for backup
  static exportPreferences() {
    const preferences = this.getPreferences()
    return JSON.stringify(preferences, null, 2)
  }

  // Import preferences from backup
  static importPreferences(preferencesJson: string) {
    try {
      const preferences = JSON.parse(preferencesJson)
      this.savePreferences(preferences)
      return true
    } catch (error) {
      console.error('Error importing preferences:', error)
      return false
    }
  }
}
