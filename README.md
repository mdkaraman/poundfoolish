# PoundFoolish - Penny Stock Screener

A modern web application that identifies promising penny stocks by dynamically screening US stock markets using configurable criteria. Built with React, Vite, and Tailwind CSS, and powered by the Finnhub API.

## 🚀 Features

- **Dynamic Stock Screening**: Fetches and screens up to 15 US stocks in real-time (optimized for news integration)
- **Smart Filtering**: Automatically filters out ETFs, preferred shares, warrants, and other non-stocks
- **Configurable Screening**: Filter stocks by price, market cap, volume, price change, and news activity
- **News Integration**: Company news filtering with 24-hour caching
- **Stock Detail Pages**: Click any stock to view detailed information and trading plans
- **Trading Plans**: Automated trading plan generation with configurable risk parameters
- **Rate Limit Management**: Built-in API rate limiting with intelligent batching
- **Modern UI**: Clean, responsive design with collapsible filters

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **API**: Finnhub (free tier) with Yahoo Finance fallback
- **State Management**: React Hooks
- **Routing**: React Router
- **Deployment**: Vercel/Netlify ready

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Finnhub API key (free)

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd poundfoolish
npm install
```

### 2. Set up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp env.example .env.local
```

Edit `.env.local` and configure your settings:

```env
# Stock Data Provider Selection
# Options: 'finnhub' (default) or 'yahoo'
VITE_STOCK_PROVIDER=finnhub

# Finnhub API Configuration (required for finnhub provider)
VITE_FINNHUB_API_KEY=your_finnhub_api_key_here
```

### 3. Get a Finnhub API Key (if using Finnhub provider)

1. Visit [Finnhub.io](https://finnhub.io/register)
2. Sign up for a free account
3. Copy your API key
4. Add it to your `.env.local` file

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

## 📊 How It Works

1. **Symbol Discovery**: Fetches all US stock symbols from Finnhub
2. **Smart Filtering**: Removes ETFs, preferred shares, warrants, rights, units, and ADRs
3. **Random Selection**: Takes a random subset (default 15 symbols) to optimize for news integration
4. **Batch Processing**: Fetches stock data and optional news in small batches
5. **Penny Stock Filtering**: Applies your custom criteria to find promising opportunities
6. **Detail Pages**: Click any stock to view comprehensive details and trading plans

## 📊 Screening Criteria

### **Core Filters (Active)**
- **Price**: Under $5.00
- **Market Cap**: $20M - $300M
- **Volume**: Minimum 500,000 shares
- **Price Change**: 5%+ daily change
- **Volume Spike**: Relative volume > 2.0x
- **News Activity**: Optional filter for stocks with recent news

### **Advanced Features**
- **News Integration**: Company news from last 7 days with smart caching
- **Trading Plans**: Automated entry, stop loss, and target calculations
- **Risk Management**: Configurable position sizing and risk parameters

## 🏗️ Project Structure

```
poundfoolish/
├── src/
│   ├── components/          # React components (StockDetailPage, etc.)
│   ├── hooks/              # Custom React hooks (useStockData)
│   ├── utils/              # Utility functions and data providers
│   │   ├── dataProviders/  # API providers (finnhub, yahoo)
│   │   ├── stockFilters.js # Filtering logic
│   │   └── stockUtils.js   # Symbol utilities
│   ├── App.jsx             # Main app component
│   └── main.jsx            # App entry point
├── public/                 # Static assets
├── tailwind.config.js      # Tailwind configuration
├── vite.config.js          # Vite configuration
└── package.json            # Dependencies
```

## ⚙️ Configuration

All filter options are configurable in the UI:
- **Symbol Count**: 1-50 symbols (default: 15 for news optimization)
- **Price Filters**: Max price, min/max market cap
- **Volume Filters**: Min volume, volume spike threshold
- **News Filter**: Toggle to require recent news activity
- **Bypass Filters**: Show all stocks regardless of criteria

## 🚀 Deployment

- Deploy to Vercel or Netlify
- Configure API key in environment variables
- No backend required

## 📈 API Usage

- **Provider Selection**: Choose between Finnhub (default) or Yahoo Finance via `VITE_STOCK_PROVIDER`
- **Finnhub**: Free tier with 60 API calls per minute
- **Yahoo Finance**: Public endpoints with CORS proxy (no API key required)
- **News Integration**: Company news available via Finnhub `/company-news` endpoint
- **Rate Limit Optimization**: 15 symbols × 2-4 calls = stays within 60/min limit
- **Smart Caching**: News results cached for 24 hours

## 🔧 News Functionality

The app supports comprehensive news integration:
- **News Filter**: Toggle "Require Recent News" to only show stocks with recent news
- **Smart Caching**: News results cached for 24 hours to avoid repeated API calls
- **Rate Limit Optimization**: Default symbol count reduced to 15 to allow room for news calls
- **News Display**: Click any stock to view actual news articles with headlines, summaries, and links
- **Visual Indicators**: UI shows when news fetching is active

## 🔧 Yahoo Finance CORS Solution

The Yahoo Finance provider uses CORS proxies to bypass browser restrictions:
- **Primary**: `cors-anywhere.herokuapp.com`
- **Fallback**: `api.allorigins.win` and `corsproxy.io`
- **Automatic**: Switches to next proxy if one fails
- **No Setup**: Works out of the box with public endpoints

## ⚠️ Disclaimer

This application is for educational purposes only. Always do your own research before making investment decisions. The authors are not responsible for any financial losses.

---

**PoundFoolish** - Making penny stock screening #foolish! 🚀
