import React, { useState } from 'react'
import { Search, Menu, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const Header: React.FC = () => {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 w-full z-50 bg-[#f7f9fb]/80 dark:bg-[#182034]/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 py-4 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full hover:bg-[#e6e8ea] dark:hover:bg-[#2e354a] transition-colors active:scale-95 duration-200 ease-in-out"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? (
              <X size={24} className="text-primary dark:text-background" />
            ) : (
              <Menu size={24} className="text-primary dark:text-background" />
            )}
          </button>
          <Link to="/" className="text-2xl font-headline font-extrabold tracking-tighter text-primary dark:text-background">
            The Curator
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-primary dark:text-background font-bold font-headline tracking-tight">
            Feed
          </Link>
          <Link to="/archive" className="text-outline dark:text-primary-fixed-dim font-headline tracking-tight hover:text-primary dark:hover:text-background transition-colors">
            Archive
          </Link>
          <Link to="/categories" className="text-outline dark:text-primary-fixed-dim font-headline tracking-tight hover:text-primary dark:hover:text-background transition-colors">
            Categories
          </Link>
          <Link to="/bias-map" className="text-outline dark:text-primary-fixed-dim font-headline tracking-tight hover:text-primary dark:hover:text-background transition-colors">
            Bias Map
          </Link>
          <Link to="/saved" className="text-outline dark:text-primary-fixed-dim font-headline tracking-tight hover:text-primary dark:hover:text-background transition-colors">
            Saved
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/search')}
            className="p-2 rounded-full hover:bg-[#e6e8ea] dark:hover:bg-[#2e354a] transition-colors active:scale-95 duration-200 ease-in-out"
            aria-label="Search articles"
          >
            <Search size={24} className="text-primary dark:text-background" />
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-outline-variant/20 bg-[#f7f9fb] dark:bg-[#182034] px-4 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-3 px-4 text-base font-bold text-primary dark:text-background hover:bg-[#e6e8ea] dark:hover:bg-[#2e354a] rounded-lg transition-colors"
          >
            Feed
          </Link>
          <Link
            to="/archive"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-3 px-4 text-base text-outline dark:text-primary-fixed-dim hover:bg-[#e6e8ea] dark:hover:bg-[#2e354a] rounded-lg transition-colors"
          >
            Archive
          </Link>
          <Link
            to="/categories"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-3 px-4 text-base text-outline dark:text-primary-fixed-dim hover:bg-[#e6e8ea] dark:hover:bg-[#2e354a] rounded-lg transition-colors"
          >
            Categories
          </Link>
          <Link
            to="/bias-map"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-3 px-4 text-base text-outline dark:text-primary-fixed-dim hover:bg-[#e6e8ea] dark:hover:bg-[#2e354a] rounded-lg transition-colors"
          >
            Bias Map
          </Link>
          <Link
            to="/saved"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-3 px-4 text-base text-outline dark:text-primary-fixed-dim hover:bg-[#e6e8ea] dark:hover:bg-[#2e354a] rounded-lg transition-colors"
          >
            Saved
          </Link>
          <Link
            to="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-3 px-4 text-base text-outline dark:text-primary-fixed-dim hover:bg-[#e6e8ea] dark:hover:bg-[#2e354a] rounded-lg transition-colors"
          >
            Search
          </Link>
        </nav>
      )}
    </header>
  )
}

export default Header
