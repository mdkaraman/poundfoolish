import { useState } from 'react';
import { useStockData } from './hooks/useStockData';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate
} from 'react-router-dom';
import StockDetailPage from './components/StockDetailPage';

function MainScreener() {
  const { refreshData, loading, filteredStocks, filters, updateFilters, symbolCount, error, retrying, cooldown, cooldownTime } = useStockData();
  const [symbolCountInput, setSymbolCountInput] = useState(15); // Changed from 50 to 15
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // Handler for filter input changes
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateFilters({
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    });
  };

  // Handler for refresh with custom symbol count
  const handleRefresh = () => {
    refreshData(symbolCountInput);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-5xl font-black tracking-wider text-text">#foolish</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="btn-primary" onClick={handleRefresh} disabled={loading || cooldown}>
                {loading ? 'Scanning...' : 'Refresh Data'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="max-w-2xl mx-auto mt-8 mb-4 error-message">
          <strong>Error:</strong> {error}
        </div>
      )}
      {cooldown && (
        <div className="max-w-2xl mx-auto mt-4 mb-4 p-3 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded text-center text-sm flex items-center justify-center">
          <svg className="w-5 h-5 mr-2 animate-pulse text-yellow-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
          API rate limit reached. Waiting {cooldownTime}s before retrying...
        </div>
      )}
      {/* Main Content */}
      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {symbolCount > 0 && (
            <div className="mb-6 flex items-center space-x-4">
              <p className="text-sm text-text-secondary">
                {filters.showAllStocks 
                  ? `Screening ${symbolCount} stocks • Showing all ${filteredStocks.length} stocks (filters bypassed)`
                  : `Screening ${symbolCount} stocks • Found ${filteredStocks.length} matches`
                }
              </p>
              {retrying && !cooldown && (
                <span className="flex items-center text-xs text-accent animate-pulse">
                  <svg className="w-4 h-4 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Retrying...
                </span>
              )}
            </div>
          )}

          {/* Stock List */}
          <div className="card mb-8">
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-text-secondary">
                {loading ? 'Loading...' : `${filteredStocks.length} stocks found`}
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 text-sm text-text-secondary hover:text-text transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                <span>Filters</span>
                <svg className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
                <p className="mt-4 text-text-secondary">Scanning for opportunities...</p>
                <p className="text-sm text-text-secondary mt-2">
                  This may take a minute due to API rate limits
                </p>
              </div>
            ) : filteredStocks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-text-secondary mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-text mb-2">
                  No stocks found
                </h3>
                <p className="text-text-secondary">
                  Try adjusting your filters or click "Refresh Data" to scan more stocks
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStocks.map(stock => (
                  <div
                    key={stock.symbol}
                    className="stock-card"
                    onClick={() => {
                      localStorage.setItem(`stock_${stock.symbol}`, JSON.stringify(stock));
                      navigate(`/stock/${stock.symbol}`);
                    }}
                  >
                    <div className="font-bold text-lg text-text mb-3">{stock.symbol} - {stock.companyName || 'N/A'}</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Price:</span>
                        <span className="font-medium text-text">${stock.price ?? 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Change:</span>
                        <span className={`font-medium ${stock.percentChange > 0 ? 'text-green-600' : stock.percentChange < 0 ? 'text-red-600' : 'text-text'}`}>
                          {stock.change ?? 'N/A'} ({stock.percentChange ?? 'N/A'}%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Market Cap:</span>
                        <span className="font-medium text-text">{stock.marketCap ? `$${(stock.marketCap / 1000000).toFixed(1)}M` : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Sector:</span>
                        <span className="font-medium text-text">{stock.sector || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Collapsible Filter Controls */}
          {showFilters && (
            <div className="card mb-8">
              <h3 className="text-lg font-semibold text-text mb-6">
                Screening Filters
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Symbol Count Input */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Number of Symbols
                  </label>
                  <input 
                    type="number" 
                    className="input-field w-full" 
                    value={symbolCountInput}
                    onChange={(e) => setSymbolCountInput(parseInt(e.target.value) || 15)}
                    min="1"
                    max="50"
                  />
                  <p className="text-xs text-text-secondary mt-1">
                    Default: 15 (allows room for news API calls)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Max Price
                  </label>
                  <input 
                    type="number" 
                    className="input-field w-full" 
                    name="maxPrice"
                    value={filters.maxPrice !== undefined ? filters.maxPrice : ''}
                    onChange={handleFilterChange}
                    disabled={filters.showAllStocks}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Min Volume
                  </label>
                  <input 
                    type="number" 
                    className="input-field w-full" 
                    name="minVolume"
                    value={filters.minVolume !== undefined ? filters.minVolume : ''}
                    onChange={handleFilterChange}
                    disabled={filters.showAllStocks}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Min Market Cap
                  </label>
                  <input 
                    type="number" 
                    className="input-field w-full" 
                    name="minMarketCap"
                    value={filters.minMarketCap !== undefined ? filters.minMarketCap : ''}
                    onChange={handleFilterChange}
                    disabled={filters.showAllStocks}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Max Market Cap
                  </label>
                  <input 
                    type="number" 
                    className="input-field w-full" 
                    name="maxMarketCap"
                    value={filters.maxMarketCap !== undefined ? filters.maxMarketCap : ''}
                    onChange={handleFilterChange}
                    disabled={filters.showAllStocks}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Min Volume Spike
                  </label>
                  <input 
                    type="number" 
                    className="input-field w-full" 
                    name="minRelativeVolume"
                    value={filters.minRelativeVolume !== undefined ? filters.minRelativeVolume : ''}
                    onChange={handleFilterChange}
                    disabled={filters.showAllStocks}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Min Price Change (%)
                  </label>
                  <input 
                    type="number" 
                    className="input-field w-full" 
                    name="minPercentChange"
                    value={filters.minPercentChange !== undefined ? filters.minPercentChange : ''}
                    onChange={handleFilterChange}
                    disabled={filters.showAllStocks}
                  />
                </div>
                <div className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    className="mr-3 w-4 h-4 text-accent border-border rounded focus:ring-accent"
                    name="requireRecentNews"
                    checked={filters.requireRecentNews}
                    onChange={handleFilterChange}
                    disabled={filters.showAllStocks}
                  />
                  <label className="text-sm font-medium text-text-secondary">
                    Require Recent News
                  </label>
                  {filters.requireRecentNews && (
                    <span className="ml-2 text-xs text-emerald-600 font-medium">
                      ⚠️ Slower screening
                    </span>
                  )}
                </div>
                <div className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    className="mr-3 w-4 h-4 text-accent border-border rounded focus:ring-accent"
                    name="showAllStocks"
                    checked={filters.showAllStocks}
                    onChange={handleFilterChange}
                  />
                  <label className="text-sm font-medium text-text-secondary">
                    Bypass Filters
                  </label>
                </div>
              </div>
            </div>
          )}
      </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm">
            <p>
              PoundFoolish - Penny Stock Screener | 
              <span className="text-accent ml-1">#foolish</span>
            </p>
            <p className="mt-1">
              This is for educational purposes only. Always do your own research before investing.
        </p>
      </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainScreener />} />
        <Route path="/stock/:symbol" element={<StockDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;
