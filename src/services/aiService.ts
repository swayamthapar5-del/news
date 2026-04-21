import { Article } from '../types'
import { AIComprehensionService } from './aiComprehensionService'

// AI-powered content analysis service
export class AIService {
  // Analyze article content for quality and relevance using true AI comprehension
  static async analyzeContent(article: Article): Promise<{
    qualityScore: number
    sentiment: 'positive' | 'negative' | 'neutral'
    bias: 'low' | 'medium' | 'high'
    topics: string[]
    readingTime: number
    complexity: 'simple' | 'moderate' | 'complex'
    summary: string
    entities: string[]
    credibility: number
    keyPoints: string[]
    factuality: number
  }> {
    try {
      // Use AI comprehension service for true understanding
      const aiAnalysis = await AIComprehensionService.analyzeArticle(article);
      
      // Calculate reading time (still use our own calculation for accuracy)
      const readingTime = this.estimateReadingTime(article.content);
      
      // Convert AI credibility to quality score
      const qualityScore = aiAnalysis.credibility;
      
      return {
        qualityScore,
        sentiment: aiAnalysis.sentiment,
        bias: aiAnalysis.bias,
        topics: aiAnalysis.topics,
        readingTime,
        complexity: aiAnalysis.complexity,
        summary: aiAnalysis.summary,
        entities: aiAnalysis.entities,
        credibility: aiAnalysis.credibility,
        keyPoints: aiAnalysis.keyPoints,
        factuality: aiAnalysis.factuality
      };
    } catch (error) {
      console.error('AI analysis failed, using fallback:', error);
      const text = `${article.title} ${article.description} ${article.content}`.toLowerCase();
      
      return {
        qualityScore: this.calculateQualityScore(article, text),
        sentiment: this.analyzeSentiment(text),
        bias: this.detectBias(text),
        topics: this.extractTopics(text),
        readingTime: this.estimateReadingTime(article.content),
        complexity: this.analyzeComplexity(text),
        summary: article.description || article.title,
        entities: [],
        credibility: 0.7,
        keyPoints: [article.title],
        factuality: 0.6
      };
    }
  }

  // Calculate quality score based on multiple factors (more lenient)
  private static calculateQualityScore(article: Article, text: string): number {
    let score = 0.6 // Higher base score

    // Title quality (more lenient)
    if (article.title.length > 10 && article.title.length < 150) score += 0.1
    if (!article.title.includes('?') && !article.title.includes('!')) score += 0.05

    // Content depth (more lenient)
    if (article.content.length > 200) score += 0.1
    if (article.content.length > 500) score += 0.1

    // Source credibility
    const credibleSources = ['reuters', 'bbc', 'ap', 'associated press', 'npr', 'pbs', 'the guardian', 'the new york times']
    if (credibleSources.some(source => article.source.name.toLowerCase().includes(source))) {
      score += 0.15
    }

    // Author presence
    if (article.author && article.author !== 'Unknown') score += 0.05

    // Factual indicators
    const factualWords = ['according to', 'study shows', 'research indicates', 'data suggests', 'report finds']
    if (factualWords.some(word => text.includes(word))) score += 0.1

    // Avoid sensationalism (less penalty)
    const sensationalWords = ['shocking', 'incredible', 'unbelievable', 'miracle', 'breakthrough']
    if (sensationalWords.some(word => text.includes(word))) score -= 0.05 // Reduced penalty

    return Math.min(Math.max(score, 0), 1)
  }

  // Simple sentiment analysis
  private static analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['good', 'great', 'excellent', 'positive', 'success', 'improved', 'growth', 'achievement']
    const negativeWords = ['bad', 'terrible', 'negative', 'failure', 'decline', 'crisis', 'disaster', 'concern']
    
    const positiveCount = positiveWords.filter(word => text.includes(word)).length
    const negativeCount = negativeWords.filter(word => text.includes(word)).length
    
    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
  }

  // Bias detection
  private static detectBias(text: string): 'low' | 'medium' | 'high' {
    const biasedPhrases = ['obviously', 'clearly', 'undoubtedly', 'without a doubt', 'everyone knows']
    const opinionWords = ['i think', 'i believe', 'in my opinion', 'it seems to me']
    const emotionalWords = ['outrageous', 'disgusting', 'amazing', 'horrifying', 'wonderful']
    
    const biasedCount = biasedPhrases.filter(phrase => text.includes(phrase)).length
    const opinionCount = opinionWords.filter(word => text.includes(word)).length
    const emotionalCount = emotionalWords.filter(word => text.includes(word)).length
    
    const totalBias = biasedCount + opinionCount + emotionalCount
    
    if (totalBias >= 3) return 'high'
    if (totalBias >= 1) return 'medium'
    return 'low'
  }

  // Extract topics from text
  private static extractTopics(text: string): string[] {
    const topics = {
      technology: ['technology', 'tech', 'software', 'ai', 'machine learning', 'computer', 'digital', 'internet'],
      business: ['business', 'economy', 'market', 'finance', 'investment', 'stocks', 'company', 'revenue'],
      science: ['science', 'research', 'study', 'discovery', 'experiment', 'data', 'analysis', 'findings'],
      health: ['health', 'medical', 'medicine', 'disease', 'treatment', 'patient', 'hospital', 'doctor'],
      politics: ['politics', 'government', 'policy', 'election', 'vote', 'democracy', 'congress', 'president'],
      environment: ['climate', 'environment', 'energy', 'sustainability', 'pollution', 'renewable', 'carbon']
    }
    
    const foundTopics: string[] = []
    
    for (const [topic, keywords] of Object.entries(topics)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        foundTopics.push(topic)
      }
    }
    
    return foundTopics
  }

  // Estimate reading time
  private static estimateReadingTime(content: string): number {
    const wordsPerMinute = 200
    const words = content.split(/\s+/).length
    return Math.ceil(words / wordsPerMinute)
  }

  // Analyze text complexity
  private static analyzeComplexity(text: string): 'simple' | 'moderate' | 'complex' {
    const avgWordLength = text.split(/\s+/).reduce((sum, word) => sum + word.length, 0) / text.split(/\s+/).length
    const sentences = text.split(/[.!?]+/).length
    const avgSentenceLength = text.split(/\s+/).length / sentences
    
    if (avgWordLength < 5 && avgSentenceLength < 15) return 'simple'
    if (avgWordLength < 7 && avgSentenceLength < 25) return 'moderate'
    return 'complex'
  }

  // Personalize content based on user preferences
  static async personalizeArticles(articles: Article[], userPreferences: {
    topics: string[]
    complexity: 'simple' | 'moderate' | 'complex'
    readingTime: number
    biasPreference: 'low' | 'medium' | 'high'
  }): Promise<Article[]> {
    const analyzedArticles = await Promise.all(
      articles.map(async article => {
        const analysis = await this.analyzeContent(article)
        
        // Calculate personalization score
        let personalizationScore = 0
        
        // Topic matching
        const topicMatches = analysis.topics.filter((topic: string) => userPreferences.topics.includes(topic)).length
        personalizationScore += topicMatches * 0.3
        
        // Complexity matching
        if (analysis.complexity === userPreferences.complexity) personalizationScore += 0.2
        
        // Reading time preference
        if (analysis.readingTime <= userPreferences.readingTime) personalizationScore += 0.2
        
        // Bias preference
        if (analysis.bias === userPreferences.biasPreference) personalizationScore += 0.1
        
        // Quality bonus
        personalizationScore += analysis.qualityScore * 0.2
        
        return {
          ...article,
          personalizationScore,
          aiAnalysis: analysis
        }
      })
    )
    
    return analyzedArticles.sort((a, b) => (b.personalizationScore || 0) - (a.personalizationScore || 0))
  }

  // Get trending topics from articles
  static async getTrendingTopics(articles: Article[]): Promise<{ topic: string; count: number; trend: 'up' | 'down' | 'stable' }[]> {
    const topicCounts: { [key: string]: number } = {}
    
    for (const article of articles) {
      const analysis = await this.analyzeContent(article)
      analysis.topics.forEach((topic: string) => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1
      })
    }
    
    return Object.entries(topicCounts)
      .map(([topic, count]) => ({
        topic,
        count,
        trend: 'stable' as 'up' | 'down' | 'stable' // In a real implementation, this would compare with historical data
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }

  // Detect breaking news
  static detectBreakingNews(articles: Article[]): Article[] {
    const breakingKeywords = ['breaking', 'urgent', 'alert', 'developing', 'just in', 'live']
    
    return articles.filter(article => {
      const text = `${article.title} ${article.description}`.toLowerCase()
      return breakingKeywords.some(keyword => text.includes(keyword))
    })
  }
}
