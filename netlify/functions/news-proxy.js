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

    const response = await axios.get(`https://newsapi.org/v2${endpoint}`, { params });

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
