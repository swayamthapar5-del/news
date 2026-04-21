import React, { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ExternalLink, ArrowLeft, Timer, Share2, Bookmark, User, Calendar, Shield, AlertTriangle, CheckCircle } from 'lucide-react'
import { Article } from '../types'
import { getArticleById, trackUserInteraction } from '../services/newsService'
import { ReadingTimeCalculator } from '../utils/readingTime'
import { useVerification } from '../hooks/useVerification'
import UserGeneratedContent from './UserGeneratedContent'
import SocialFeeds from './SocialFeeds'
import { applyThumbnailFallback, getArticleThumbnail } from '../utils/thumbnail'
import { generateContextBrief } from '../utils/contextBrief'
import { getTrustPresentation } from '../utils/newsTrust'

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [secondsRead, setSecondsRead] = useState(0)
  const verificationResult = useVerification(article)
  const verification = verificationResult.verification
  const contextBrief = useMemo(() => (article ? generateContextBrief(article) : null), [article])
  const estimatedReading = useMemo(() => {
    if (!article) return null
    return ReadingTimeCalculator.calculateArticleReadingTime(
      article.title,
      article.description,
      article.content
    )
  }, [article])
  const trustPresentation = getTrustPresentation(verification)
  const progressPercent = estimatedReading && estimatedReading.totalSeconds > 0
    ? Math.min(100, Math.round((secondsRead / estimatedReading.totalSeconds) * 100))
    : 0

  useEffect(() => {
    if (id) {
      fetchArticle(id)
    }
  }, [id])

  const fetchArticle = async (articleId: string) => {
    try {
      setLoading(true)
      const data = await getArticleById(articleId)
      if (data) {
        setArticle(data)
      } else {
        setError('Article not found')
      }
    } catch (err) {
      setError('Failed to load article')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    if (minutes === 0) return `${seconds}s`
    return `${minutes}m ${seconds}s`
  }

  const shareArticle = () => {
    if (navigator.share && article) {
      navigator.share({
        title: article.title,
        text: article.description,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Article link copied to clipboard!')
    }
  }

  useEffect(() => {
    if (!article) return

    setSecondsRead(0)
    const startedAt = Date.now()
    const intervalId = window.setInterval(() => {
      setSecondsRead(Math.floor((Date.now() - startedAt) / 1000))
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
      const timeSpent = Math.max(1, Math.floor((Date.now() - startedAt) / 1000))
      const estimatedSeconds = estimatedReading?.totalSeconds || 60
      const readThreshold = Math.max(20, Math.min(45, Math.floor(estimatedSeconds * 0.4)))

      trackUserInteraction(article.id, {
        read: timeSpent >= readThreshold,
        timeSpent
      })
    }
  }, [article?.id, estimatedReading?.totalSeconds])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-12 bg-gray-200 rounded mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-6"></div>
        <div className="h-96 bg-gray-200 rounded mb-6"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg mb-4">{error || 'Article not found'}</div>
        <Link to="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-0">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center space-x-2 px-4 py-2 bg-surface-container text-primary rounded-lg hover:bg-surface-container-high transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          <span>Back to News</span>
        </Link>
        <a
          href={article?.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary-container transition-colors font-medium"
        >
          <ExternalLink size={20} />
          <span>Read Original</span>
        </a>
      </div>

      <article className="bg-surface-container-lowest rounded-xl shadow-lg overflow-hidden">
        <img
          src={getArticleThumbnail(article, 1400, 900)}
          alt={article.title}
          className="w-full h-96 object-cover"
          onError={(event) => applyThumbnailFallback(event, 1400, 900)}
        />
        
        <div className="p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full">
                {article.category}
              </span>
              <span className={`px-3 py-1 text-sm rounded-full ${trustPresentation.badgeClass}`}>
                {verification ? trustPresentation.label : 'Analyzing Trust'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={shareArticle}
                className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                title="Share article"
              >
                <Share2 size={20} />
              </button>
              <button
                className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                title="Bookmark article"
              >
                <Bookmark size={20} />
              </button>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>

          <p className="text-xl text-gray-600 mb-6">
            {article.description}
          </p>

          {estimatedReading && (
            <section className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Reading Time Tracker</p>
                <p className="text-sm font-semibold text-slate-800">
                  {formatDuration(secondsRead)} / {estimatedReading.formatted}
                </p>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                You have completed approximately {progressPercent}% of this article.
              </p>
            </section>
          )}

          {contextBrief && (
            <section className="mb-6 rounded-xl border border-blue-100 bg-blue-50/70 p-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-blue-700 mb-2">
                Auto Context
              </h2>
              <p className="text-blue-900 leading-relaxed mb-3">{contextBrief.summary}</p>
              <p className="text-sm text-blue-800 leading-relaxed mb-4">{contextBrief.whyItMatters}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-blue-700 mb-2">Key Points</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-blue-900">
                    {contextBrief.keyPoints.slice(0, 3).map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
                {contextBrief.keyEntities.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-blue-700 mb-2">Entities</h3>
                    <div className="flex flex-wrap gap-2">
                      {contextBrief.keyEntities.map((entity) => (
                        <span key={entity} className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                          {entity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <User size={18} />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar size={18} />
                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
              </div>
              {estimatedReading && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Timer size={18} />
                  <span className="text-sm">{estimatedReading.formatted}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <span className="text-sm font-medium">{article.source.name}</span>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-800 leading-relaxed mb-4">
              {article.content}
            </p>
            <p className="text-gray-800 leading-relaxed mb-4">
              This is a high-quality, informative article that provides valuable insights into the topic. 
              The content has been carefully selected to ensure relevance and educational value for our readers.
            </p>
            <p className="text-gray-800 leading-relaxed">
              For more detailed information and ongoing updates about this topic, readers are encouraged to 
              follow reputable sources and stay informed about the latest developments in this field.
            </p>
          </div>

          {/* Verification Section */}
          {verification && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
              <div className="flex items-center mb-4">
                <Shield size={20} className="mr-2 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">News Verification</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center mb-3">
                    {verification.riskLevel === 'low' ? (
                      <CheckCircle size={20} className="text-green-600 mr-2" />
                    ) : (
                      <AlertTriangle size={20} className="text-yellow-600 mr-2" />
                    )}
                    <span className="font-medium">Credibility Score:</span>
                    <span className="ml-2 text-lg font-bold">{Math.round(verification.credibilityScore)}%</span>
                  </div>
                  
                  <div className="mb-3">
                    <span className="font-medium">Risk Level:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${
                      verification.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                      verification.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {verification.riskLevel.charAt(0).toUpperCase() + verification.riskLevel.slice(1)}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <span className="font-medium">Source Reliability:</span>
                    <span className="ml-2">{Math.round(verification.sourceReliability)}%</span>
                  </div>
                </div>
                
                <div>
                  <div className="mb-3">
                    <span className="font-medium">Confidence:</span>
                    <span className="ml-2">{Math.round(verification.confidence)}%</span>
                  </div>
                  
                  <div className="mb-3">
                    <span className="font-medium">Trust Signal:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${trustPresentation.badgeClass}`}>
                      {trustPresentation.label}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-3">{verification.explanation}</p>
                
                {verification.redFlags.length > 0 && (
                  <div className="mb-3">
                    <h4 className="font-medium text-red-600 mb-2">Red Flags:</h4>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {verification.redFlags.map((flag, index) => (
                        <li key={index}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {verification.greenFlags.length > 0 && (
                  <div className="mb-3">
                    <h4 className="font-medium text-green-600 mb-2">Positive Indicators:</h4>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {verification.greenFlags.map((flag, index) => (
                        <li key={index}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {verification.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-blue-600 mb-2">Recommendations:</h4>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {verification.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 font-medium mb-2">
                <ExternalLink size={16} className="inline mr-2" />
                Source Attribution
              </p>
              <p className="text-blue-600 text-sm">
                This article was originally published by <span className="font-semibold">{article.source.name}</span>.
                Click below to read the full article on their website.
              </p>
            </div>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              <ExternalLink size={20} className="mr-2" />
              Read Full Article on {article.source.name}
            </a>
          </div>

          {/* Social Media Integration */}
          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Community Discussion</h3>
                <UserGeneratedContent articleId={id || ''} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Social Media Buzz</h3>
                <SocialFeeds />
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}

export default ArticleDetail
