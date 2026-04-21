import axios from 'axios';
import { Article } from '../types';

// OpenAI Configuration
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_BASE_URL = import.meta.env.VITE_OPENAI_API_BASE_URL || 'https://api.openai.com/v1';

export class AIComprehensionService {
  /**
   * Analyze news article using GPT-4 for true comprehension
   */
  static async analyzeArticle(article: Article): Promise<{
    summary: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    bias: 'low' | 'medium' | 'high';
    topics: string[];
    entities: string[];
    credibility: number;
    complexity: 'simple' | 'moderate' | 'complex';
    keyPoints: string[];
    factuality: number;
  }> {
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.warn('OpenAI API key not configured, falling back to basic analysis');
      return this.fallbackAnalysis(article);
    }

    try {
      const prompt = `Analyze this news article and provide a comprehensive analysis:

Title: ${article.title}
Description: ${article.description}
Content: ${article.content}
Source: ${article.source.name}
Author: ${article.author}

Please provide analysis in the following JSON format:
{
  "summary": "Brief 2-3 sentence summary",
  "sentiment": "positive/negative/neutral",
  "bias": "low/medium/high",
  "topics": ["topic1", "topic2"],
  "entities": ["person1", "organization1", "location1"],
  "credibility": 0.0-1.0,
  "complexity": "simple/moderate/complex",
  "keyPoints": ["point1", "point2", "point3"],
  "factuality": 0.0-1.0
}`;

      const response = await axios.post(
        `${OPENAI_API_BASE_URL}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert news analyst with deep understanding of journalism, fact-checking, and media literacy. Provide objective, balanced analysis of news articles.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const analysis = JSON.parse(response.data.choices[0].message.content);
      return analysis;
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.fallbackAnalysis(article);
    }
  }

  /**
   * Extract key insights from multiple articles
   */
  static async extractInsights(articles: Article[]): Promise<{
    trendingTopics: string[];
    commonThemes: string[];
    sentimentOverview: string;
    keyEvents: string[];
  }> {
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
      return this.fallbackInsights(articles);
    }

    try {
      const articlesText = articles.map(a => 
        `Title: ${a.title}\nSource: ${a.source.name}\nContent: ${a.content.substring(0, 200)}...`
      ).join('\n\n');

      const prompt = `Analyze these ${articles.length} news articles and extract insights:

${articlesText}

Please provide analysis in JSON format:
{
  "trendingTopics": ["topic1", "topic2"],
  "commonThemes": ["theme1", "theme2"],
  "sentimentOverview": "brief sentiment analysis",
  "keyEvents": ["event1", "event2"]
}`;

      const response = await axios.post(
        `${OPENAI_API_BASE_URL}/chat/completions`,
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert news analyst who can identify patterns and insights across multiple news articles.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.fallbackInsights(articles);
    }
  }

  /**
   * Verify factual claims in article
   */
  static async verifyClaims(article: Article): Promise<{
    verifiableClaims: string[];
    potentialIssues: string[];
    confidence: number;
  }> {
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
      return {
        verifiableClaims: [],
        potentialIssues: ['AI verification not available'],
        confidence: 0
      };
    }

    try {
      const prompt = `Analyze this news article for factual claims and potential issues:

Title: ${article.title}
Content: ${article.content}

Identify specific factual claims and any potential issues with the article. Provide JSON:
{
  "verifiableClaims": ["claim1", "claim2"],
  "potentialIssues": ["issue1", "issue2"],
  "confidence": 0.0-1.0
}`;

      const response = await axios.post(
        `${OPENAI_API_BASE_URL}/chat/completions`,
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a fact-checking expert who can identify factual claims and potential issues in news articles.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      return {
        verifiableClaims: [],
        potentialIssues: ['Verification failed'],
        confidence: 0
      };
    }
  }

  /**
   * Fallback analysis when OpenAI is not available
   */
  private static fallbackAnalysis(article: Article): any {
    const text = `${article.title} ${article.description} ${article.content}`.toLowerCase();
    
    return {
      summary: article.description || article.title,
      sentiment: this.basicSentiment(text),
      bias: this.basicBias(text),
      topics: this.basicTopics(text),
      entities: [],
      credibility: 0.7,
      complexity: this.basicComplexity(text),
      keyPoints: [article.title],
      factuality: 0.6
    };
  }

  /**
   * Fallback insights extraction
   */
  private static fallbackInsights(articles: Article[]): any {
    const allTopics = articles.flatMap(a => this.basicTopics(`${a.title} ${a.description}`.toLowerCase()));
    const topicCounts = allTopics.reduce((acc, topic) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      trendingTopics: Object.keys(topicCounts).slice(0, 5),
      commonThemes: Object.keys(topicCounts).slice(0, 3),
      sentimentOverview: 'Mixed sentiment across articles',
      keyEvents: articles.slice(0, 3).map(a => a.title)
    };
  }

  private static basicSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['good', 'great', 'excellent', 'positive', 'success', 'improved', 'growth'];
    const negativeWords = ['bad', 'terrible', 'negative', 'failure', 'decline', 'crisis', 'concern'];
    
    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private static basicBias(text: string): 'low' | 'medium' | 'high' {
    const biasedPhrases = ['obviously', 'clearly', 'undoubtedly'];
    const biasedCount = biasedPhrases.filter(phrase => text.includes(phrase)).length;
    
    if (biasedCount >= 2) return 'high';
    if (biasedCount >= 1) return 'medium';
    return 'low';
  }

  private static basicTopics(text: string): string[] {
    const topics = {
      technology: ['technology', 'tech', 'software', 'ai', 'computer'],
      business: ['business', 'economy', 'market', 'finance'],
      science: ['science', 'research', 'study', 'discovery'],
      health: ['health', 'medical', 'medicine', 'disease'],
      politics: ['politics', 'government', 'policy', 'election']
    };
    
    const foundTopics: string[] = [];
    for (const [topic, keywords] of Object.entries(topics)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        foundTopics.push(topic);
      }
    }
    
    return foundTopics.length > 0 ? foundTopics : ['general'];
  }

  private static basicComplexity(text: string): 'simple' | 'moderate' | 'complex' {
    const avgWordLength = text.split(/\s+/).reduce((sum, word) => sum + word.length, 0) / text.split(/\s+/).length;
    
    if (avgWordLength < 5) return 'simple';
    if (avgWordLength < 7) return 'moderate';
    return 'complex';
  }
}
