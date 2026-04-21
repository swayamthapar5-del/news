# News Platform - High-Level Informative News

A modern, responsive news platform built with React, TypeScript, and Tailwind CSS that delivers relevant and high-level informative news content.

## Features

- **Curated News Feed**: Displays relevant and high-quality news articles
- **Category Filtering**: Browse news by categories (Business, Technology, Science, Health, Politics)
- **Search Functionality**: Search for specific news topics and keywords
- **Article Details**: Full article view with sharing and bookmarking options
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface with Tailwind CSS
- **Relevance Scoring**: Articles are filtered and ranked by relevance
- **True AI Comprehension**: GPT-4 powered analysis for deep understanding of news content
- **Advanced Analysis**: Content quality assessment, sentiment analysis, bias detection, entity recognition
- **Smart Filtering**: Context-aware text display based on article complexity
- **Personalization**: User preference learning and recommendation engine

## AI Comprehension Features

The platform now includes true AI understanding powered by GPT-4:

- **Semantic Analysis**: Actual understanding of news meaning and context
- **Entity Recognition**: Identifies people, organizations, locations
- **Fact Verification**: Checks factual claims and provides confidence scores
- **Key Point Extraction**: Summarizes main points and insights
- **Topic Intelligence**: Advanced topic detection beyond keyword matching
- **Credibility Assessment**: AI-powered source and content credibility scoring

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Icons**: Lucide React
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- NewsAPI.org API key (free tier available)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd news
```

2. Install dependencies:

```bash
npm install
```

3. Set up API key:
   - Get your free API key from [NewsAPI.org](https://newsapi.org)
   - Copy `.env.example` to `.env`
   - Replace `your_news_api_key_here` with your actual API key:

```bash
cp .env.example .env
# Edit .env and add your API key
```

4. Start development server:

```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

### API Configuration

The app uses NewsAPI.org for real news data. If you don't provide an API key, the app will fall back to mock data for development.

**Environment Variables:**

- `VITE_NEWS_API_KEY`: Your NewsAPI.org API key
- `VITE_NEWS_API_BASE_URL`: API base URL (defaults to NewsAPI.org)

**Free Tier Limits:**

- 1,000 requests per day
- 50 requests per hour
- Access to top headlines and everything endpoints

### Additional Free APIs Supported

The platform now supports multiple free news APIs for comprehensive coverage:

**The News API** (https://www.thenewsapi.com/)

- Free tier available
- Alternative to NewsAPI.org
- Historical news data access

**NewsData.io** (https://newsdata.io/)

- Free tier with historical data
- Upgradeable plans available
- No credit card required

**APITube.io** (https://apitube.io/free-news-api)

- Free news API
- Upgrade through dashboard anytime
- No credit card required

**The News API** (https://www.thenewsapi.com/)

- JSON news API
- Free live and top story access
- Text-heavy document support

**Configuration:**
Add API keys to `.env` file for any of these services:

```bash
VITE_THE_NEWS_API_KEY=your_key_here
VITE_NEWDATA_API_KEY=your_key_here
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx       # Navigation header
│   ├── NewsFeed.tsx     # Main news feed
│   ├── ArticleDetail.tsx # Article detail view
│   ├── SearchPage.tsx   # Search functionality
│   └── CategoriesPage.tsx # Category browsing
├── services/           # API services
│   └── newsService.ts  # News data management
├── types/              # TypeScript type definitions
│   └── index.ts        # Common types
├── App.tsx             # Main app component
├── main.tsx           # App entry point
└── index.css          # Global styles
```

## Features Overview

### News Feed

- Displays curated news articles with relevance scores
- Category filtering
- Responsive grid layout
- Article cards with images, titles, and metadata

### Search

- Real-time search functionality
- Search across article titles, descriptions, and content
- Search results with highlighting

### Categories

- Browse news by topic
- Category-specific article previews
- Quick navigation to category feeds

### Article Detail

- Full article view with rich content
- Sharing functionality
- Source attribution
- Related articles

## Customization

### Adding News Sources

To integrate real news APIs, update `src/services/newsService.ts`:

1. Replace mock data with API calls
2. Add your API keys
3. Implement proper error handling

### Styling

The project uses Tailwind CSS. Customize the theme in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom color palette
      }
    }
  }
}
```

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy

The build output will be in the `dist` folder, which can be deployed to any static hosting service.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Future Enhancements

- [ ] Real-time news updates
- [ ] User preferences and personalization
- [ ] Offline reading support
- [ ] Dark mode
- [ ] Social media integration
- [ ] Push notifications for breaking news
- [ ] Advanced filtering options
- [ ] News source management
