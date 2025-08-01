# PoundFoolish - Technical Specifications

## Overview
PoundFoolish is a pure frontend web application for screening promising penny stocks by dynamically fetching and analyzing US stock market data. The app fetches all US stock symbols from Finnhub, intelligently filters out non-stocks, and screens them using configurable criteria. Built with React (Vite), styled with Tailwind CSS, and easily deployable to Vercel or Netlify.

## Tech Stack
- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS
- **State Management:** React hooks
- **Routing:** React Router
- **API:** Finnhub (free tier) with Yahoo Finance fallback
- **Deployment:** Vercel or Netlify

## Project Structure
```
poundfoolish/
├── src/
│   ├── components/         # UI components (StockDetailPage, etc.)
│   ├── hooks/              # Custom React hooks (useStockData)
│   ├── utils/              # Filtering, API helpers, data providers
│   │   ├── dataProviders/  # API providers (finnhub, yahoo)
│   │   ├── stockFilters.js # Filtering logic
│   │   └── stockUtils.js   # Symbol utilities
│   ├── App.jsx             # Main app
│   └── main.jsx            # Entry point
├── public/                 # Static assets
├── tailwind.config.js      # Tailwind config
├── vite.config.js          # Vite config
└── package.json            # Dependencies
```

## Core Features
- **Dynamic Symbol Discovery:** Fetches all US stock symbols from Finnhub
- **Intelligent Filtering:** Removes ETFs, preferred shares, warrants, rights, units, and ADRs
- **Optimized Sampling:** Takes random subsets (default 15 symbols) optimized for news integration
- **Batch Processing:** Fetches stock data and optional news in small batches respecting API rate limits
- **Configurable Screening:** Filters stocks by penny stock criteria (price, market cap, volume, news)
- **News Integration:** Company news filtering with 24-hour caching
- **Stock Detail Pages:** Comprehensive stock information and trading plans
- **Trading Plans:** Automated entry, stop loss, and target calculations
- **Rate Limit Management:** Built-in throttling and intelligent batching

## API Integration
- **Symbol Discovery:** Uses Finnhub `/stock/symbol?exchange=US` endpoint
- **Stock Data:** Uses `/quote` and `/profile2` endpoints for each symbol
- **News Data:** Uses `/company-news` endpoint with smart caching
- **Rate Limiting:** 60 calls per minute, managed with intelligent delays
- **Provider Abstraction:** Supports both Finnhub and Yahoo Finance providers

## Screening Process
1. **Fetch All US Symbols:** ~8,000+ symbols from Finnhub
2. **Filter Non-Stocks:** Remove ETFs, preferred shares, warrants, etc.
3. **Random Selection:** Take subset (default 15) optimized for news integration
4. **Batch Data Fetching:** Get quote, profile, and optional news data
5. **Apply Filters:** Screen for penny stock criteria including news activity
6. **Display Results:** Show matching stocks with relevant data
7. **Detail Pages:** Click any stock for comprehensive analysis and trading plans

## Screening Criteria (Implemented)
- **Price:** Under $5.00
- **Market Cap:** $20M - $300M
- **Volume:** Minimum 500,000 shares
- **Price Change:** 5%+ daily change
- **Volume Spike:** Relative volume > 2.0x
- **News Activity:** Optional filter for stocks with recent news (last 7 days)

## News Integration
- **News Filtering:** Toggle to require stocks with recent news activity
- **Smart Caching:** 24-hour cache to avoid repeated API calls
- **Rate Optimization:** 15 symbols × 2-4 calls = stays within 60/min limit
- **News Display:** Actual articles with headlines, summaries, and links
- **Cache Management:** Automatic cache expiration and cleanup

## Trading Plans
- **Entry Price:** Current market price
- **Stop Loss:** Dynamic based on recent lows or percentage
- **Target:** Dynamic based on recent highs or percentage
- **Position Sizing:** Based on max risk and max position parameters
- **Risk Analysis:** Per-share and total risk/reward calculations
- **Configurable Settings:** Adjustable risk parameters and calculation modes

## Performance Considerations
- **API Efficiency:** 2-4 calls per symbol (quote + profile + optional news)
- **Batch Size:** Optimized for 15 symbols with news integration
- **Rate Limit:** 60 calls/minute = ~15 symbols/minute with news
- **Cache Strategy:** 24-hour news cache reduces API calls
- **Memory Usage:** Minimal - processes data in batches

## UI/UX
- Clean, modern, mobile-friendly design
- Collapsible filter panel
- Stock detail pages with comprehensive information
- Trading plan generation with configurable parameters
- News article display with direct links
- Loading states with progress indication
- Error handling and fallback states

## Deployment
- Deploy to Vercel or Netlify
- Configure API key in environment variables
- No backend required

## Future Enhancements
- Additional technical indicators when historical data is available
- User accounts, watchlists, and alerts
- Backend for advanced features (optional)
- Enhanced caching strategies
- Additional data providers

## Risks & Mitigation
- **API rate limits:** Batched requests, client-side throttling, intelligent delays
- **API downtime:** Error handling and fallback to sample symbols
- **CORS issues:** Finnhub is CORS-enabled, Yahoo uses proxy fallbacks
- **Large symbol sets:** Random sampling and configurable limits
- **News API limits:** Smart caching and rate limit optimization

## Success Metrics
- Fast load times (<3s for initial load)
- Responsive on all devices
- No backend required for MVP
- Handles API rate limits gracefully
- Provides meaningful penny stock discoveries with news context
- Generates actionable trading plans 