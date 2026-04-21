import { Article } from '../types'
import { trainFakeNewsDetectorWithDataset } from '../utils/datasetManager'

export interface VerificationResult {
  isVerified: boolean
  credibilityScore: number // 0-100
  confidence: number // 0-100
  riskLevel: 'low' | 'medium' | 'high'
  sourceReliability: number // 0-100
  contentAnalysis: {
    sensationalismScore: number
    factualityScore: number
    biasScore: number
  }
  redFlags: string[]
  greenFlags: string[]
  explanation: string
  recommendations: string[]
}

export class NewsVerificationService {
  private static instance: NewsVerificationService
  private readonly TRUSTED_SOURCES = [
    'reuters.com',
    'apnews.com',
    'bbc.com',
    'npr.org',
    'wsj.com',
    'nytimes.com',
    'washingtonpost.com',
    'theguardian.com',
    'economist.com',
    'ft.com',
    'bloomberg.com',
    'cnbc.com',
    'cnn.com',
    'nbcnews.com',
    'abcnews.go.com',
    'cbsnews.com',
    'usatoday.com',
    'latimes.com',
    'chicagotribune.com',
    'bostonglobe.com',
    'seattletimes.com'
  ]

  private readonly QUESTIONABLE_SOURCES = [
    'infowars.com',
    'breitbart.com',
    'thedailystormer.com',
    'zerohedge.com',
    'naturalnews.com',
    'prisonplanet.com',
    'beforeitsnews.com',
    'yournewswire.com',
    'worldnewsdailyreport.com',
    'newstarget.com'
  ]

  private readonly SENSATIONAL_KEYWORDS = [
    'shocking', 'unbelievable', 'mind-blowing', 'incredible', 'amazing',
    'secret', 'hidden', 'conspiracy', 'cover-up', 'scandal',
    'breakthrough', 'revolutionary', 'game-changing', 'miracle',
    'exclusive', 'never before seen', 'revealed', 'exposed',
    'warning', 'alert', 'danger', 'threat', 'crisis',
    'outrageous', 'insane', 'crazy', 'unbelievable'
  ]

  private readonly CLICKBAIT_PHRASES = [
    'you won\'t believe',
    'what happens next',
    'the truth about',
    'they don\'t want you to know',
    'must see',
    'click here',
    'read this',
    'share this',
    'viral',
    'breaking news',
    'urgent',
    'immediate action required'
  ]

  static getInstance(): NewsVerificationService {
    if (!NewsVerificationService.instance) {
      NewsVerificationService.instance = new NewsVerificationService()
      // Train fake news detector with dataset on first initialization
      const hasTrained = localStorage.getItem('fakeNewsDatasetTrained');
      if (!hasTrained) {
        trainFakeNewsDetectorWithDataset();
        localStorage.setItem('fakeNewsDatasetTrained', 'true');
      }
    }
    return NewsVerificationService.instance
  }

  /**
   * Verify news article authenticity
   */
  async verifyArticle(article: Article): Promise<VerificationResult> {
    const sourceReliability = this.analyzeSourceReliability(article.source.url)
    const contentAnalysis = this.analyzeContent(article)
    const credibilityScore = this.calculateCredibilityScore(sourceReliability, contentAnalysis)
    const riskLevel = this.determineRiskLevel(credibilityScore)
    const redFlags = this.identifyRedFlags(article, contentAnalysis)
    const greenFlags = this.identifyGreenFlags(article, contentAnalysis)
    const explanation = this.generateExplanation(credibilityScore, riskLevel, redFlags, greenFlags)
    const recommendations = this.generateRecommendations(riskLevel, redFlags)

    return {
      isVerified: credibilityScore >= 60,
      credibilityScore,
      confidence: this.calculateConfidence(sourceReliability, contentAnalysis),
      riskLevel,
      sourceReliability,
      contentAnalysis,
      redFlags,
      greenFlags,
      explanation,
      recommendations
    }
  }

  /**
   * Analyze source reliability
   */
  private analyzeSourceReliability(sourceUrl: string): number {
    if (!sourceUrl) return 50 // Neutral score if no source URL

    const domain = this.extractDomain(sourceUrl).toLowerCase()
    
    // Trusted sources
    if (this.TRUSTED_SOURCES.some(trusted => domain.includes(trusted))) {
      return 85 + Math.random() * 10 // 85-95
    }

    // Questionable sources
    if (this.QUESTIONABLE_SOURCES.some(questionable => domain.includes(questionable))) {
      return 10 + Math.random() * 10 // 10-20
    }

    // Check for common news indicators
    const newsIndicators = ['news', 'press', 'media', 'journal', 'report', 'times', 'post', 'gazette']
    const hasNewsIndicators = newsIndicators.some(indicator => domain.includes(indicator))
    
    if (hasNewsIndicators) {
      return 60 + Math.random() * 15 // 60-75
    }

    // Check for government/educational domains
    if (domain.endsWith('.gov') || domain.endsWith('.edu')) {
      return 80 + Math.random() * 10 // 80-90
    }

    // Check for blog/personal sites
    if (domain.includes('blog') || domain.includes('wordpress') || domain.includes('blogspot')) {
      return 30 + Math.random() * 15 // 30-45
    }

    // Default for unknown sources
    return 40 + Math.random() * 20 // 40-60
  }

  /**
   * Analyze content for authenticity indicators
   */
  private analyzeContent(article: Article): {
    sensationalismScore: number
    factualityScore: number
    biasScore: number
  } {
    const text = `${article.title} ${article.description} ${article.content}`.toLowerCase()
    
    const sensationalismScore = this.calculateSensationalismScore(text)
    const factualityScore = this.calculateFactualityScore(text)
    const biasScore = this.calculateBiasScore(text)

    return {
      sensationalismScore,
      factualityScore,
      biasScore
    }
  }

  /**
   * Calculate sensationalism score
   */
  private calculateSensationalismScore(text: string): number {
    let score = 0

    // Check for sensational keywords
    const sensationalWords = this.SENSATIONAL_KEYWORDS.filter(keyword => text.includes(keyword))
    score += sensationalWords.length * 5

    // Check for clickbait phrases
    const clickbaitPhrases = this.CLICKBAIT_PHRASES.filter(phrase => text.includes(phrase))
    score += clickbaitPhrases.length * 8

    // Check for excessive punctuation
    const exclamationCount = (text.match(/!/g) || []).length
    score += Math.min(exclamationCount * 2, 10)

    // Check for all caps
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length
    if (capsRatio > 0.3) score += 10

    // Check for emotional language
    const emotionalWords = ['angry', 'furious', 'outraged', 'shocked', 'horrified', 'disgusted']
    const emotionalCount = emotionalWords.filter(word => text.includes(word)).length
    score += emotionalCount * 3

    return Math.min(score, 100)
  }

  /**
   * Calculate factuality score
   */
  private calculateFactualityScore(text: string): number {
    let score = 50 // Base score

    // Check for specific numbers and data
    const hasNumbers = /\d+/.test(text)
    if (hasNumbers) score += 10

    // Check for quotes and sources
    const hasQuotes = /["'].*["']/.test(text)
    if (hasQuotes) score += 8

    // Check for attribution
    const attributionWords = ['according to', 'said', 'stated', 'reported', 'announced']
    const hasAttribution = attributionWords.some(word => text.includes(word))
    if (hasAttribution) score += 12

    // Check for dates and times
    const hasDates = /\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4}|january|february|march|april|may|june|july|august|september|october|november|december/.test(text)
    if (hasDates) score += 8

    // Check for locations
    const locationWords = ['city', 'state', 'country', 'street', 'avenue', 'road']
    const hasLocations = locationWords.some(word => text.includes(word))
    if (hasLocations) score += 5

    // Check for official titles
    const officialTitles = ['president', 'senator', 'representative', 'governor', 'mayor', 'ceo', 'director']
    const hasOfficialTitles = officialTitles.some(title => text.includes(title))
    if (hasOfficialTitles) score += 7

    return Math.min(score, 100)
  }

  /**
   * Calculate bias score
   */
  private calculateBiasScore(text: string): number {
    let score = 0

    // Check for strongly biased language
    const biasedWords = ['liberal', 'conservative', 'right-wing', 'left-wing', 'radical', 'extremist']
    const biasedCount = biasedWords.filter(word => text.includes(word)).length
    score += biasedCount * 10

    // Check for us vs them language
    const usVsThemWords = ['they', 'them', 'those people', 'the other side']
    const usVsThemCount = usVsThemWords.filter(word => text.includes(word)).length
    score += usVsThemCount * 5

    // Check for absolute statements
    const absoluteWords = ['always', 'never', 'all', 'none', 'every', 'only']
    const absoluteCount = absoluteWords.filter(word => text.includes(word)).length
    score += Math.min(absoluteCount * 2, 15)

    return Math.min(score, 100)
  }

  /**
   * Calculate overall credibility score
   */
  private calculateCredibilityScore(
    sourceReliability: number,
    contentAnalysis: { sensationalismScore: number; factualityScore: number; biasScore: number }
  ): number {
    const sourceWeight = 0.4
    const sensationalismWeight = 0.2
    const factualityWeight = 0.3
    const biasWeight = 0.1

    const sensationalismImpact = Math.max(0, 100 - contentAnalysis.sensationalismScore)
    const biasImpact = Math.max(0, 100 - contentAnalysis.biasScore)

    return (
      sourceReliability * sourceWeight +
      sensationalismImpact * sensationalismWeight +
      contentAnalysis.factualityScore * factualityWeight +
      biasImpact * biasWeight
    )
  }

  /**
   * Determine risk level
   */
  private determineRiskLevel(credibilityScore: number): 'low' | 'medium' | 'high' {
    if (credibilityScore >= 70) return 'low'
    if (credibilityScore >= 40) return 'medium'
    return 'high'
  }

  /**
   * Identify red flags
   */
  private identifyRedFlags(
    article: Article,
    contentAnalysis: { sensationalismScore: number; factualityScore: number; biasScore: number }
  ): string[] {
    const redFlags: string[] = []

    if (contentAnalysis.sensationalismScore > 60) {
      redFlags.push('High sensationalism detected')
    }

    if (contentAnalysis.factualityScore < 40) {
      redFlags.push('Low factual content')
    }

    if (contentAnalysis.biasScore > 60) {
      redFlags.push('Strong bias detected')
    }

    if (article.title.length > 100) {
      redFlags.push('Unusually long title')
    }

    if (article.description && article.description.length < 50) {
      redFlags.push('Very short description')
    }

    if (!article.author || article.author === 'Unknown') {
      redFlags.push('No author specified')
    }

    return redFlags
  }

  /**
   * Identify green flags
   */
  private identifyGreenFlags(
    article: Article,
    contentAnalysis: { sensationalismScore: number; factualityScore: number; biasScore: number }
  ): string[] {
    const greenFlags: string[] = []

    if (this.TRUSTED_SOURCES.some(source => article.source.url.includes(source))) {
      greenFlags.push('From trusted news source')
    }

    if (contentAnalysis.sensationalismScore < 30) {
      greenFlags.push('Low sensationalism')
    }

    if (contentAnalysis.factualityScore > 70) {
      greenFlags.push('High factual content')
    }

    if (contentAnalysis.biasScore < 30) {
      greenFlags.push('Low bias detected')
    }

    if (article.author && article.author !== 'Unknown') {
      greenFlags.push('Author specified')
    }

    return greenFlags
  }

  /**
   * Generate explanation
   */
  private generateExplanation(
    credibilityScore: number,
    riskLevel: 'low' | 'medium' | 'high',
    redFlags: string[],
    greenFlags: string[]
  ): string {
    const riskDescriptions = {
      low: 'This article appears to be reliable and well-sourced.',
      medium: 'This article has some concerning elements but may still be credible.',
      high: 'This article shows multiple signs of being unreliable or potentially fake.'
    }

    let explanation = `${riskDescriptions[riskLevel]} `

    if (greenFlags.length > 0) {
      explanation += `Positive indicators: ${greenFlags.join(', ')}. `
    }

    if (redFlags.length > 0) {
      explanation += `Concerns: ${redFlags.join(', ')}. `
    }

    explanation += `Overall credibility score: ${Math.round(credibilityScore)}/100.`

    return explanation
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(riskLevel: 'low' | 'medium' | 'high', redFlags: string[]): string[] {
    const recommendations: string[] = []

    if (riskLevel === 'high') {
      recommendations.push('Verify this information from multiple reliable sources')
      recommendations.push('Be cautious about sharing this article')
      recommendations.push('Look for official statements or data')
    } else if (riskLevel === 'medium') {
      recommendations.push('Cross-check with other news sources')
      recommendations.push('Consider the source\'s reputation')
      recommendations.push('Look for supporting evidence')
    } else {
      recommendations.push('This appears to be a reliable source')
      recommendations.push('Consider sharing with confidence')
    }

    if (redFlags.includes('High sensationalism detected')) {
      recommendations.push('Be wary of emotional language and exaggeration')
    }

    if (redFlags.includes('Low factual content')) {
      recommendations.push('Look for more data and specific details')
    }

    return recommendations
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(
    sourceReliability: number,
    contentAnalysis: { sensationalismScore: number; factualityScore: number; biasScore: number }
  ): number {
    // Higher confidence when source is well-known and content analysis is clear
    const sourceConfidence = sourceReliability > 70 ? 80 : sourceReliability > 40 ? 60 : 40
    const contentConfidence = Math.abs(contentAnalysis.factualityScore - 50) > 20 ? 70 : 50
    
    return (sourceConfidence + contentConfidence) / 2
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname
    } catch {
      return url
    }
  }

  /**
   * Batch verify multiple articles
   */
  async verifyMultipleArticles(articles: Article[]): Promise<VerificationResult[]> {
    const results = await Promise.all(
      articles.map(article => this.verifyArticle(article))
    )
    return results
  }

  /**
   * Get verification statistics
   */
  getVerificationStats(results: VerificationResult[]) {
    const verified = results.filter(r => r.isVerified).length
    const highRisk = results.filter(r => r.riskLevel === 'high').length
    const mediumRisk = results.filter(r => r.riskLevel === 'medium').length
    const lowRisk = results.filter(r => r.riskLevel === 'low').length
    const averageScore = results.reduce((sum, r) => sum + r.credibilityScore, 0) / results.length

    return {
      total: results.length,
      verified,
      unverified: results.length - verified,
      highRisk,
      mediumRisk,
      lowRisk,
      averageScore: Math.round(averageScore),
      verificationRate: Math.round((verified / results.length) * 100)
    }
  }
}
