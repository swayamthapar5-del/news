import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import NewsFeed from './components/NewsFeed'
import ArticleDetail from './components/ArticleDetail'
import SearchPage from './components/SearchPage'
import SavedArticlesPage from './components/SavedArticlesPage'
import BiasMapPage from './components/BiasMapPage'
import CategoriesPage from './components/CategoriesPage'
import NewsArchivePage from './components/NewsArchivePage'
import NotFound from './components/NotFound'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <Routes>
              <Route path="/" element={<NewsFeed />} />
              <Route path="/article/:id" element={<ArticleDetail />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/saved" element={<SavedArticlesPage />} />
              <Route path="/archive" element={<NewsArchivePage />} />
              <Route path="/bias-map" element={<BiasMapPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App
