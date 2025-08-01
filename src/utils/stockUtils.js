// Utility: Get all US stock symbols from the selected provider
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

export const getAllUSSymbols = async () => {
  const provider = import.meta.env.VITE_STOCK_PROVIDER || 'finnhub';
  console.log(`[Symbol Discovery] Environment variable VITE_STOCK_PROVIDER = "${import.meta.env.VITE_STOCK_PROVIDER}"`);
  console.log(`[Symbol Discovery] Using provider: ${provider}`);
  
  if (provider === 'yahoo') {
    console.log('[Symbol Discovery] Calling Yahoo Finance symbol discovery');
    return await getAllUSSymbolsFromYahoo();
  } else {
    console.log('[Symbol Discovery] Calling Finnhub symbol discovery');
    return await getAllUSSymbolsFromFinnhub();
  }
};

// Get symbols from Finnhub
const getAllUSSymbolsFromFinnhub = async () => {
  try {
    const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;
    if (!apiKey) {
      throw new Error('Finnhub API key not found. Please add VITE_FINNHUB_API_KEY to your .env file.');
    }
    const url = new URL(`${FINNHUB_BASE_URL}/stock/symbol`);
    url.searchParams.append('exchange', 'US');
    url.searchParams.append('token', apiKey);
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    const symbols = await response.json();
    console.log(`Fetched ${symbols.length} US symbols from Finnhub`);
    return symbols;
  } catch (error) {
    console.error('Error fetching US symbols from Finnhub:', error);
    throw error;
  }
};

// Get symbols from Yahoo Finance (placeholder - will use a curated list)
const getAllUSSymbolsFromYahoo = async () => {
  try {
    // Yahoo Finance doesn't have a public symbol list endpoint
    // Using a curated list of diverse US stocks for better screening results
    
    const commonStocks = [
      // Penny Stocks (Under $5)
      'SNDL', 'HEXO', 'ACB', 'TLRY', 'CGC', 'APHA', 'CRON', 'OGI',
      'NAKD', 'ZOM', 'IDEX', 'SENS', 'CTRM', 'CIDM', 'MARK', 'SHIP',
      'GNUS', 'IZEA', 'TOPS', 'SHIP', 'CIDM', 'MARK', 'ZOM', 'IDEX',
      'SENS', 'CTRM', 'CIDM', 'MARK', 'SHIP', 'GNUS', 'IZEA', 'TOPS',
      'SHIP', 'CIDM', 'MARK', 'ZOM', 'IDEX', 'SENS', 'CTRM', 'CIDM',
      
      // Small Cap Stocks ($5-$50)
      'PLTR', 'RBLX', 'HOOD', 'COIN', 'RIVN', 'LCID', 'NIO', 'XPEV',
      'LI', 'BYND', 'ZM', 'DOCU', 'SNOW', 'CRWD', 'NET', 'SQ', 'PYPL',
      'UBER', 'LYFT', 'DASH', 'ABNB', 'SNAP', 'PINS', 'SPOT', 'ZM',
      
      // Mid Cap Stocks ($50-$200)
      'AMD', 'NVDA', 'NFLX', 'TSLA', 'META', 'GOOGL', 'AMZN', 'AAPL',
      'MSFT', 'ORCL', 'CRM', 'ADBE', 'PYPL', 'NKE', 'DIS', 'JPM',
      'BAC', 'WFC', 'GS', 'MS', 'JNJ', 'PFE', 'UNH', 'HD', 'LOW',
      'COST', 'TGT', 'WMT', 'AMGN', 'ABBV', 'LLY', 'V', 'MA', 'UNH',
      
      // Large Cap Stocks ($200+)
      'BRK.A', 'BRK.B', 'GOOGL', 'AMZN', 'AAPL', 'MSFT', 'TSLA', 'META',
      'NVDA', 'NFLX', 'ORCL', 'CRM', 'ADBE', 'PYPL', 'NKE', 'DIS',
      'JPM', 'BAC', 'WFC', 'GS', 'MS', 'JNJ', 'PFE', 'UNH', 'HD',
      'LOW', 'COST', 'TGT', 'WMT', 'AMGN', 'ABBV', 'LLY', 'V', 'MA',
      
      // Tech Sector
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'AMD', 'INTC',
      'ORCL', 'CRM', 'ADBE', 'NET', 'CRWD', 'SNOW', 'PLTR', 'ZM',
      'DOCU', 'SQ', 'PYPL', 'UBER', 'LYFT', 'DASH', 'ABNB', 'SNAP',
      
      // Healthcare/Biotech
      'JNJ', 'PFE', 'UNH', 'ABBV', 'LLY', 'AMGN', 'GILD', 'BMY',
      'SENS', 'IDEX', 'ZOM', 'GNUS', 'IZEA', 'TOPS', 'SHIP', 'CIDM',
      
      // Financial
      'JPM', 'BAC', 'WFC', 'GS', 'MS', 'V', 'MA', 'AXP', 'C', 'USB',
      
      // Consumer
      'AMZN', 'WMT', 'TGT', 'COST', 'HD', 'LOW', 'NKE', 'DIS', 'MCD',
      'SBUX', 'NFLX', 'SPOT', 'PINS', 'SNAP', 'ZM', 'DOCU', 'SQ',
      
      // Energy/EV
      'TSLA', 'NIO', 'XPEV', 'LI', 'RIVN', 'LCID', 'PLUG', 'FCEL',
      'BLDP', 'BEEM', 'SOL', 'SPWR', 'ENPH', 'SEDG', 'RUN', 'NOVA',
      
      // Cannabis
      'SNDL', 'HEXO', 'ACB', 'TLRY', 'CGC', 'APHA', 'CRON', 'OGI',
      'CURLF', 'GTBIF', 'TCNNF', 'JUSHF', 'MMNFF', 'VRNOF', 'ACBFF',
      
      // Gaming/Entertainment
      'RBLX', 'ATVI', 'EA', 'TTWO', 'ZNGA', 'U', 'SKLZ', 'GMBL',
      
      // Crypto/Fintech
      'COIN', 'SQ', 'PYPL', 'V', 'MA', 'AXP', 'HOOD', 'RBLX',
      
      // Real Estate
      'SPG', 'PLD', 'AMT', 'CCI', 'EQIX', 'DLR', 'O', 'AVB', 'EQR',
      
      // Industrial
      'CAT', 'DE', 'BA', 'LMT', 'RTX', 'GE', 'MMM', 'HON', 'EMR',
      
      // Materials
      'FCX', 'NEM', 'LIN', 'APD', 'ECL', 'BLL', 'ALB', 'NUE', 'X',
      
      // Utilities
      'NEE', 'DUK', 'SO', 'D', 'AEP', 'EXC', 'XEL', 'SRE', 'DTE'
    ];
    
    // Remove duplicates while preserving order
    const uniqueStocks = [...new Set(commonStocks)];
    
    // Convert to the same format as Finnhub
    const symbols = uniqueStocks.map(symbol => ({
      symbol,
      description: `${symbol} Stock`,
      type: 'Common Stock'
    }));
    
    console.log(`Using ${symbols.length} curated US symbols for Yahoo Finance`);
    return symbols;
  } catch (error) {
    console.error('Error getting symbols for Yahoo Finance:', error);
    throw error;
  }
};

// Utility: Filter out ETFs, preferred shares, and other non-stocks
export const filterStockSymbols = (symbols, maxCount = 100) => {
  const filtered = symbols.filter(symbol => {
    const { symbol: sym, type, description } = symbol;
    if (!sym) return false;
    if (type === 'ETF' || sym.includes('ETF') || description?.toUpperCase().includes('ETF')) return false;
    if (type === 'PREFERRED' || sym.includes('P') || sym.includes('PR') || description?.toUpperCase().includes('PREFERRED')) return false;
    if (type === 'WARRANT' || sym.includes('W') || sym.includes('WT') || description?.toUpperCase().includes('WARRANT')) return false;
    if (type === 'RIGHT' || sym.includes('R') || sym.includes('RT') || description?.toUpperCase().includes('RIGHT')) return false;
    if (type === 'UNIT' || sym.includes('U') || sym.includes('UN') || description?.toUpperCase().includes('UNIT')) return false;
    if (description?.toUpperCase().includes('ADR') || description?.toUpperCase().includes('AMERICAN DEPOSITARY')) return false;
    if (sym.length < 2) return false;
    if (/\d/.test(sym)) return false;
    return true;
  });
  console.log(`Filtered ${symbols.length} symbols down to ${filtered.length} stocks`);
  const shuffled = filtered.sort(() => 0.5 - Math.random());
  const subset = shuffled.slice(0, maxCount);
  console.log(`Selected ${subset.length} random stocks for screening`);
  return subset;
}; 