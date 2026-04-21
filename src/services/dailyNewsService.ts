import { Article } from '../types';

interface DailyNewsData {
  date: string; // YYYY-MM-DD format
  articles: Article[];
  timestamp: number;
}

export class DailyNewsService {
  private static readonly STORAGE_KEY = 'daily_news_archive';
  private static readonly MAX_DAYS_TO_STORE = 30; // Keep last 30 days

  /**
   * Save today's news to storage
   */
  static saveDailyNews(articles: Article[]): void {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const existingArchive = this.getArchive();
      
      const dailyData: DailyNewsData = {
        date: today,
        articles: articles,
        timestamp: Date.now()
      };

      // Remove existing entry for today if any
      const filteredArchive = existingArchive.filter(entry => entry.date !== today);
      
      // Add today's news
      filteredArchive.push(dailyData);

      // Keep only last 30 days
      const sortedArchive = filteredArchive
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, this.MAX_DAYS_TO_STORE);

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sortedArchive));
      console.log(`Saved ${articles.length} articles for ${today}`);
    } catch (error) {
      console.error('Error saving daily news:', error);
    }
  }

  /**
   * Get news for a specific date
   */
  static getNewsForDate(date: string): Article[] {
    try {
      const archive = this.getArchive();
      const entry = archive.find(entry => entry.date === date);
      return entry?.articles || [];
    } catch (error) {
      console.error('Error getting news for date:', error);
      return [];
    }
  }

  /**
   * Get all archived dates
   */
  static getAvailableDates(): string[] {
    try {
      const archive = this.getArchive();
      return archive.map(entry => entry.date).sort().reverse();
    } catch (error) {
      console.error('Error getting available dates:', error);
      return [];
    }
  }

  /**
   * Get the entire archive
   */
  private static getArchive(): DailyNewsData[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading archive:', error);
      return [];
    }
  }

  /**
   * Get news count for a specific date
   */
  static getNewsCountForDate(date: string): number {
    return this.getNewsForDate(date).length;
  }

  /**
   * Check if news exists for a specific date
   */
  static hasNewsForDate(date: string): boolean {
    return this.getNewsCountForDate(date) > 0;
  }

  /**
   * Clear all archived news
   */
  static clearArchive(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('Cleared daily news archive');
    } catch (error) {
      console.error('Error clearing archive:', error);
    }
  }

  /**
   * Get archive statistics
   */
  static getArchiveStats(): {
    totalDays: number;
    totalArticles: number;
    oldestDate: string | null;
    newestDate: string | null;
  } {
    try {
      const archive = this.getArchive();
      const totalArticles = archive.reduce((sum, entry) => sum + entry.articles.length, 0);
      
      if (archive.length === 0) {
        return {
          totalDays: 0,
          totalArticles: 0,
          oldestDate: null,
          newestDate: null
        };
      }

      const sortedByDate = [...archive].sort((a, b) => a.date.localeCompare(b.date));

      return {
        totalDays: archive.length,
        totalArticles,
        oldestDate: sortedByDate[0].date,
        newestDate: sortedByDate[sortedByDate.length - 1].date
      };
    } catch (error) {
      console.error('Error getting archive stats:', error);
      return {
        totalDays: 0,
        totalArticles: 0,
        oldestDate: null,
        newestDate: null
      };
    }
  }
}
