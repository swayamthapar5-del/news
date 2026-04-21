import { Article } from '../types';
import { AIComprehensionService } from './aiComprehensionService';
import { debugLog } from '../utils/logger';

export class ContentFilterService {
  // Celebrity-related keywords to filter out
  private static celebrityKeywords = [
    'celebrity', 'celebrities', 'famous people', 'hollywood', 'bollywood',
    'actor', 'actress', 'singer', 'rapper', 'musician', 'influencer',
    'gossip', 'red carpet', 'premiere', 'awards show', 'paparazzi',
    'entertainment news', 'reality tv', 'reality show', 'dating show',
    'celebrity breakup', 'celebrity wedding', 'celebrity baby',
    'celebrity divorce', 'celebrity lifestyle', 'celebrity fashion',
    'box office', 'movie premiere'
  ];

  // Hard-block terms: one hit is enough to remove article
  private static celebrityHardBlockKeywords = [
    'celebrity gossip', 'paparazzi', 'red carpet', 'celebrity scandal',
    'reality show', 'dating show', 'celebrity breakup', 'celebrity wedding',
    'celebrity divorce', 'influencer drama', 'entertainment tonight',
    'tmz', 'people magazine', 'us weekly', 'e! news'
  ];

  private static celebrityCategoryKeywords = [
    'entertainment', 'celebrity', 'gossip', 'showbiz', 'lifestyle'
  ];

  private static celebritySourceKeywords = [
    'tmz', 'e! news', 'people', 'us weekly', 'entertainment tonight',
    'buzzfeed celeb', 'hollywood life', 'just jared', 'perezhilton',
    'pagesix', 'page six', 'hello! magazine', 'radaronline'
  ];

  // Fake news indicators
  private static fakeNewsIndicators = [
    'clickbait', 'you won\'t believe', 'shocking truth', 'secret revealed',
    'mainstream media won\'t tell you', 'they don\'t want you to know',
    'conspiracy', 'cover up', 'hidden truth', 'mind-blowing',
    'experts say' + ' (without attribution)',
    'breaking' + ' (without verification)',
    'confirmed' + ' (without sources)',
    'exclusive' + ' (without credibility)',
    'miracle cure', 'instant results', 'guaranteed',
    'one weird trick', 'doctors hate him', 'shocking discovery',
    'banned', 'censored', 'mainstream media ignores',
    'truth about', 'what they\'re hiding', 'exposed',
    'wake up sheeple', 'sheep', 'mainstream narrative',
    'false flag', 'hoax', 'staged', 'crisis actor'
  ];

  // Low-credibility sources
  private static lowCredibilitySources = [
    'infowars', 'breitbart', 'daily stormer', 'natural news',
    'prison planet', 'sputnik', 'rt.com', 'press tv',
    'the daily caller', 'the blaze', 'newsmax', 'oan',
    'world net daily', 'life site news', 'zero hedge'
  ];

  /**
   * Check if article should be filtered out
   */
  static shouldFilterArticle(article: Article): {
    shouldFilter: boolean;
    reason: string;
  } {
    const text = this.getArticleText(article);
    const sourceText = this.getSourceText(article);

    // Hard blocks for celebrity-only content
    if (this.isCelebrityHardBlock(text, sourceText, article)) {
      return {
        shouldFilter: true,
        reason: 'Celebrity content (hard block)'
      };
    }
    
    // Check for celebrity content
    const celebrityScore = this.checkCelebrityContent(text, article);
    if (celebrityScore >= 0.45) {
      return {
        shouldFilter: true,
        reason: `Celebrity content (score: ${celebrityScore.toFixed(2)})`
      };
    }

    // Check for fake news indicators
    const fakeNewsScore = this.checkFakeNewsIndicators(text, article);
    if (fakeNewsScore > 0.7) {
      return {
        shouldFilter: true,
        reason: 'Potential fake news'
      };
    }

    // Check for low-credibility sources
    if (this.isLowCredibilitySource(article.source.name)) {
      return {
        shouldFilter: true,
        reason: 'Low credibility source'
      };
    }

    return {
      shouldFilter: false,
      reason: ''
    };
  }

  /**
   * Check for celebrity content using AI if available
   */
  static async shouldFilterArticleWithAI(article: Article): Promise<{
    shouldFilter: boolean;
    reason: string;
  }> {
    try {
      const aiAnalysis = await AIComprehensionService.analyzeArticle(article);
      
      // Use AI credibility assessment
      if (aiAnalysis.credibility < 0.4) {
        return {
          shouldFilter: true,
          reason: 'Low AI credibility score'
        };
      }

      // Check AI factuality
      if (aiAnalysis.factuality < 0.5) {
        return {
          shouldFilter: true,
          reason: 'Low factuality score'
        };
      }

      // Check for entertainment/celebrity topics in AI analysis
      const entertainmentTopics = ['entertainment', 'celebrity', 'gossip', 'lifestyle'];
      if (aiAnalysis.topics.some(topic => entertainmentTopics.includes(topic.toLowerCase()))) {
        return {
          shouldFilter: true,
          reason: 'Entertainment/celebrity content detected by AI'
        };
      }

    } catch (error) {
      console.error('AI filtering failed, using basic filtering:', error);
    }

    // Fallback to basic filtering
    return this.shouldFilterArticle(article);
  }

  /**
   * Filter articles using both AI and basic filtering
   */
  static async filterArticles(articles: Article[]): Promise<Article[]> {
    const filteredArticles: Article[] = [];
    
    for (const article of articles) {
      const filterResult = await this.shouldFilterArticleWithAI(article);
      if (!filterResult.shouldFilter) {
        filteredArticles.push(article);
      } else {
        debugLog(`Filtered article: ${article.title} - Reason: ${filterResult.reason}`);
      }
    }
    
    return filteredArticles;
  }

  /**
   * Check celebrity content score
   */
  private static checkCelebrityContent(text: string, article: Article): number {
    let score = 0;
    
    // Check for celebrity keywords
    const keywordMatches = this.celebrityKeywords.filter(keyword => text.includes(keyword)).length;
    
    if (keywordMatches >= 3) score += 0.55;
    else if (keywordMatches >= 2) score += 0.4;
    else if (keywordMatches >= 1) score += 0.2;
    
    // Check for celebrity-focused categories
    const category = (article.category || '').toLowerCase();
    if (this.celebrityCategoryKeywords.includes(category)) {
      score += 0.35;
    }
    
    // Check for celebrity-focused sources
    const sourceText = this.getSourceText(article);
    if (this.celebritySourceKeywords.some(source => sourceText.includes(source))) {
      score += 0.45;
    }
    
    return Math.min(score, 1);
  }

  /**
   * Check fake news indicators
   */
  private static checkFakeNewsIndicators(text: string, article: Article): number {
    let score = 0;
    
    // Check for fake news keywords
    const keywordMatches = this.fakeNewsIndicators.filter(keyword => 
      text.includes(keyword)
    ).length;
    
    if (keywordMatches >= 3) score += 0.5;
    if (keywordMatches >= 2) score += 0.3;
    if (keywordMatches >= 1) score += 0.1;
    
    // Check for sensationalist language
    const sensationalistWords = ['shocking', 'incredible', 'unbelievable', 'miracle', 'explosive'];
    const sensationalistCount = sensationalistWords.filter(word => text.includes(word)).length;
    if (sensationalistCount >= 2) score += 0.3;
    
    // Check for lack of credible sources
    if (!article.author || article.author === 'Unknown') score += 0.1;
    if (!article.content || article.content.length < 100) score += 0.2;
    
    return Math.min(score, 1);
  }

  /**
   * Check if source has low credibility
   */
  private static isLowCredibilitySource(sourceName: string): boolean {
    return this.lowCredibilitySources.some(source => 
      sourceName.toLowerCase().includes(source)
    );
  }

  private static getArticleText(article: Article): string {
    return `${article.title || ''} ${article.description || ''} ${article.content || ''}`.toLowerCase();
  }

  private static getSourceText(article: Article): string {
    return `${article.source?.name || ''} ${article.source?.url || ''} ${article.url || ''}`.toLowerCase();
  }

  private static isCelebrityHardBlock(text: string, sourceText: string, article: Article): boolean {
    const category = (article.category || '').toLowerCase();

    if (this.celebrityCategoryKeywords.includes(category)) {
      return true;
    }

    if (this.celebritySourceKeywords.some(source => sourceText.includes(source))) {
      return true;
    }

    return this.celebrityHardBlockKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Get filter statistics
   */
  static getFilterStatistics(originalCount: number, filteredCount: number): {
    totalFiltered: number;
    filterRate: number;
    remainingCount: number;
  } {
    const totalFiltered = originalCount - filteredCount;
    const filterRate = (totalFiltered / originalCount) * 100;
    
    return {
      totalFiltered,
      filterRate: Math.round(filterRate * 10) / 10,
      remainingCount: filteredCount
    };
  }
}
