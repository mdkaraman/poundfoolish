import { useState, useEffect, useCallback, useRef } from 'react';
import { getStockQuote, getStockProfile, getCompanyNews } from '../utils/apiHelpers'; // Added getCompanyNews
import { getAllUSSymbols, filterStockSymbols } from '../utils/stockUtils';
import { filterPromisingPennyStocks, processStockData } from '../utils/stockFilters';

// Sample penny stock symbols for testing (fallback)
const SAMPLE_PENNY_STOCKS = [
  'SNDL', 'HEXO', 'ACB', 'TLRY', 'CGC', 'APHA', 'CRON', 'OGI'
];

// Fetch data for a single stock (quote + profile + optional news)
const getStockData = async (symbol, includeNews = false) => {
  try {
    console.log(`[useStockData] Fetching data for ${symbol}${includeNews ? ' (with news)' : ''}`);
    
    const [quote, profile] = await Promise.all([
      getStockQuote(symbol),
      getStockProfile(symbol)
    ]);
    
    let news = [];
    if (includeNews) {
      try {
        news = await getCompanyNews(symbol);
        console.log(`[useStockData] Fetched ${news.length} news articles for ${symbol}`);
      } catch (error) {
        console.warn(`[useStockData] Failed to fetch news for ${symbol}:`, error);
      }
    }
    
    return { symbol, quote, profile, news };
  } catch (error) {
    console.error(`[useStockData] Error fetching data for ${symbol}:`, error);
    throw error;
  }
};

export const useStockData = () => {
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fatalError, setFatalError] = useState(null); // new: only for true blocking errors
  const [retrying, setRetrying] = useState(false); // new: for UI indicator
  const [cooldown, setCooldown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [symbolCount, setSymbolCount] = useState(0);
  const [filters, setFilters] = useState({
    maxPrice: 5.00,
    minVolume: 500000,
    minMarketCap: 20000000,
    maxMarketCap: 300000000,
    minRelativeVolume: 2.0,
    minPercentChange: 5.0,
    requireRecentNews: false,
    bypassFilters: false,
    showAllStocks: false // Added to ensure this property is always defined
  });

  // Exponential backoff state
  const defaultDelay = useRef(60000); // 60 seconds
  const [retryDelay, setRetryDelay] = useState(defaultDelay.current);
  const retryTimer = useRef(null);
  const cooldownTimer = useRef(null);

  // Fetch stock data for a single symbol
  const fetchStockData = useCallback(async (symbol) => {
    try {
      const data = await getStockData(symbol);
      console.log('Raw API data for', symbol, data); // Log raw API response
      if (data.error) {
        console.warn(`Error fetching ${symbol}:`, data.error);
        return null;
      }
      const processed = processStockData(data);
      console.log('Processed stock data for', symbol, processed); // Log processed data
      return processed;
    } catch (error) {
      console.error(`Error fetching ${symbol}:`, error);
      return null;
    }
  }, []);

  // Get and filter US stock symbols
  const getStockSymbols = useCallback(async (maxSymbols = 15) => { // Changed from 150 to 15
    try {
      console.log('Fetching all US stock symbols...');
      const allSymbols = await getAllUSSymbols();
      const filteredSymbols = filterStockSymbols(allSymbols, maxSymbols);
      setSymbolCount(filteredSymbols.length);
      return filteredSymbols.map(s => s.symbol);
    } catch (error) {
      console.error('Error getting stock symbols:', error);
      setError('Failed to fetch stock symbols. Please check your internet connection or API key and try again.');
      setSymbolCount(0);
      return [];
    }
  }, []);

  // Fetch multiple stocks with rate limiting
  const fetchMultipleStocks = useCallback(async (symbols) => {
    setLoading(true);
    setError(null);
    setStocks([]);
    
    const results = [];
    const includeNews = filters.requireRecentNews; // Check if news filter is enabled
    
    console.log(`[useStockData] Fetching ${symbols.length} stocks${includeNews ? ' with news' : ''}`);
    
    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i];
      
      try {
        const stockData = await getStockData(symbol, includeNews);
        const processedStock = processStockData(stockData);
        
        if (processedStock) {
          results.push(processedStock);
          console.log(`[useStockData] Processed ${symbol}: ${processedStock.companyName}`);
        }
      } catch (error) {
        console.error(`[useStockData] Failed to fetch ${symbol}:`, error);
      }
      
      // Rate limiting: wait between requests
      if (i < symbols.length - 1) {
        const delay = includeNews ? 2000 : 1000; // Longer delay when fetching news
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    console.log(`[useStockData] Successfully fetched ${results.length} stocks`);
    setStocks(results);
    setLoading(false);
  }, [filters.requireRecentNews]); // Added dependency on news filter

  // Refresh all stock data with new symbols
  const refreshData = useCallback(async (maxSymbols = 15) => { // Changed from 150 to 15
    try {
      const symbols = await getStockSymbols(maxSymbols);
      await fetchMultipleStocks(symbols);
    } catch (error) {
      console.error('Error in refreshData:', error);
      setError(error.message);
    }
  }, [getStockSymbols, fetchMultipleStocks]);

  // Apply filters to stocks
  const applyFilters = useCallback((stockList, filterSettings) => {
    const filtered = filterPromisingPennyStocks(stockList, filterSettings);
    setFilteredStocks(filtered);
    return filtered;
  }, []);

  // Update filters and re-apply
  const updateFilters = useCallback((newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    applyFilters(stocks, updatedFilters);
  }, [filters, stocks, applyFilters]);

  // Sort stocks by various criteria
  const sortStocks = useCallback((stockList, sortBy = 'percentChange', sortOrder = 'desc') => {
    const sorted = [...stockList].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = 0;
      if (bValue === null || bValue === undefined) bValue = 0;
      
      if (sortOrder === 'desc') {
        return bValue - aValue;
      } else {
        return aValue - bValue;
      }
    });
    
    setFilteredStocks(sorted);
    return sorted;
  }, []);

  // Get stock statistics
  const getStats = useCallback(() => {
    if (filteredStocks.length === 0) {
      return {
        total: 0,
        averagePrice: 0,
        averageVolume: 0,
        averageMarketCap: 0,
        sectors: {}
      };
    }

    const total = filteredStocks.length;
    const averagePrice = filteredStocks.reduce((sum, stock) => sum + stock.price, 0) / total;
    const averageVolume = filteredStocks.reduce((sum, stock) => sum + stock.volume, 0) / total;
    const averageMarketCap = filteredStocks.reduce((sum, stock) => sum + stock.marketCap, 0) / total;
    
    const sectors = filteredStocks.reduce((acc, stock) => {
      const sector = stock.sector || 'Unknown';
      acc[sector] = (acc[sector] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      averagePrice,
      averageVolume,
      averageMarketCap,
      sectors
    };
  }, [filteredStocks]);

  // Apply filters whenever stocks or filters change
  useEffect(() => {
    if (stocks.length === 0) {
      setFilteredStocks([]);
      return;
    }

    // If showAllStocks is enabled, return all stocks without filtering
    if (filters.showAllStocks) {
      setFilteredStocks(stocks);
      return;
    }

    // Apply normal filtering logic
    const filtered = filterPromisingPennyStocks(stocks, filters);
    setFilteredStocks(filtered);
  }, [stocks, filters]);

  // Retry logic: if no filtered stocks, not loading, not fatal error, and stocks fetched, retry after a delay
  useEffect(() => {
    if (
      filteredStocks.length === 0 &&
      !loading &&
      !fatalError &&
      stocks.length > 0 &&
      !cooldown // don't retry if in cooldown
    ) {
      setRetrying(true);
      if (retryTimer.current) clearTimeout(retryTimer.current);
      retryTimer.current = setTimeout(() => {
        setRetrying(false);
        refreshData(symbolCount);
      }, retryDelay);
      return () => {
        if (retryTimer.current) clearTimeout(retryTimer.current);
        setRetrying(false);
      };
    } else {
      setRetrying(false);
    }
  }, [filteredStocks, loading, fatalError, refreshData, symbolCount, stocks.length, retryDelay, cooldown]);

  // Cooldown timer countdown
  useEffect(() => {
    if (cooldown && cooldownTime > 0) {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
      cooldownTimer.current = setInterval(() => {
        setCooldownTime(prev => {
          if (prev <= 1) {
            setCooldown(false);
            clearInterval(cooldownTimer.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(cooldownTimer.current);
    }
  }, [cooldown, cooldownTime]);

  return {
    stocks,
    filteredStocks,
    loading,
    error,
    retrying,
    cooldown,
    cooldownTime,
    filters,
    symbolCount,
    refreshData,
    updateFilters,
    // Utilities
    applyFilters
  };
}; 