import React, { useState } from 'react'
import { Twitter, Facebook, Instagram, MessageCircle, Video, Heart, Share2, ExternalLink, TrendingUp, Users } from 'lucide-react'
import { useSocialFeeds } from '../hooks/useSocialMedia'

const SocialFeeds: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const { feeds, loading, error, refreshFeeds } = useSocialFeeds()

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <Twitter size={16} className="text-blue-400" />
      case 'facebook': return <Facebook size={16} className="text-blue-600" />
      case 'instagram': return <Instagram size={16} className="text-pink-600" />
      case 'reddit': return <MessageCircle size={16} className="text-orange-600" />
      case 'linkedin': return <Users size={16} className="text-blue-700" />
      default: return <TrendingUp size={16} className="text-gray-600" />
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'twitter': return 'border-blue-400 bg-blue-50'
      case 'facebook': return 'border-blue-600 bg-blue-50'
      case 'instagram': return 'border-pink-600 bg-pink-50'
      case 'reddit': return 'border-orange-600 bg-orange-50'
      case 'linkedin': return 'border-blue-700 bg-blue-50'
      default: return 'border-gray-400 bg-gray-50'
    }
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
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
    return date.toLocaleDateString()
  }

  const filteredFeeds = selectedPlatform === 'all' 
    ? feeds 
    : feeds.filter(feed => feed.platform === selectedPlatform)

  const platforms = [
    { id: 'all', name: 'All Platforms', icon: <TrendingUp size={16} /> },
    { id: 'twitter', name: 'Twitter/X', icon: <Twitter size={16} /> },
    { id: 'facebook', name: 'Facebook', icon: <Facebook size={16} /> },
    { id: 'instagram', name: 'Instagram', icon: <Instagram size={16} /> },
    { id: 'reddit', name: 'Reddit', icon: <MessageCircle size={16} /> },
    { id: 'linkedin', name: 'LinkedIn', icon: <Users size={16} /> }
  ]

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <button onClick={refreshFeeds} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Social Media Feeds</h2>
          <button
            onClick={refreshFeeds}
            className="flex items-center space-x-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <TrendingUp size={16} />
            <span>Refresh</span>
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {platforms.map(platform => (
            <button
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                selectedPlatform === platform.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {platform.icon}
              <span className="text-sm font-medium">{platform.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
        {filteredFeeds.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No social media posts found</h3>
            <p className="text-gray-600">Try refreshing or selecting a different platform</p>
          </div>
        ) : (
          filteredFeeds.map(post => (
            <div key={post.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${getPlatformColor(post.platform)}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs sm:text-sm font-medium text-gray-600">
                      {post.author.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="font-medium text-gray-900 text-sm truncate">{post.author.name}</span>
                      {post.author.verified && (
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs">â</span>
                        </div>
                      )}
                      <span className="text-gray-500 text-xs sm:text-sm truncate">@{post.author.username}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 flex-wrap">
                      {getPlatformIcon(post.platform)}
                      <span>â¢</span>
                      <span>{formatTimestamp(post.timestamp)}</span>
                      {post.author.followers && (
                        <>
                          <span>â¢</span>
                          <span className="hidden sm:inline">{formatNumber(post.author.followers)} followers</span>
                          <span className="sm:hidden">{formatNumber(post.author.followers)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => window.open(post.url, '_blank')}
                  className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-2"
                >
                  <ExternalLink size={14} className="sm:w-4 sm:h-4" />
                </button>
              </div>

              <div className="mb-3">
                <p className="text-gray-800 line-clamp-3">{post.content}</p>
                {post.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.hashtags.map((hashtag, index) => (
                      <span key={index} className="text-primary-600 text-sm hover:text-primary-800 cursor-pointer">
                        {hashtag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {post.media && (
                <div className="mb-3">
                  {post.media.type === 'video' ? (
                    <div className="relative">
                      <img
                        src={post.media.thumbnail || post.media.url}
                        alt="Video thumbnail"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                          <Video size={24} className="text-white" />
                        </div>
                      </div>
                      {post.media.duration && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                          {Math.floor(post.media.duration / 60)}:{(post.media.duration % 60).toString().padStart(2, '0')}
                        </div>
                      )}
                    </div>
                  ) : (
                    <img
                      src={post.media.url}
                      alt="Post media"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center space-x-3 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Heart size={14} className="sm:w-4 sm:h-4" />
                    <span>{formatNumber(post.metrics.likes)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle size={14} className="sm:w-4 sm:h-4" />
                    <span>{formatNumber(post.metrics.comments)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Share2 size={14} className="sm:w-4 sm:h-4" />
                    <span>{formatNumber(post.metrics.shares)}</span>
                  </div>
                  {post.metrics.views && (
                    <div className="flex items-center space-x-1">
                      <Video size={14} className="sm:w-4 sm:h-4" />
                      <span>{formatNumber(post.metrics.views)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    post.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                    post.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {post.sentiment}
                  </span>
                  <span className="text-xs text-gray-500 hidden sm:inline">
                    {Math.round(post.relevance * 100)}% relevant
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default SocialFeeds
