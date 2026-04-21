import React, { useState } from 'react'
import { Video, Play, Heart, MessageCircle, Share2, TrendingUp, Clock, Eye } from 'lucide-react'
import { useShortFormVideos } from '../hooks/useSocialMedia'

const ShortFormVideos: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>('all')
  const { videos, loading, error, refreshVideos } = useShortFormVideos()

  const topics = [
    { id: 'all', name: 'All Topics' },
    { id: 'tech', name: 'Technology' },
    { id: 'news', name: 'News' },
    { id: 'politics', name: 'Politics' },
    { id: 'science', name: 'Science' },
    { id: 'trending', name: 'Trending' }
  ]

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

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const filteredVideos = selectedTopic === 'all' 
    ? videos 
    : videos.filter(video => video.hashtags.some(tag => tag.includes(selectedTopic)))

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
          <button onClick={refreshVideos} className="btn-primary">
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
          <h2 className="text-2xl font-bold text-gray-900">Short-Form Videos</h2>
          <button
            onClick={refreshVideos}
            className="flex items-center space-x-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <TrendingUp size={16} />
            <span>Refresh</span>
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {topics.map(topic => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedTopic === topic.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-sm font-medium">{topic.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {filteredVideos.length === 0 ? (
          <div className="text-center py-8">
            <Video size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No short-form videos found</h3>
            <p className="text-gray-600">Try refreshing or selecting a different topic</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredVideos.map(video => (
              <div key={video.id} className="group cursor-pointer" onClick={() => window.open(video.url, '_blank')}>
                <div className="relative aspect-[9/16] bg-gray-900 rounded-lg overflow-hidden mb-3">
                  <img
                    src={video.media?.thumbnail || video.media?.url}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white bg-opacity-0 group-hover:bg-opacity-90 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-all duration-300">
                      <Play size={16} className="sm:w-6 sm:h-6 text-gray-900" />
                    </div>
                  </div>
                  
                  <div className="absolute top-2 left-2">
                    <div className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                      <Clock size={10} className="sm:w-3 sm:h-3" />
                      <span>{formatDuration(video.media?.duration || 0)}</span>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-2 right-2">
                    <div className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                      <Eye size={10} className="sm:w-3 sm:h-3" />
                      <span>{formatNumber(video.metrics.views || 0)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-gray-600">
                        {video.author.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1">
                        <span className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                          {video.author.name}
                        </span>
                        {video.author.verified && (
                          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs">â</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 truncate">@{video.author.username}</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-800 line-clamp-2">{video.content}</p>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                    <div className="flex items-center space-x-2 sm:space-x-3 text-xs text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Heart size={12} className="sm:w-4 sm:h-4" />
                        <span>{formatNumber(video.metrics.likes)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle size={12} className="sm:w-4 sm:h-4" />
                        <span>{formatNumber(video.metrics.comments)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Share2 size={12} className="sm:w-4 sm:h-4" />
                        <span>{formatNumber(video.metrics.shares)}</span>
                      </div>
                    </div>
                    
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(video.timestamp)}
                    </span>
                  </div>

                  {video.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {video.hashtags.slice(0, 3).map((hashtag, index) => (
                        <span key={index} className="text-primary-600 text-xs hover:text-primary-800 cursor-pointer">
                          {hashtag}
                        </span>
                      ))}
                      {video.hashtags.length > 3 && (
                        <span className="text-gray-500 text-xs">+{video.hashtags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ShortFormVideos
