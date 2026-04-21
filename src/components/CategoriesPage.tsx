import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Grid3x3, TrendingUp, Clock } from 'lucide-react'
import { Article } from '../types'
import { getCategories, getTopHeadlines } from '../services/newsService'

const CategoriesPage: React.FC = () => {
  const categories = getCategories()
  const [categoryArticles, setCategoryArticles] = useState<Record<string, Article[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategoryArticles = async () => {
      try {
        setLoading(true)
        const articlesData: Record<string, Article[]> = {}
        
        for (const category of categories) {
          const articles = await getTopHeadlines(category.id)
          articlesData[category.id] = articles.slice(0, 3) // Get top 3 for each category
        }
        
        setCategoryArticles(articlesData)
      } catch (err) {
        console.error('Failed to fetch category articles:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryArticles()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">News Categories</h1>
          <p className="text-gray-600 mt-1">Explore news by topic</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">News Categories</h1>
        <p className="text-gray-600 mt-1">Explore high-quality news by topic</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div key={category.id} className="card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center`}>
                <Grid3x3 size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>
            </div>

            <div className="space-y-3">
              {categoryArticles[category.id]?.slice(0, 3).map((article) => (
                <Link
                  key={article.id}
                  to={`/article/${article.id}`}
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-primary-600 transition-colors">
                    {article.title}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                    <Clock size={12} />
                    <span>{formatDate(article.publishedAt)}</span>
                  </div>
                </Link>
              ))}

              {(!categoryArticles[category.id] || categoryArticles[category.id].length === 0) && (
                <p className="text-sm text-gray-500 py-3">No articles available</p>
              )}
            </div>

            <Link
              to={`/?category=${category.id}`}
              className="mt-4 block text-center w-full py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              View All {category.name} News
            </Link>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <TrendingUp className="text-blue-600 mt-1" size={20} />
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Quality Content</h3>
            <p className="text-blue-800 mt-1">
              All articles are filtered for relevance and informativeness to ensure you get the most valuable news content.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoriesPage
