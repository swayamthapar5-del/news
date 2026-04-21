import React, { useState } from 'react'
import { MessageCircle, Heart, Share2, Users, TrendingUp, ExternalLink } from 'lucide-react'
import { useUserGeneratedContent } from '../hooks/useSocialMedia'

interface UserGeneratedContentProps {
  articleId: string
}

const UserGeneratedContent: React.FC<UserGeneratedContentProps> = ({ articleId }) => {
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'engagement'>('recent')
  const { ugc, loading, error, refreshUGC } = useUserGeneratedContent(articleId)

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <MessageCircle size={16} className="text-blue-400" />
      case 'facebook': return <Users size={16} className="text-blue-600" />
      case 'instagram': return <Users size={16} className="text-pink-600" />
      case 'reddit': return <MessageCircle size={16} className="text-orange-600" />
      default: return <MessageCircle size={16} className="text-gray-600" />
    }
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const sortedUGC = [...ugc].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      case 'popular':
        return (b.metrics.likes + b.metrics.shares) - (a.metrics.likes + a.metrics.shares)
      case 'engagement':
        return (b.metrics.likes + b.metrics.comments + b.metrics.shares) - (a.metrics.likes + a.metrics.comments + a.metrics.shares)
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center">
          <div className="text-red-600 text-sm mb-2">{error}</div>
          <button onClick={refreshUGC} className="text-primary-600 text-sm hover:text-primary-800">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (ugc.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center">
          <MessageCircle size={32} className="mx-auto text-gray-400 mb-3" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">No Community Discussion Yet</h3>
          <p className="text-xs text-gray-600">Be the first to share your thoughts on this article!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <MessageCircle size={20} className="text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Community Discussion</h3>
            <span className="text-sm text-gray-500">({ugc.length} comments)</span>
          </div>
          <button
            onClick={refreshUGC}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <TrendingUp size={16} />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          {[
            { id: 'recent', label: 'Recent' },
            { id: 'popular', label: 'Popular' },
            { id: 'engagement', label: 'Engagement' }
          ].map(sort => (
            <button
              key={sort.id}
              onClick={() => setSortBy(sort.id as any)}
              className={`text-sm px-3 py-1 rounded transition-colors ${
                sortBy === sort.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {sort.label}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {sortedUGC.map(post => (
          <div key={post.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-gray-600">
                  {post.author.name.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                  <span className="font-medium text-gray-900 text-xs sm:text-sm truncate">{post.author.name}</span>
                  <span className="text-gray-500 text-xs truncate">@{post.author.username}</span>
                  <span className="text-gray-400 text-xs">â¢</span>
                  <span className="text-gray-500 text-xs">{formatTimestamp(post.timestamp)}</span>
                  <span className="text-gray-400 text-xs">â¢</span>
                  {getPlatformIcon(post.platform)}
                </div>
                
                <p className="text-gray-800 text-xs sm:text-sm mb-2 line-clamp-3">{post.content}</p>
                
                {post.media && (
                  <div className="mb-2">
                    <img
                      src={post.media.url}
                      alt="User media"
                      className="w-full h-24 sm:h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors">
                      <Heart size={12} className="sm:w-4 sm:h-4" />
                      <span className="text-xs">{formatNumber(post.metrics.likes)}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors">
                      <MessageCircle size={12} className="sm:w-4 sm:h-4" />
                      <span className="text-xs">{formatNumber(post.metrics.comments)}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-green-600 transition-colors">
                      <Share2 size={12} className="sm:w-4 sm:h-4" />
                      <span className="text-xs">{formatNumber(post.metrics.shares)}</span>
                    </button>
                  </div>
                  
                  <button
                    onClick={() => window.open(post.url, '_blank')}
                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                  >
                    <ExternalLink size={12} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <MessageCircle size={16} />
          <span>Join Discussion</span>
        </button>
      </div>
    </div>
  )
}

export default UserGeneratedContent
