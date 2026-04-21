// Reading time calculation utility
export interface ReadingTimeResult {
  minutes: number;
  seconds: number;
  totalSeconds: number;
  words: number;
  formatted: string;
  category: 'quick' | 'medium' | 'long';
}

export class ReadingTimeCalculator {
  // Average reading speeds (words per minute)
  private static readonly READING_SPEEDS = {
    slow: 200,    // Slow readers
    average: 265, // Average adult reader
    fast: 350     // Fast readers
  };

  // Default reading speed (average adult)
  private static readonly DEFAULT_SPEED = 265;

  // Reading time categories
  private static readonly CATEGORIES = {
    quick: { max: 3, label: 'Quick Read', color: 'green' },
    medium: { max: 7, label: 'Medium Read', color: 'yellow' },
    long: { max: Infinity, label: 'Long Read', color: 'red' }
  };

  /**
   * Calculate reading time for a given text
   */
  static calculateReadingTime(
    text: string,
    speed: number = this.DEFAULT_SPEED
  ): ReadingTimeResult {
    if (!text || text.trim().length === 0) {
      return this.getEmptyResult();
    }

    // Clean and count words
    const cleanText = this.cleanText(text);
    const words = this.countWords(cleanText);
    
    if (words === 0) {
      return this.getEmptyResult();
    }

    // Calculate reading time
    const totalSeconds = Math.ceil((words / speed) * 60);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    // Format the result
    const formatted = this.formatReadingTime(minutes, seconds);
    const category = this.getCategory(minutes);

    return {
      minutes,
      seconds,
      totalSeconds,
      words,
      formatted,
      category
    };
  }

  /**
   * Calculate reading time for an article (combines title, description, and content)
   */
  static calculateArticleReadingTime(
    title: string,
    description: string,
    content: string,
    speed: number = this.DEFAULT_SPEED
  ): ReadingTimeResult {
    const fullText = `${title} ${description} ${content}`;
    return this.calculateReadingTime(fullText, speed);
  }

  /**
   * Get reading time for different reading speeds
   */
  static getReadingTimeForAllSpeeds(text: string): {
    slow: ReadingTimeResult;
    average: ReadingTimeResult;
    fast: ReadingTimeResult;
  } {
    return {
      slow: this.calculateReadingTime(text, this.READING_SPEEDS.slow),
      average: this.calculateReadingTime(text, this.READING_SPEEDS.average),
      fast: this.calculateReadingTime(text, this.READING_SPEEDS.fast)
    };
  }

  /**
   * Get reading speed label
   */
  static getSpeedLabel(speed: number): string {
    if (speed <= this.READING_SPEEDS.slow) return 'Slow Reader';
    if (speed <= this.READING_SPEEDS.average) return 'Average Reader';
    if (speed <= this.READING_SPEEDS.fast) return 'Fast Reader';
    return 'Very Fast Reader';
  }

  /**
   * Get reading time category info
   */
  static getCategoryInfo(category: 'quick' | 'medium' | 'long') {
    return this.CATEGORIES[category];
  }

  /**
   * Clean text for word counting
   */
  private static cleanText(text: string): string {
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&[^;]+;/g, ' ') // Replace HTML entities with space
      .replace(/[^\w\s]/g, ' ') // Replace non-word characters with space
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }

  /**
   * Count words in text
   */
  private static countWords(text: string): number {
    if (!text || text.trim().length === 0) return 0;
    return text.trim().split(/\s+/).length;
  }

  /**
   * Format reading time display
   */
  private static formatReadingTime(minutes: number, seconds: number): string {
    if (minutes === 0) {
      return `${seconds} sec read`;
    } else if (minutes === 1 && seconds === 0) {
      return '1 min read';
    } else if (minutes === 1) {
      return `1 min ${seconds} sec read`;
    } else if (seconds === 0) {
      return `${minutes} min read`;
    } else {
      return `${minutes} min ${seconds} sec read`;
    }
  }

  /**
   * Get reading time category
   */
  private static getCategory(minutes: number): 'quick' | 'medium' | 'long' {
    if (minutes <= this.CATEGORIES.quick.max) return 'quick';
    if (minutes <= this.CATEGORIES.medium.max) return 'medium';
    return 'long';
  }

  /**
   * Get empty result for empty text
   */
  private static getEmptyResult(): ReadingTimeResult {
    return {
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      words: 0,
      formatted: '0 min read',
      category: 'quick'
    };
  }

  /**
   * Estimate reading time based on character count (fallback method)
   */
  static estimateFromCharacterCount(
    characters: number,
    speed: number = this.DEFAULT_SPEED
  ): ReadingTimeResult {
    // Average word length is approximately 5 characters
    const estimatedWords = Math.ceil(characters / 5);
    const totalSeconds = Math.ceil((estimatedWords / speed) * 60);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return {
      minutes,
      seconds,
      totalSeconds,
      words: estimatedWords,
      formatted: this.formatReadingTime(minutes, seconds),
      category: this.getCategory(minutes)
    };
  }

  /**
   * Get reading time statistics for multiple articles
   */
  static getReadingTimeStats(articles: Array<{ title: string; description: string; content: string }>) {
    const readingTimes = articles.map(article => 
      this.calculateArticleReadingTime(article.title, article.description, article.content)
    );

    const totalMinutes = readingTimes.reduce((sum, rt) => sum + rt.minutes + (rt.seconds / 60), 0);
    const averageMinutes = totalMinutes / articles.length;
    const quickReads = readingTimes.filter(rt => rt.category === 'quick').length;
    const mediumReads = readingTimes.filter(rt => rt.category === 'medium').length;
    const longReads = readingTimes.filter(rt => rt.category === 'long').length;

    return {
      totalArticles: articles.length,
      totalReadingTime: Math.round(totalMinutes),
      averageReadingTime: Math.round(averageMinutes),
      quickReads,
      mediumReads,
      longReads,
      distribution: {
        quick: Math.round((quickReads / articles.length) * 100),
        medium: Math.round((mediumReads / articles.length) * 100),
        long: Math.round((longReads / articles.length) * 100)
      }
    };
  }

  /**
   * Get personalized reading speed based on user behavior
   */
  static getPersonalizedSpeed(
    userReadingHistory: Array<{ actualTime: number; estimatedTime: number }>
  ): number {
    if (userReadingHistory.length === 0) {
      return this.DEFAULT_SPEED;
    }

    // Calculate average reading speed based on history
    const speedAdjustments = userReadingHistory.map(history => {
      const ratio = history.estimatedTime / history.actualTime;
      return this.DEFAULT_SPEED * ratio;
    });

    const averageSpeed = speedAdjustments.reduce((sum, speed) => sum + speed, 0) / speedAdjustments.length;
    return Math.round(Math.max(150, Math.min(400, averageSpeed))); // Clamp between 150-400 WPM
  }
}

