import axios from 'axios';
import { Article } from '../types';

// Twitter/X API Configuration
const TWITTER_API_KEY = import.meta.env.VITE_TWITTER_API_KEY;
const TWITTER_API_SECRET = import.meta.env.VITE_TWITTER_API_SECRET;
const TWITTER_BEARER_TOKEN = import.meta.env.VITE_TWITTER_BEARER_TOKEN;
const TWITTER_API_BASE_URL = import.meta.env.VITE_TWITTER_API_BASE_URL || 'https://api.x.com/2';

// News accounts to follow for news tweets
const NEWS_ACCOUNTS = [
  'BBCBreaking',
  'CNN',
  'Reuters',
  'AP',
  'BBCWorld',
  'NBCNews',
  'guardian',
  'NYTimes',
  'WSJ',
  'FT',
  'TheEconomist',
  'bloomberg',
  'ReutersTech',
  'TechCrunch',
  'wired',
  'verge'
];

export class TwitterService {
  private static instance: TwitterService;
  private bearerToken: string | null = null;

  static getInstance(): TwitterService {
    if (!TwitterService.instance) {
      TwitterService.instance = new TwitterService();
    }
    return TwitterService.instance;
  }

  private async getBearerToken(): Promise<string> {
    if (this.bearerToken && TWITTER_BEARER_TOKEN) {
      return TWITTER_BEARER_TOKEN;
    }

    if (!TWITTER_API_KEY || !TWITTER_API_SECRET) {
      throw new Error('Twitter API credentials not configured');
    }

    try {
      const response = await axios.post(
        'https://api.twitter.com/oauth2/token',
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${TWITTER_API_KEY}:${TWITTER_API_SECRET}`)}`
          }
        }
      );

      this.bearerToken = response.data.access_token;
      return this.bearerToken || '';
    } catch (error) {
      console.error('Failed to get Twitter bearer token:', error);
      throw error;
    }
  }

  /**
   * Fetch trending topics from Twitter/X
   */
  async getTrendingTopics(woeId: number = 1): Promise<any[]> {
    try {
      const token = await this.getBearerToken();
      
      const response = await axios.get(
        `${TWITTER_API_BASE_URL}/trends/place.json?id=${woeId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data[0]?.trends || [];
    } catch (error) {
      console.error('Failed to fetch trending topics:', error);
      return [];
    }
  }

  /**
   * Fetch recent tweets from news accounts
   */
  async getNewsTweets(count: number = 50): Promise<Article[]> {
    try {
      const token = await this.getBearerToken();
      const articles: Article[] = [];

      // Fetch tweets from each news account
      for (const account of NEWS_ACCOUNTS.slice(0, 5)) { // Limit to 5 accounts to avoid rate limits
        try {
          const response = await axios.get(
            `${TWITTER_API_BASE_URL}/users/by/username/${account}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );

          const userId = response.data.data?.id;
          if (!userId) continue;

          // Fetch user timeline
          const tweetsResponse = await axios.get(
            `${TWITTER_API_BASE_URL}/users/${userId}/tweets?max_results=${count}&tweet.fields=created_at,public_metrics,entities,author_id&expansions=author_id&user.fields=name,username,verified,profile_image_url`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );

          const tweets = tweetsResponse.data.data || [];
          const users = tweetsResponse.data.includes?.users || [];

          for (const tweet of tweets) {
            const author = users.find((u: any) => u.id === tweet.author_id);
            if (!author) continue;

            articles.push(this.convertTweetToArticle(tweet, author));
          }
        } catch (error) {
          console.error(`Failed to fetch tweets from ${account}:`, error);
        }
      }

      return articles;
    } catch (error) {
      console.error('Failed to fetch news tweets:', error);
      return [];
    }
  }

  /**
   * Search for tweets containing specific keywords
   */
  async searchTweets(query: string, count: number = 50): Promise<Article[]> {
    try {
      const token = await this.getBearerToken();
      
      const response = await axios.get(
        `${TWITTER_API_BASE_URL}/search/recent?query=${encodeURIComponent(query)}&max_results=${count}&tweet.fields=created_at,public_metrics,entities,author_id&expansions=author_id&user.fields=name,username,verified,profile_image_url`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const tweets = response.data.data || [];
      const users = response.data.includes?.users || [];

      return tweets.map((tweet: any) => {
        const author = users.find((u: any) => u.id === tweet.author_id);
        return this.convertTweetToArticle(tweet, author);
      });
    } catch (error) {
      console.error('Failed to search tweets:', error);
      return [];
    }
  }

  /**
   * Convert Twitter tweet to Article format
   */
  private convertTweetToArticle(tweet: any, author: any): Article {
    const text = tweet.text || '';
    const urls = tweet.entities?.urls || [];
    
    // Extract first URL if available
    const firstUrl = urls[0]?.expanded_url || `https://x.com/${author?.username}/status/${tweet.id}`;

    return {
      id: `twitter-${tweet.id}`,
      title: this.extractTitle(text),
      description: text,
      content: text,
      url: firstUrl,
      imageUrl: author?.profile_image_url || undefined,
      publishedAt: tweet.created_at || new Date().toISOString(),
      source: {
        name: `Twitter/X - @${author?.username || 'unknown'}`,
        url: `https://x.com/${author?.username || 'unknown'}`
      },
      author: author?.name || author?.username || 'Unknown',
      category: this.categorizeTweet(text)
    };
  }

  /**
   * Extract title from tweet text
   */
  private extractTitle(text: string): string {
    // Remove URLs and mentions, take first 100 chars
    const cleaned = text
      .replace(/https?:\/\/[^\s]+/g, '')
      .replace(/@[^\s]+/g, '')
      .trim();
    
    return cleaned.length > 100 ? cleaned.substring(0, 100) + '...' : cleaned;
  }

  /**
   * Categorize tweet based on keywords
   */
  private categorizeTweet(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('tech') || lowerText.includes('ai') || lowerText.includes('software')) {
      return 'technology';
    }
    if (lowerText.includes('business') || lowerText.includes('market') || lowerText.includes('economy')) {
      return 'business';
    }
    if (lowerText.includes('politic') || lowerText.includes('government') || lowerText.includes('election')) {
      return 'politics';
    }
    if (lowerText.includes('health') || lowerText.includes('medical') || lowerText.includes('covid')) {
      return 'health';
    }
    if (lowerText.includes('sport') || lowerText.includes('game') || lowerText.includes('football')) {
      return 'sports';
    }
    
    return 'general';
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      configured: !!(TWITTER_API_KEY || TWITTER_BEARER_TOKEN),
      hasBearerToken: !!this.bearerToken,
      newsAccountsCount: NEWS_ACCOUNTS.length
    };
  }
}
