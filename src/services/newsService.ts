import { Article } from '../types'
import axios from 'axios'
import { AIService } from './aiService'
import { UserPreferenceService } from './userPreferenceService'
import { ContentFilterService } from './contentFilterService'
import { TwitterService } from './twitterService'
import { debugLog } from '../utils/logger'

// NewsAPI.org Configuration
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY
const NEWS_API_BASE_URL = import.meta.env.VITE_NEWS_API_BASE_URL || 'https://newsapi.org/v2'

// News.io API Configuration
const NEWS_IO_API_KEY = import.meta.env.VITE_NEWS_IO_API_KEY
const NEWS_IO_API_BASE_URL = import.meta.env.VITE_NEWS_IO_API_BASE_URL || 'https://newsapi.org/v2'

// Reddit API Configuration
const REDDIT_API_BASE_URL = import.meta.env.VITE_REDDIT_API_BASE_URL || 'https://www.reddit.com'
const HACKER_NEWS_API_BASE_URL = import.meta.env.VITE_HN_API_BASE_URL || 'https://hn.algolia.com/api/v1'
const ARTICLE_PREVIEW_IMAGE_BASE_URL = import.meta.env.VITE_ARTICLE_PREVIEW_IMAGE_BASE_URL || 'https://image.thum.io/get/width/1200/noanimate'

// The News API - Free alternative to NewsAPI.org
const THE_NEWS_API_KEY = import.meta.env.VITE_THE_NEWS_API_KEY
const THE_NEWS_API_BASE_URL = import.meta.env.VITE_THE_NEWS_API_BASE_URL

// NewsData.io - Free tier with historical data
const NEWDATA_API_KEY = import.meta.env.VITE_NEWDATA_API_KEY
const NEWDATA_API_BASE_URL = import.meta.env.VITE_NEWDATA_API_BASE_URL

// Currents API - Real-time global news (70+ countries, 20+ languages)
const CURRENTS_API_KEY = import.meta.env.VITE_CURRENTS_API_KEY
const CURRENTS_API_BASE_URL = import.meta.env.VITE_CURRENTS_API_BASE_URL

// Top 13 Best News APIs - Curated list of quality sources
const TOP13_API_KEY = import.meta.env.VITE_TOP13_API_KEY
const TOP13_API_BASE_URL = import.meta.env.VITE_TOP13_API_BASE_URL

// APITube.io - Free news API with upgradeable plans
const APITUBE_API_KEY = import.meta.env.VITE_APITUBE_API_KEY
const APITUBE_API_BASE_URL = import.meta.env.VITE_APITUBE_API_BASE_URL

// Guardian API - Premium journalism content
const GUARDIAN_API_KEY = import.meta.env.VITE_GUARDIAN_API_KEY
const GUARDIAN_API_BASE_URL = import.meta.env.VITE_GUARDIAN_API_BASE_URL

// New York Times API - Premium news source
const NYT_API_KEY = import.meta.env.VITE_NYT_API_KEY
const NYT_API_BASE_URL = import.meta.env.VITE_NYT_API_BASE_URL

// Google News RSS - Free public access (disabled due to CORS/network issues)
// const GOOGLE_NEWS_RSS_BASE_URL = import.meta.env.VITE_GOOGLE_NEWS_RSS_BASE_URL || 'https://news.google.com'

// Determine which API to use (prioritize NewsAPI.org for traditional news)
const API_KEY = NEWS_API_KEY || NEWS_IO_API_KEY || THE_NEWS_API_KEY || NEWDATA_API_KEY || CURRENTS_API_KEY || TOP13_API_KEY || APITUBE_API_KEY || GUARDIAN_API_KEY || NYT_API_KEY
const BASE_URL = NEWS_API_KEY 
  ? NEWS_API_BASE_URL 
  : NEWS_IO_API_KEY 
    ? NEWS_IO_API_BASE_URL 
    : THE_NEWS_API_KEY 
      ? THE_NEWS_API_BASE_URL 
      : NEWDATA_API_KEY 
        ? NEWDATA_API_BASE_URL 
          : CURRENTS_API_KEY 
            ? CURRENTS_API_BASE_URL 
              : TOP13_API_KEY 
                ? TOP13_API_BASE_URL 
                  : APITUBE_API_KEY 
                    ? APITUBE_API_BASE_URL 
                      : GUARDIAN_API_KEY 
                        ? GUARDIAN_API_BASE_URL 
                          : NYT_API_BASE_URL

const PLACEHOLDER_API_KEYS = new Set([
  'demo_key_replace_with_real_key',
  'your_news_api_key_here',
  'your_api_key_here'
])

const isUsableKey = (key?: string): boolean => Boolean(key && !PLACEHOLDER_API_KEYS.has(key.trim()))
const HAS_USABLE_API_KEY = isUsableKey(API_KEY)

// Debug: Log which API is being used
debugLog('Using API:', HAS_USABLE_API_KEY ? isUsableKey(NEWS_API_KEY) ? 'NewsAPI.org' : isUsableKey(NEWS_IO_API_KEY) ? 'News.io' : 'Other' : 'No API Key')
debugLog('Base URL:', BASE_URL)

// Fallback mock data for development when API key is not set
const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Breakthrough in Quantum Computing Achieved by Research Team',
    description: 'Scientists have successfully demonstrated a new quantum computing architecture that could revolutionize data processing and cryptography.',
    content: 'A team of researchers from leading universities has announced a major breakthrough in quantum computing technology. The new architecture promises to solve complex computational problems that are currently intractable for classical computers.',
    author: 'Dr. Sarah Johnson',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    source: {
      name: 'Tech Review',
      url: 'https://techreview.com'
    },
    url: 'https://www.reuters.com/technology/quantum-computing-breakthrough-2024-01-15/',
    imageUrl: 'https://picsum.photos/seed/quantum/400/300.jpg',
    category: 'technology',
    relevanceScore: 0.9
  },
  {
    id: '2',
    title: 'Global Climate Summit Reaches Historic Agreement',
    description: 'World leaders commit to ambitious new targets for carbon emissions reduction in landmark international accord.',
    content: 'In a significant development for global climate action, world leaders have agreed to unprecedented measures to combat climate change, including substantial investments in renewable energy and strict emissions standards.',
    author: 'Michael Chen',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    source: {
      name: 'Global News',
      url: 'https://globalnews.com'
    },
    url: 'https://www.bbc.com/news/science-environment-67891234',
    imageUrl: 'https://picsum.photos/seed/climate/400/300.jpg',
    category: 'politics',
    relevanceScore: 0.85
  },
  {
    id: '3',
    title: 'Medical Research Shows Promise for Alzheimer\'s Treatment',
    description: 'New clinical trials demonstrate significant improvement in cognitive function for patients receiving experimental therapy.',
    content: 'Groundbreaking medical research has shown promising results in the treatment of Alzheimer\'s disease, with patients in clinical trials showing measurable improvements in memory and cognitive function.',
    author: 'Dr. Emily Rodriguez',
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    source: {
      name: 'Medical Journal',
      url: 'https://medicaljournal.com'
    },
    url: 'https://www.cnn.com/2024/01/15/health/alzheimers-treatment-breakthrough/index.html',
    imageUrl: 'https://picsum.photos/seed/medical/400/300.jpg',
    category: 'health',
    relevanceScore: 0.88
  },
  {
    id: '4',
    title: 'Economic Markets Show Strong Recovery Signs',
    description: 'Financial analysts report positive indicators across global markets as economic stimulus measures begin to show effects.',
    content: 'Economic experts are observing encouraging signs of recovery in global financial markets, with several key indicators suggesting that recent economic stimulus measures are having their intended effect.',
    author: 'Robert Williams',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    source: {
      name: 'Financial Times',
      url: 'https://financialtimes.com'
    },
    url: 'https://www.wsj.com/markets/stocks/economic-recovery-signs-2024-01-15',
    imageUrl: 'https://picsum.photos/seed/economy/400/300.jpg',
    category: 'business',
    relevanceScore: 0.82
  },
  {
    id: '5',
    title: 'Space Exploration Mission Discovers Potentially Habitable Planet',
    description: 'Astronomers identify exoplanet with conditions suitable for life in nearby star system.',
    content: 'NASA\'s latest space exploration mission has made a remarkable discovery, identifying an exoplanet in a nearby star system that exhibits conditions potentially suitable for supporting life.',
    author: 'Dr. James Liu',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    source: {
      name: 'Space News',
      url: 'https://spacenews.com'
    },
    url: 'https://www.nasa.gov/press-release/nasa-discovers-habitable-exoplanet-2024-01-15',
    imageUrl: 'https://picsum.photos/seed/space/400/300.jpg',
    category: 'science',
    relevanceScore: 0.91
  },
  {
    id: '6',
    title: 'Artificial Intelligence Breakthrough in Natural Language Understanding',
    description: 'New AI model demonstrates unprecedented capabilities in understanding and generating human language.',
    content: 'Researchers have developed an artificial intelligence system that shows remarkable advances in natural language understanding, potentially transforming how we interact with technology.',
    author: 'Dr. Alex Kumar',
    publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    source: {
      name: 'AI Research',
      url: 'https://airesearch.com'
    },
    url: 'https://openai.com/blog/gpt-4-natural-language-understanding-breakthrough-2024-01-15',
    imageUrl: 'https://picsum.photos/seed/ai/400/300.jpg',
    category: 'technology',
    relevanceScore: 0.87
  }
]

// Calculate relevance score for articles based on various factors
const calculateRelevanceScore = (article: any): number => {
  let score = 0.5 // Base score

  // Boost score for articles with images
  if (article.urlToImage) score += 0.1

  // Boost score for articles with content
  if (article.content && article.content.length > 100) score += 0.1

  // Boost score for articles with authors
  if (article.author) score += 0.1

  // Boost score for reputable sources (you can customize this list)
  const reputableSources = ['Reuters', 'BBC', 'AP News', 'CNN', 'The Guardian', 'The New York Times']
  if (reputableSources.some(source => article.source.name.toLowerCase().includes(source.toLowerCase()))) {
    score += 0.2
  }

  // Penalize very short descriptions
  if (article.description && article.description.length < 50) {
    score -= 0.1
  }

  return Math.min(Math.max(score, 0), 1) // Keep score between 0 and 1
}

const normalizeImageUrl = (value?: string): string | undefined => {
  if (!value) return undefined

  const cleaned = value.trim()
  if (!cleaned) return undefined

  const invalidPlaceholders = new Set(['self', 'default', 'nsfw', 'spoiler', 'image'])
  if (invalidPlaceholders.has(cleaned.toLowerCase())) return undefined

  if (cleaned.startsWith('//')) return `https:${cleaned}`
  if (/^https?:\/\//i.test(cleaned)) return cleaned
  return undefined
}

const decodeHtmlEntities = (value?: string): string | undefined => {
  if (!value) return undefined
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

const getPreviewImageUrl = (articleUrl?: string): string | undefined => {
  if (!articleUrl || !/^https?:\/\//i.test(articleUrl)) return undefined
  return `${ARTICLE_PREVIEW_IMAGE_BASE_URL}/${encodeURI(articleUrl)}`
}

const getRedditImageUrl = (data: any): string | undefined => {
  const previewImage = data?.preview?.images?.[0]?.source?.url
  const candidates = [
    data?.url_overridden_by_dest,
    decodeHtmlEntities(previewImage),
    data?.thumbnail
  ]

  for (const candidate of candidates) {
    const normalized = normalizeImageUrl(candidate)
    if (normalized) return normalized
  }

  return undefined
}

const getMockHeadlines = (category?: string): Article[] => {
  if (category && category !== 'all') {
    return mockArticles.filter(article => article.category === category)
  }

  return mockArticles
}

const searchMockArticles = (query: string): Article[] => {
  const lowercaseQuery = query.toLowerCase()
  return mockArticles.filter(article =>
    article.title.toLowerCase().includes(lowercaseQuery) ||
    article.description.toLowerCase().includes(lowercaseQuery) ||
    article.content.toLowerCase().includes(lowercaseQuery)
  )
}

const normalizeCategory = (category?: string): string => {
  if (!category || category === 'all' || category === 'google-news') {
    return 'general'
  }

  return category
}

const getRedditSubredditForCategory = (category?: string): string => {
  const normalizedCategory = normalizeCategory(category)

  switch (normalizedCategory) {
    case 'technology':
      return 'technology'
    case 'business':
      return 'economics'
    case 'science':
      return 'science'
    case 'health':
      return 'health'
    case 'politics':
      return 'politics'
    case 'reddit':
      return 'news'
    default:
      return 'news'
  }
}

const fetchRedditCategoryPosts = async (subreddit: string, category: string): Promise<Article[]> => {
  try {
    const response = await axios.get(`${REDDIT_API_BASE_URL}/r/${subreddit}/hot.json`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsHub/1.0)'
      },
      params: {
        limit: 25
      }
    })

    return response.data.data.children.map((child: any) => {
      const data = child.data
      const articleUrl = data.url || `https://reddit.com${data.permalink}`
      return {
        id: `reddit-${data.id}`,
        title: data.title,
        description: data.selftext || data.title,
        content: data.selftext || data.title,
        author: data.author || 'Reddit user',
        publishedAt: new Date(data.created_utc * 1000).toISOString(),
        source: {
          name: `Reddit r/${subreddit}`,
          url: `https://reddit.com${data.permalink}`
        },
        url: articleUrl,
        imageUrl: getRedditImageUrl(data) || getPreviewImageUrl(articleUrl),
        category,
        relevanceScore: calculateRedditRelevanceScore(data)
      } as Article
    })
  } catch (error) {
    console.error(`Reddit fetch failed for r/${subreddit}:`, error)
    return []
  }
}

const fetchHackerNewsArticles = async (category?: string, query?: string): Promise<Article[]> => {
  const normalizedCategory = normalizeCategory(category)
  const categoryQueryMap: Record<string, string> = {
    technology: 'technology ai software cybersecurity',
    business: 'business economy markets finance',
    science: 'science research climate environment',
    health: 'health medicine public health',
    politics: 'politics geopolitics policy elections',
    general: 'breaking news world'
  }

  const effectiveQuery = query?.trim() || categoryQueryMap[normalizedCategory] || 'news'

  try {
    const response = await axios.get(`${HACKER_NEWS_API_BASE_URL}/search`, {
      params: {
        tags: 'story',
        query: effectiveQuery,
        hitsPerPage: 30
      },
      timeout: 10000
    })

    return response.data.hits
      .filter((hit: any) => Boolean(hit.title || hit.story_title))
      .map((hit: any) => {
        const title = hit.title || hit.story_title || 'Untitled'
        const points = Number(hit.points || 0)
        const comments = Number(hit.num_comments || 0)

        return {
          id: `hn-${hit.objectID}`,
          title,
          description: hit.story_text || `Hacker News discussion about ${title}`,
          content: hit.story_text || hit.comment_text || title,
          author: hit.author || 'Hacker News',
          publishedAt: hit.created_at || new Date().toISOString(),
          source: {
            name: 'Hacker News',
            url: 'https://news.ycombinator.com'
          },
          url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
          imageUrl: getPreviewImageUrl(hit.url),
          category: normalizedCategory === 'general' ? 'technology' : normalizedCategory,
          relevanceScore: Math.min(0.95, 0.45 + Math.min(points, 500) / 1000 + Math.min(comments, 200) / 1000)
        } as Article
      })
  } catch (error) {
    console.error('Hacker News fetch failed:', error)
    return []
  }
}

const mergeUniqueArticles = (articles: Article[]): Article[] => {
  const unique = new Map<string, Article>()

  for (const article of articles) {
    const key = article.url || article.id
    if (!unique.has(key)) {
      unique.set(key, article)
    }
  }

  return Array.from(unique.values())
}

const getPublicHeadlines = async (category?: string): Promise<Article[]> => {
  const normalizedCategory = normalizeCategory(category)
  const subreddit = getRedditSubredditForCategory(category)

  const [redditArticles, hackerNewsArticles] = await Promise.all([
    fetchRedditCategoryPosts(subreddit, normalizedCategory),
    fetchHackerNewsArticles(normalizedCategory)
  ])

  let publicArticles = mergeUniqueArticles([...redditArticles, ...hackerNewsArticles])
  publicArticles = await ContentFilterService.filterArticles(publicArticles)
  return publicArticles
}

const searchRedditPosts = async (query: string): Promise<Article[]> => {
  try {
    const redditResponse = await axios.get(`${REDDIT_API_BASE_URL}/search.json`, {
      params: {
        q: query,
        limit: 20,
        sort: 'relevance'
      },
      timeout: 10000
    })

    return redditResponse.data.data.children.map((post: any) => {
      const articleUrl = post.data.url || `https://reddit.com${post.data.permalink}`

      return {
        id: post.data.url || post.data.id,
        title: post.data.title,
        description: post.data.selftext || `Reddit discussion: ${post.data.title}`,
        content: post.data.selftext || post.data.url || 'Click to view discussion',
        author: post.data.author || 'Reddit user',
        publishedAt: new Date(post.data.created_utc * 1000).toISOString(),
        source: {
          name: `Reddit r/${post.data.subreddit}`,
          url: `https://reddit.com/r/${post.data.subreddit}`
        },
        url: articleUrl,
        imageUrl: getRedditImageUrl(post.data) || getPreviewImageUrl(articleUrl),
        category: 'reddit',
        relevanceScore: calculateRedditRelevanceScore(post.data)
      }
    })
  } catch (error) {
    console.error('Reddit search failed:', error)
    return []
  }
}

const searchPublicNews = async (query: string): Promise<Article[]> => {
  const [hackerNewsArticles, redditArticles] = await Promise.all([
    fetchHackerNewsArticles('general', query),
    searchRedditPosts(query)
  ])

  let publicResults = mergeUniqueArticles([...hackerNewsArticles, ...redditArticles])
  publicResults = await ContentFilterService.filterArticles(publicResults)
  return publicResults
}

export const getTopHeadlines = async (category?: string): Promise<Article[]> => {
  if (!HAS_USABLE_API_KEY) {
    const publicHeadlines = await getPublicHeadlines(category)
    return publicHeadlines.length ? publicHeadlines : getMockHeadlines(category)
  }

  try {
    let articles: Article[] = []

    // Fetch from traditional news APIs
    if (category !== 'reddit') {
      const params: any = {
        country: 'us',
        pageSize: 50,
        apiKey: API_KEY
      }

      if (category && category !== 'all') {
        params.category = category
      }

      const response = await axios.get(`${BASE_URL}/top-headlines`, { params })
      
      articles = response.data.articles.map((article: any) => ({
        id: article.url || article.title,
        title: article.title,
        description: article.description,
        content: article.content || article.description,
        author: article.author || 'Unknown',
        publishedAt: article.publishedAt,
        source: {
          name: article.source.name,
          url: article.source.url || article.url
        },
        url: article.url,
        imageUrl: normalizeImageUrl(article.urlToImage) || getPreviewImageUrl(article.url),
        category: category || 'general',
        relevanceScore: calculateRelevanceScore(article)
      }))
    }

    // Fetch from Reddit if requested
    if (category === 'reddit') {
      articles = await getRedditPosts('news')
    }

    // Google News RSS is disabled due to CORS/network issues
    // if (category === 'google-news') {
    //   articles = await getGoogleNewsRSS('top')
    // }

    // Apply content filter to block fake news and celebrity content
    articles = await ContentFilterService.filterArticles(articles)
    debugLog(`Filtered ${articles.length} articles after removing fake news and celebrity content`)

    if (articles.length > 0) {
      return articles
    }

    const publicHeadlines = await getPublicHeadlines(category)
    return publicHeadlines.length ? publicHeadlines : getMockHeadlines(category)
  } catch (error) {
    console.error('Error fetching headlines:', error)
    const publicHeadlines = await getPublicHeadlines(category)
    return publicHeadlines.length ? publicHeadlines : getMockHeadlines(category)
  }
}

export const searchNews = async (query: string): Promise<Article[]> => {
  if (!HAS_USABLE_API_KEY) {
    const publicResults = await searchPublicNews(query)
    return publicResults.length ? publicResults : searchMockArticles(query)
  }

  try {
    let articles: Article[] = []

    // Search traditional news APIs
    const newsResponse = await axios.get(`${BASE_URL}/everything`, {
      params: {
        q: query,
        pageSize: 30,
        sortBy: 'relevancy',
        apiKey: API_KEY
      }
    })

    articles = newsResponse.data.articles.map((article: any) => ({
      id: article.url || article.title,
      title: article.title,
      description: article.description,
      content: article.content || article.description,
      author: article.author || 'Unknown',
      publishedAt: article.publishedAt,
      source: {
        name: article.source.name,
        url: article.source.url || article.url
      },
      url: article.url,
      imageUrl: normalizeImageUrl(article.urlToImage) || getPreviewImageUrl(article.url),
      category: 'general',
      relevanceScore: calculateRelevanceScore(article)
    }))

    const redditArticles = await searchRedditPosts(query)
    articles = mergeUniqueArticles([...articles, ...redditArticles])
    return articles
  } catch (error) {
    console.error('Error searching news:', error)
    const publicResults = await searchPublicNews(query)
    if (publicResults.length) {
      return publicResults
    }

    let mockResults = searchMockArticles(query)
    mockResults = await ContentFilterService.filterArticles(mockResults)
    return mockResults
  }
}

// Twitter/X API functions for real-time news tweets
export const getTwitterTweets = async (count: number = 50): Promise<Article[]> => {
  try {
    const twitterService = TwitterService.getInstance();
    const tweets = await twitterService.getNewsTweets(count);
    
    // Apply content filter
    const filteredTweets = await ContentFilterService.filterArticles(tweets);
    console.log(`Fetched ${tweets.length} Twitter tweets, ${filteredTweets.length} after filtering`);
    
    return filteredTweets;
  } catch (error) {
    console.error('Error fetching Twitter tweets:', error);
    return [];
  }
}

export const searchTwitter = async (query: string, count: number = 50): Promise<Article[]> => {
  try {
    const twitterService = TwitterService.getInstance();
    const tweets = await twitterService.searchTweets(query, count);
    
    // Apply content filter
    const filteredTweets = await ContentFilterService.filterArticles(tweets);
    return filteredTweets;
  } catch (error) {
    console.error('Error searching Twitter:', error);
    return [];
  }
}

// Reddit API functions for community-driven news discussions
export const getRedditPosts = async (subreddit: string): Promise<Article[]> => {
  try {
    const response = await axios.get(`${REDDIT_API_BASE_URL}/r/${subreddit}/hot.json`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsHub/1.0)'
      }
    })

    let posts = response.data.data.children.map((child: any) => {
      const data = child.data
      return {
        id: `reddit-${data.id}`,
        title: data.title,
        description: data.selftext || data.title,
        content: data.selftext || data.title,
        author: data.author,
        publishedAt: new Date(data.created_utc * 1000).toISOString(),
        source: {
          name: 'Reddit',
          url: `https://reddit.com${data.permalink}`
        },
        url: data.url || `https://reddit.com${data.permalink}`,
        imageUrl: data.url_overridden_by_dest || data.thumbnail,
        category: 'reddit',
        relevanceScore: 0.8
      }
    })

    // Apply content filter
    posts = await ContentFilterService.filterArticles(posts);
    return posts
  } catch (error) {
    console.error('Reddit fetch failed:', error)
    return []
  }
}

// Calculate relevance score for Reddit posts
const calculateRedditRelevanceScore = (post: any): number => {
  let score = 0.4 // Base score for Reddit posts (lower than traditional news)

  // Boost score for posts with high upvotes
  if (post.ups > 100) score += 0.2
  if (post.ups > 500) score += 0.2

  // Boost score for posts with comments (indicates engagement)
  if (post.num_comments > 10) score += 0.1
  if (post.num_comments > 50) score += 0.1

  // Boost score for posts with images
  if (post.url && (post.url.includes('i.redd.it') || post.thumbnail)) score += 0.1

  // Penalize very short titles
  if (post.title && post.title.length < 20) {
    score -= 0.1
  }

  return Math.min(Math.max(score, 0), 1)
}

// Smart news functions
export const getTrendingTopics = async (): Promise<{ topic: string; count: number; trend: 'up' | 'down' | 'stable' }[]> => {
  try {
    const [headlines, redditPosts] = await Promise.all([
      getTopHeadlines(),
      getRedditPosts('news')
    ])
    
    const allArticles = [...headlines, ...redditPosts]
    return await AIService.getTrendingTopics(allArticles)
  } catch (error) {
    console.error('Error getting trending topics:', error)
    return []
  }
}

export const getBreakingNews = async (): Promise<Article[]> => {
  try {
    // Get articles from multiple sources (removed Google News RSS due to CORS/network issues)
    const [headlines, redditPosts] = await Promise.all([
      getTopHeadlines(),
      getRedditPosts('news')
    ])
    
    const allArticles = [...headlines, ...redditPosts]
    return AIService.detectBreakingNews(allArticles)
  } catch (error) {
    console.error('Error getting breaking news:', error)
    return []
  }
}

export const getPersonalizedRecommendations = async (count: number = 10): Promise<Article[]> => {
  try {
    // Get articles from multiple sources (removed Google News RSS due to CORS/network issues)
    const [headlines, redditPosts] = await Promise.all([
      getTopHeadlines(),
      getRedditPosts('news')
    ])
    
    const allArticles = [...headlines, ...redditPosts]
    // AIService.getPersonalizedRecommendations is not implemented, return random articles instead
    return allArticles.slice(0, count)
  } catch (error) {
    console.error('Error getting personalized recommendations:', error)
    return []
  }
}

export const trackUserInteraction = (articleId: string, interaction: {
  read?: boolean
  bookmarked?: boolean
  shared?: boolean
  timeSpent?: number
}) => {
  UserPreferenceService.trackArticleInteraction(articleId, interaction)
}

export const getReadingStats = () => {
  return UserPreferenceService.getReadingStats()
}

export const getCategories = () => {
  const categories = [
    { id: 'technology', name: 'Technology', description: 'AI, software, cybersecurity, and digital innovation', color: 'bg-purple-500' },
    { id: 'business', name: 'Geopolitics', description: 'International relations, trade, and economic policy', color: 'bg-blue-500' },
    { id: 'science', name: 'Geography & Environment', description: 'Climate, natural resources, and environmental issues', color: 'bg-green-500' },
    { id: 'general', name: 'General News', description: 'Comprehensive news from all sources', color: 'bg-gray-500' },
    { id: 'reddit', name: 'Reddit Discussions', description: 'Community-driven tech and geopolitics discussions', color: 'bg-orange-500' },
  ]

  // Add additional categories if APIs are configured
  if (CURRENTS_API_KEY) {
    categories.push(
      { id: 'currents', name: 'Currents API', description: 'Real-time news from 70+ countries', color: 'bg-cyan-500' }
    )
  }

  if (TOP13_API_KEY) {
    categories.push(
      { id: 'top13', name: 'Top 13 News', description: 'Curated quality news sources', color: 'bg-teal-500' }
    )
  }

  if (GUARDIAN_API_KEY) {
    categories.push(
      { id: 'guardian', name: 'Guardian', description: 'Premium journalism content', color: 'bg-pink-500' }
    )
  }

  if (NYT_API_KEY) {
    categories.push(
      { id: 'nyt', name: 'NY Times', description: 'Premium New York Times content', color: 'bg-gray-700' }
    )
  }

  // Add Google News RSS (always available - no API key required)
  categories.push(
    { id: 'google-news', name: 'Google News', description: 'Free public RSS feeds from Google News', color: 'bg-yellow-500' }
  )

  return categories
}

export const getArticleById = async (id: string): Promise<Article | null> => {
  try {
    const headlines = await getTopHeadlines()
    const article = headlines.find(a => a.id === id)
    if (article) return article
  } catch (error) {
    console.error('Error fetching headlines for article lookup:', error)
  }
  
  // Fallback to mock data
  return mockArticles.find(article => article.id === id) || null
}
