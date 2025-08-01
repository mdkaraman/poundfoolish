// API Helper functions for PoundFoolish
// This file re-exports the current provider's functions based on environment variable

// Determine which provider to use
const getProvider = () => {
  const provider = import.meta.env.VITE_STOCK_PROVIDER || 'finnhub';
  console.log(`[API Helpers] Environment variable VITE_STOCK_PROVIDER = "${import.meta.env.VITE_STOCK_PROVIDER}"`);
  console.log(`[API Helpers] Using stock data provider: ${provider}`);
  return provider;
};

// Import all providers
import * as finnhubProvider from './dataProviders/finnhubProvider';
import * as yahooProvider from './dataProviders/yahooProvider';

// Export functions from the selected provider
const provider = getProvider();

let currentProvider;
switch (provider) {
  case 'yahoo':
    console.log('[API Helpers] Loading Yahoo Finance provider');
    currentProvider = yahooProvider;
    break;
  case 'finnhub':
  default:
    console.log('[API Helpers] Loading Finnhub provider');
    currentProvider = finnhubProvider;
    break;
}

// Re-export all functions from the selected provider
export const getStockQuote = currentProvider.getStockQuote;
export const getStockProfile = currentProvider.getStockProfile;
export const getStockCandles = currentProvider.getStockCandles;
export const getCompanyNews = currentProvider.getCompanyNews;
export const makeApiCall = currentProvider.makeApiCall; 