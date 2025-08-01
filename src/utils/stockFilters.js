// Stock filtering logic for PoundFoolish

// Technical Indicators Class
export class TechnicalIndicators {
  // Simple Moving Average
  static calculateSMA(prices, period) {
    if (prices.length < period) return null;
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  // Volume Weighted Average Price
  static calculateVWAP(priceVolumeData) {
    if (!priceVolumeData || priceVolumeData.length === 0) return null;
    
    const totalVolume = priceVolumeData.reduce((sum, item) => sum + item.volume, 0);
    const volumePriceSum = priceVolumeData.reduce((sum, item) => 
      sum + (item.price * item.volume), 0);
    
    return volumePriceSum / totalVolume;
  }

  // Relative Strength Index
  static calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return null;
    
    const gains = [];
    const losses = [];
    
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i-1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  // Exponential Moving Average
  static calculateEMA(prices, period) {
    if (prices.length === 0) return null;
    
    const multiplier = 2 / (period + 1);
    let ema = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }
    
    return ema;
  }

  // MACD (Moving Average Convergence Divergence)
  static calculateMACD(prices) {
    if (prices.length < 26) return null;
    
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    
    if (!ema12 || !ema26) return null;
    
    const macdLine = ema12 - ema26;
    const signalLine = this.calculateEMA([...Array(26).fill(0), macdLine], 9);
    const histogram = macdLine - signalLine;
    
    return {
      macd: macdLine,
      signal: signalLine,
      histogram: histogram,
      bullish: macdLine > signalLine
    };
  }

  // Calculate all indicators for a stock
  static calculateAllIndicators(stockData) {
    if (!stockData.candles || !stockData.candles.c) return null;
    
    const prices = stockData.candles.c;
    const volumes = stockData.candles.v;
    
    // Create price-volume data for VWAP
    const priceVolumeData = prices.map((price, index) => ({
      price,
      volume: volumes[index] || 0
    }));
    
    return {
      SMA_50: this.calculateSMA(prices, 50),
      VWAP: this.calculateVWAP(priceVolumeData),
      RSI_14: this.calculateRSI(prices, 14),
      MACD: this.calculateMACD(prices)
    };
  }
}

// Stock filtering functions
export const filterPromisingPennyStocks = (stocks, filters) => {
  console.log(`[Stock Filters] Filtering ${stocks.length} stocks with criteria:`, filters);
  
  return stocks.filter(stock => {
    // Skip stocks with missing essential data
    if (!stock.price || stock.price <= 0) {
      console.log(`[Stock Filters] Skipping ${stock.symbol}: invalid price`);
      return false;
    }

    // Price filter
    if (filters.maxPrice && stock.price > filters.maxPrice) {
      console.log(`[Stock Filters] Skipping ${stock.symbol}: price ${stock.price} > ${filters.maxPrice}`);
      return false;
    }

    // Volume filter
    if (filters.minVolume && stock.volume < filters.minVolume) {
      console.log(`[Stock Filters] Skipping ${stock.symbol}: volume ${stock.volume} < ${filters.minVolume}`);
      return false;
    }

    // Market cap filter
    if (filters.minMarketCap && stock.marketCap < filters.minMarketCap) {
      console.log(`[Stock Filters] Skipping ${stock.symbol}: market cap ${stock.marketCap} < ${filters.minMarketCap}`);
      return false;
    }
    if (filters.maxMarketCap && stock.marketCap > filters.maxMarketCap) {
      console.log(`[Stock Filters] Skipping ${stock.symbol}: market cap ${stock.marketCap} > ${filters.maxMarketCap}`);
      return false;
    }

    // Relative volume filter
    if (filters.minRelativeVolume && stock.relativeVolume !== 'N/A') {
      const relativeVolume = parseFloat(stock.relativeVolume);
      if (relativeVolume < filters.minRelativeVolume) {
        console.log(`[Stock Filters] Skipping ${stock.symbol}: relative volume ${relativeVolume} < ${filters.minRelativeVolume}`);
        return false;
      }
    }

    // Percent change filter
    if (filters.minPercentChange && stock.percentChange < filters.minPercentChange) {
      console.log(`[Stock Filters] Skipping ${stock.symbol}: percent change ${stock.percentChange}% < ${filters.minPercentChange}%`);
      return false;
    }

    // Recent news filter
    if (filters.requireRecentNews && !stock.hasRecentNews) {
      console.log(`[Stock Filters] Skipping ${stock.symbol}: no recent news (found ${stock.newsCount} articles)`);
      return false;
    }

    console.log(`[Stock Filters] ✅ ${stock.symbol} passed all filters`);
    return true;
  });
};

// RSI-based filtering
export const filterByRSI = (stocks, rsiType = 'oversold') => {
  return stocks.filter(stock => {
    if (!stock.indicators || !stock.indicators.RSI_14) return true;
    
    const rsi = stock.indicators.RSI_14;
    if (rsiType === 'oversold') return rsi < 30;
    if (rsiType === 'overbought') return rsi > 70;
    return true;
  });
};

// MACD signal filtering
export const filterByMACD = (stocks) => {
  return stocks.filter(stock => {
    if (!stock.indicators || !stock.indicators.MACD) return true;
    return stock.indicators.MACD.bullish;
  });
};

// Liquidity filtering
export const filterByLiquidity = (stocks, minMarketCap = 20000000) => {
  return stocks.filter(stock => stock.marketCap > minMarketCap);
};

// Process raw stock data into filtered format
export const processStockData = (rawData) => {
  if (!rawData.quote || !rawData.profile) return null;

  const quote = rawData.quote;
  const profile = rawData.profile;
  const news = rawData.news || []; // Handle news data

  // Calculate relative volume (if available)
  const relativeVolume = quote.volume ? (quote.volume / 1000000).toFixed(2) : 'N/A';

  // Calculate technical indicators (disabled for now)
  const indicators = {
    // Technical indicators would go here
  };

  // Check for recent news (last 7 days)
  const hasRecentNews = news.length > 0;

  return {
    symbol: rawData.symbol,
    price: quote.price,           // Changed from quote.c
    change: quote.change,         // Changed from quote.d
    percentChange: quote.percentChange, // Changed from quote.dp
    volume: quote.volume,         // Changed from quote.volume (same name)
    relativeVolume,
    marketCap: profile.marketCap, // Changed from profile.marketCapitalization
    companyName: profile.companyName, // Changed from profile.name
    sector: profile.sector,       // Changed from profile.finnhubIndustry
    indicators,
    hasRecentNews,
    newsCount: news.length, // Add news count for debugging
    news: news, // Store the actual news articles
    lastUpdated: new Date().toISOString()
  };
}; 