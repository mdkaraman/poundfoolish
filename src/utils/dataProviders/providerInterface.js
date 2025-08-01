/**
 * Stock Data Provider Interface
 *
 * All data providers (Finnhub, Yahoo, etc.) should implement these functions.
 * Each function should return normalized data in the specified shape.
 */

/**
 * Get the latest stock quote (price, volume, etc.)
 * @param {string} symbol
 * @returns {Promise<{ price: number, volume: number, change: number, percentChange: number }>} 
 */
export async function getStockQuote(symbol) {
  throw new Error('Not implemented');
}

/**
 * Get the stock profile (company info, market cap, sector, etc.)
 * @param {string} symbol
 * @returns {Promise<{ companyName: string, marketCap: number, sector: string, industry?: string }>} 
 */
export async function getStockProfile(symbol) {
  throw new Error('Not implemented');
}

/**
 * Get historical candles (prices and volumes)
 * @param {string} symbol
 * @param {object} options (e.g., { period: '1mo', interval: '1d' })
 * @returns {Promise<{ closes: number[], volumes: number[], timestamps: number[] }>} 
 */
export async function getStockCandles(symbol, options) {
  throw new Error('Not implemented');
}

/**
 * Get recent company news
 * @param {string} symbol
 * @param {object} options (e.g., { from, to })
 * @returns {Promise<Array<{ headline: string, summary: string, url: string, datetime: number }>>}
 */
export async function getCompanyNews(symbol, options) {
  throw new Error('Not implemented');
} 