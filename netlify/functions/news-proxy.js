const axios = require('axios');

exports.handler = async (event, context) => {
  const { NEWS_API_KEY } = process.env;
  
  if (!NEWS_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'NewsAPI key not configured' })
    };
  }

  try {
    const { category, country = 'us', pageSize = 50 } = event.queryStringParameters || {};
    
    let endpoint = '/top-headlines';
    let params = {
      apiKey: NEWS_API_KEY,
      pageSize
    };

    if (category) {
      endpoint = '/top-headlines';
      params.category = category;
    } else {
      params.country = country;
    }

    const response = await axios.get(`https://newsapi.org/v2${endpoint}`, { 
      params,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Origin': 'http://localhost:5173',
        'Referer': 'http://localhost:5173',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('NewsAPI proxy error:', error);
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ 
        error: error.message,
        status: error.response?.status
      })
    };
  }
};
