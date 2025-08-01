// Finnhub API base URL and rate limiting
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
let callCount = 0;
let lastResetTime = Date.now();

const checkRateLimit = () => {
  const now = Date.now();
  if (now - lastResetTime >= 60000) { // Reset every minute
    callCount = 0;
    lastResetTime = now;
  }
  if (callCount >= 60) {
    throw new Error('Rate limit exceeded. Please wait before making more requests.');
  }
  callCount++;
};

export const makeApiCall = async (endpoint, params = {}) => {
  try {
    checkRateLimit();
    const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;
    if (!apiKey) {
      throw new Error('Finnhub API key not found. Please add VITE_FINNHUB_API_KEY to your .env file.');
    }
    const url = new URL(`${FINNHUB_BASE_URL}${endpoint}`);
    url.searchParams.append('token', apiKey);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (data.error) {
      throw new Error(`Finnhub API error: ${data.error}`);
    }
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Finnhub: Get the latest stock quote (price, volume, etc.)
export async function getStockQuote(symbol) {
  const data = await makeApiCall('/quote', { symbol });
  return {
    price: data.c,
    volume: data.v,
    change: data.d,
    percentChange: data.dp
  };
}

// Finnhub: Get the stock profile (company info, market cap, sector, etc.)
export async function getStockProfile(symbol) {
  const data = await makeApiCall('/stock/profile2', { symbol });
  return {
    companyName: data.name,
    marketCap: typeof data.marketCapitalization === 'number' ? data.marketCapitalization * 1_000_000 : undefined,
    sector: data.finnhubIndustry,
    industry: data.industry
  };
}

// Finnhub: Get historical candles (prices and volumes)
export async function getStockCandles(symbol, options = {}) {
  const now = Math.floor(Date.now() / 1000);
  const from = options.from || Math.floor((Date.now() - 60 * 24 * 60 * 60 * 1000) / 1000); // 60 days ago
  const to = options.to || now;
  const resolution = options.resolution || 'D';
  const data = await makeApiCall('/stock/candle', {
    symbol,
    resolution,
    from,
    to
  });
  return {
    closes: data.c || [],
    volumes: data.v || [],
    timestamps: data.t || []
  };
}

// News caching system
const NEWS_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const getNewsCacheKey = (symbol) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  return `news_${symbol}_${today}`;
};

const getCachedNews = (symbol) => {
  try {
    const cacheKey = getNewsCacheKey(symbol);
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      if (now - timestamp < NEWS_CACHE_DURATION) {
        console.log(`[Finnhub Provider] Using cached news for ${symbol}`);
        return data;
      } else {
        console.log(`[Finnhub Provider] Cache expired for ${symbol}, removing`);
        localStorage.removeItem(cacheKey);
      }
    }
    return null;
  } catch (error) {
    console.error('[Finnhub Provider] Error reading news cache:', error);
    return null;
  }
};

const setCachedNews = (symbol, data) => {
  try {
    const cacheKey = getNewsCacheKey(symbol);
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log(`[Finnhub Provider] Cached news for ${symbol}`);
  } catch (error) {
    console.error('[Finnhub Provider] Error writing news cache:', error);
  }
};

/**
 * Get company news
 * @param {string} symbol
 * @param {object} options (e.g., { from: '2024-01-01', to: '2024-01-31' })
 * @returns {Promise<Array>} Array of news articles
 */
export async function getCompanyNews(symbol, options = {}) {
  console.log(`[Finnhub Provider] Getting news for ${symbol}`, options);
  
  try {
    // Check cache first
    const cachedNews = getCachedNews(symbol);
    if (cachedNews) {
      return cachedNews;
    }

    // Default to last 7 days if no dates provided
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const from = options.from || sevenDaysAgo.toISOString().split('T')[0];
    const to = options.to || now.toISOString().split('T')[0];
    
    const params = {
      symbol,
      from,
      to,
      token: import.meta.env.VITE_FINNHUB_API_KEY
    };
    
    const data = await makeApiCall('/company-news', params);
    
    if (data && Array.isArray(data)) {
      // Cache the results
      setCachedNews(symbol, data);
      return data;
    } else {
      console.warn(`[Finnhub Provider] No news data found for ${symbol}`);
      return [];
    }
  } catch (error) {
    console.error(`[Finnhub Provider] Error getting news for ${symbol}:`, error);
    return [];
  }
} 