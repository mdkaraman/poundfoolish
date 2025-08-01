// Yahoo Finance Provider - Implementation
// 
// ⚠️  CURRENT STATUS: NON-FUNCTIONAL
// 
// This provider is currently not working due to Yahoo Finance API changes:
// - Returns 401 Unauthorized errors from Yahoo Finance endpoints
// - CORS proxies are working but Yahoo is rejecting requests
// - Public endpoints may now require authentication
//
// 🔧 TO MAKE FUNCTIONAL, ONE OF THESE APPROACHES IS NEEDED:
//
// 1. BACKEND PROXY (Recommended):
//    - Create a serverless function (Vercel/Netlify) to proxy requests
//    - Add proper authentication headers
//    - Handle rate limiting server-side
//
// 2. DIFFERENT YAHOO LIBRARY:
//    - Use yahoo-finance2 npm package
//    - Implement proper error handling
//    - Handle API rate limits
//
// 3. HYBRID APPROACH:
//    - Use Finnhub for quotes/profiles
//    - Use Yahoo for historical data only
//    - Implement automatic fallback
//
// 4. ALTERNATIVE YAHOO ENDPOINTS:
//    - Try different Yahoo Finance API endpoints
//    - Implement proper user-agent headers
//    - Use different authentication method
//
// 📝 CURRENT IMPLEMENTATION:
// - Uses CORS proxy (api.allorigins.win)
// - Attempts to fetch quotes and profiles
// - Returns safe defaults on errors
// - Logs detailed error information
//
// 🚀 FOR NOW: Use Finnhub provider (VITE_STOCK_PROVIDER=finnhub)
// 
// Uses Yahoo Finance's public API endpoints with reliable CORS proxy

// Simple and reliable proxy approach
const makeYahooRequest = async (url) => {
  // Use a more reliable proxy that works better with Yahoo Finance
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  
  try {
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Proxy request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[Yahoo Provider] Proxy request failed:', error);
    throw error;
  }
};

/**
 * Get the latest stock quote (price, volume, etc.)
 * @param {string} symbol
 * @returns {Promise<{ price: number, volume: number, change: number, percentChange: number }>} 
 */
export async function getStockQuote(symbol) {
  console.log(`[Yahoo Provider] Getting quote for ${symbol}`);
  
  try {
    // Use the more reliable proxy approach
    const yahooUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`;
    const data = await makeYahooRequest(yahooUrl);
    
    console.log(`[Yahoo Provider] Raw response for ${symbol}:`, data);
    
    if (!data.quoteResponse || !data.quoteResponse.result || data.quoteResponse.result.length === 0) {
      throw new Error(`No quote data found for ${symbol}`);
    }
    
    const quote = data.quoteResponse.result[0];
    
    return {
      price: quote.regularMarketPrice || 0,
      volume: quote.regularMarketVolume || 0,
      change: quote.regularMarketChange || 0,
      percentChange: quote.regularMarketChangePercent || 0
    };
  } catch (error) {
    console.error(`[Yahoo Provider] Error fetching quote for ${symbol}:`, error);
    // Return safe defaults on error
    return {
      price: 0,
      volume: 0,
      change: 0,
      percentChange: 0
    };
  }
}

/**
 * Get the stock profile (company info, market cap, sector, etc.)
 * @param {string} symbol
 * @returns {Promise<{ companyName: string, marketCap: number, sector: string, industry?: string }>} 
 */
export async function getStockProfile(symbol) {
  console.log(`[Yahoo Provider] Getting profile for ${symbol}`);
  
  try {
    // Use the more reliable proxy approach
    const yahooUrl = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=summaryDetail,assetProfile`;
    const data = await makeYahooRequest(yahooUrl);
    
    console.log(`[Yahoo Provider] Raw profile response for ${symbol}:`, data);
    
    if (!data.quoteSummary || !data.quoteSummary.result || data.quoteSummary.result.length === 0) {
      throw new Error(`No profile data found for ${symbol}`);
    }
    
    const result = data.quoteSummary.result[0];
    const summaryDetail = result.summaryDetail;
    const assetProfile = result.assetProfile;
    
    return {
      companyName: assetProfile?.longName || assetProfile?.shortName || 'N/A',
      marketCap: summaryDetail?.marketCap || 0,
      sector: assetProfile?.sector || 'N/A',
      industry: assetProfile?.industry || 'N/A'
    };
  } catch (error) {
    console.error(`[Yahoo Provider] Error fetching profile for ${symbol}:`, error);
    // Return safe defaults on error
    return {
      companyName: 'N/A',
      marketCap: 0,
      sector: 'N/A',
      industry: 'N/A'
    };
  }
}

/**
 * Get historical candles (prices and volumes)
 * @param {string} symbol
 * @param {object} options (e.g., { period: '1mo', interval: '1d' })
 * @returns {Promise<{ closes: number[], volumes: number[], timestamps: number[] }>} 
 */
export async function getStockCandles(symbol, options = {}) {
  console.log(`[Yahoo Provider] Getting candles for ${symbol}`, options);
  
  try {
    // Default to 60 days of daily data
    const period = options.period || '60d';
    const interval = options.interval || '1d';
    
    // Use the more reliable proxy approach
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${Math.floor((Date.now() - 60 * 24 * 60 * 60 * 1000) / 1000)}&period2=${Math.floor(Date.now() / 1000)}&interval=${interval}`;
    const data = await makeYahooRequest(yahooUrl);
    
    console.log(`[Yahoo Provider] Raw candles response for ${symbol}:`, data);
    
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error(`No chart data found for ${symbol}`);
    }
    
    const result = data.chart.result[0];
    const timestamps = result.timestamp || [];
    const quotes = result.indicators.quote[0];
    
    return {
      closes: quotes.close || [],
      volumes: quotes.volume || [],
      timestamps: timestamps
    };
  } catch (error) {
    console.error(`[Yahoo Provider] Error fetching candles for ${symbol}:`, error);
    // Return empty arrays on error
    return {
      closes: [],
      volumes: [],
      timestamps: []
    };
  }
}

/**
 * Get recent company news
 * @param {string} symbol
 * @param {object} options (e.g., { from, to })
 * @returns {Promise<Array<{ headline: string, summary: string, url: string, datetime: number }>>}
 */
export async function getCompanyNews(symbol, options = {}) {
  console.log(`[Yahoo Provider] Getting news for ${symbol}`, options);
  
  try {
    // TODO: Implement actual news fetching
    // Yahoo Finance doesn't have a direct news API in their public endpoints
    // Could use RSS feeds or other news sources in the future
    
    // For now, return empty array
    // In the future, could implement:
    // - Yahoo Finance RSS feeds
    // - News API integration
    // - Google News API
    
    return [];
  } catch (error) {
    console.error(`[Yahoo Provider] Error fetching news for ${symbol}:`, error);
    return [];
  }
}

/**
 * Make API call to Yahoo Finance
 * This is a utility function for making Yahoo Finance API calls
 */
export const makeApiCall = async (endpoint, params = {}) => {
  console.log(`[Yahoo Provider] API call to ${endpoint}`, params);
  
  try {
    // Use the more reliable proxy approach
    const yahooUrl = `https://query1.finance.yahoo.com${endpoint}`;
    const url = new URL(yahooUrl);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });
    
    const data = await makeYahooRequest(url.toString());
    
    if (data.error) {
      throw new Error(`Yahoo Finance API error: ${data.error}`);
    }
    
    return data;
  } catch (error) {
    console.error('[Yahoo Provider] API call failed:', error);
    throw error;
  }
}; 