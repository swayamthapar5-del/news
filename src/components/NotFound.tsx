import React from 'react'
import { Link } from 'react-router-dom'
import { Home, Search, ArrowLeft } from 'lucide-react'

const NotFound: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center px-6">
        <p className="text-8xl font-extrabold text-primary/10 font-headline select-none mb-4">404</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-3 font-headline">
          Page Not Found
        </h1>
        <p className="text-secondary max-w-md mx-auto mb-8">
          The page you're looking for doesn't exist or has been moved. Try heading back to the news feed.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-lg hover:bg-primary-container transition-colors font-medium"
          >
            <Home size={18} />
            <span>News Feed</span>
          </Link>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-container text-primary rounded-lg hover:bg-surface-container-high transition-colors font-medium"
          >
            <Search size={18} />
            <span>Search</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-container text-primary rounded-lg hover:bg-surface-container-high transition-colors font-medium"
          >
            <ArrowLeft size={18} />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFound
