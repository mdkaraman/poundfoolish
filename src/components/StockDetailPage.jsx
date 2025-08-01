import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Trading plan calculation function
function calculateTradePlan(stock, maxRisk = 100, maxPosition = 2000, stopLossMode = 'auto', stopLossPct = 12, targetMode = 'auto', targetPct = 20) {
  if (!stock.price || stock.price <= 0) {
    return null;
  }

  const entryPrice = stock.price;
  let stopLoss, target, stopFromCandle = false, targetFromCandle = false;

  // Stop Loss
  if (stopLossMode === 'auto') {
    if (stock.candles && Array.isArray(stock.candles.c) && stock.candles.c.length >= 2) {
      const closes = stock.candles.c.slice(-6, -1).length >= 1 ? stock.candles.c.slice(-6, -1) : stock.candles.c.slice(-5);
      if (closes.length >= 1) {
        const lowestClose = Math.min(...closes);
        if (lowestClose < entryPrice) {
          stopLoss = lowestClose;
          stopFromCandle = true;
        }
      }
    }
    if (!stopLoss) {
      stopLoss = entryPrice * (1 - stopLossPct / 100);
      stopFromCandle = false;
    }
  } else {
    stopLoss = entryPrice * (1 - stopLossPct / 100);
    stopFromCandle = false;
  }

  // Target
  if (targetMode === 'auto') {
    if (stock.candles && Array.isArray(stock.candles.c) && stock.candles.c.length >= 2) {
      const closes = stock.candles.c.slice(-6, -1).length >= 1 ? stock.candles.c.slice(-6, -1) : stock.candles.c.slice(-5);
      if (closes.length >= 1) {
        const highestClose = Math.max(...closes);
        if (highestClose > entryPrice) {
          target = highestClose;
          targetFromCandle = true;
        }
      }
    }
    if (!target) {
      target = entryPrice * (1 + targetPct / 100);
      targetFromCandle = false;
    }
  } else {
    target = entryPrice * (1 + targetPct / 100);
    targetFromCandle = false;
  }

  // Position sizing
  const riskPerShare = entryPrice - stopLoss;
  let shares = riskPerShare > 0 ? Math.floor(maxRisk / riskPerShare) : 0;
  let totalCost = shares * entryPrice;
  if (totalCost > maxPosition) {
    shares = Math.floor(maxPosition / entryPrice);
    totalCost = shares * entryPrice;
  }

  // Risk/reward ratio
  let riskRewardRatio = 'N/A';
  if (stopFromCandle && targetFromCandle && (target - entryPrice) > 0 && riskPerShare > 0) {
    riskRewardRatio = ((target - entryPrice) / riskPerShare).toFixed(2);
  }

  return {
    entryPrice: entryPrice.toFixed(2),
    stopLoss: stopLoss.toFixed(2),
    target: target.toFixed(2),
    shares,
    totalCost: totalCost.toFixed(2),
    risk: riskPerShare > 0 ? riskPerShare.toFixed(2) : 'N/A',
    reward: (target - entryPrice) > 0 ? (target - entryPrice).toFixed(2) : 'N/A',
    riskRewardRatio
  };
}

function StockDetailPage() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [stock, setStock] = useState(null);

  // Trade settings state
  const [showSettings, setShowSettings] = useState(false);
  const [maxRisk, setMaxRisk] = useState(100);
  const [maxPosition, setMaxPosition] = useState(2000);
  const [stopLossMode, setStopLossMode] = useState('auto');
  const [stopLossPct, setStopLossPct] = useState(12);
  const [targetMode, setTargetMode] = useState('auto');
  const [targetPct, setTargetPct] = useState(20);

  useEffect(() => {
    // Try to get the stock from localStorage (set in main screener on click)
    const stockData = localStorage.getItem(`stock_${symbol}`);
    if (stockData) {
      setStock(JSON.parse(stockData));
    }
  }, [symbol]);

  if (!stock) {
    return (
      <div className="min-h-screen bg-background p-8">
        <button
          className="mb-6 btn-secondary"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <div className="max-w-2xl mx-auto card">
          <h2 className="text-2xl font-bold mb-4 text-text">
            Stock Details: {symbol}
          </h2>
          <p className="text-text-secondary">Loading stock details...</p>
        </div>
      </div>
    );
  }

  const trade = calculateTradePlan(
    stock,
    maxRisk,
    maxPosition,
    stopLossMode,
    stopLossPct,
    targetMode,
    targetPct
  );

  return (
    <div className="min-h-screen bg-background p-8">
      <button
        className="mb-6 btn-secondary"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>
      <div className="max-w-2xl mx-auto card">
        <h2 className="text-2xl font-bold mb-6 text-text">
          Stock Details: {symbol}
        </h2>
        <div className="mb-8 space-y-3">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="font-medium text-text-secondary">Company:</span>
            <span className="font-medium text-text">{stock.companyName || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="font-medium text-text-secondary">Price:</span>
            <span className="font-medium text-text">${stock.price ?? 'N/A'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="font-medium text-text-secondary">Change:</span>
            <span className={`font-medium ${stock.percentChange > 0 ? 'text-green-600' : stock.percentChange < 0 ? 'text-red-600' : 'text-text'}`}>
              {stock.change ?? 'N/A'} ({stock.percentChange ?? 'N/A'}%)
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="font-medium text-text-secondary">Market Cap:</span>
            <span className="font-medium text-text">{stock.marketCap ? `$${stock.marketCap.toLocaleString()}` : 'N/A'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="font-medium text-text-secondary">Sector:</span>
            <span className="font-medium text-text">{stock.sector || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="font-medium text-text-secondary">Volume:</span>
            <span className="font-medium text-text">{stock.volume ? stock.volume.toLocaleString() : 'N/A'}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="font-medium text-text-secondary">Relative Volume:</span>
            <span className="font-medium text-text">{stock.relativeVolume ?? 'N/A'}</span>
          </div>
        </div>
        
        {trade && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-text">
              Potential Trading Plan
            </h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-sm text-text-secondary">Entry Price</div>
                  <div className="text-lg font-bold text-text">${trade.entryPrice}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-text-secondary">Stop Loss</div>
                  <div className="text-lg font-bold text-red-600">${trade.stopLoss}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-text-secondary">Target</div>
                  <div className="text-lg font-bold text-green-600">${trade.target}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-text-secondary">Shares</div>
                  <div className="text-lg font-bold text-text">{trade.shares}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-text-secondary">Total Cost</div>
                  <div className="text-lg font-bold text-text">${trade.totalCost}</div>
                </div>
                {trade.riskRewardRatio !== 'N/A' && (
                  <div className="text-center">
                    <div className="text-sm text-text-secondary">Risk/Reward</div>
                    <div className="text-lg font-bold text-accent">{trade.riskRewardRatio}:1</div>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-green-200">
                <div className="text-sm text-text-secondary mb-2">Risk Analysis:</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Risk per share:</span>
                    <span className="font-medium">${trade.risk}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Potential reward per share:</span>
                    <span className="font-medium">${trade.reward}</span>
                  </div>
                </div>
              </div>
              {/* Total risk and reward for the trade - bottom line summary */}
              <div className="flex flex-col md:flex-row md:justify-center md:space-x-8 mt-6 text-center">
                <div className="mb-2 md:mb-0">
                  <span className="font-semibold text-text">You could lose: </span>
                  <span className="font-bold text-red-600">${(trade.risk !== 'N/A' && trade.shares > 0) ? (parseFloat(trade.risk) * trade.shares).toFixed(2) : 'N/A'}</span>
                </div>
                <div>
                  <span className="font-semibold text-text">You could make: </span>
                  <span className="font-bold text-green-600">${(trade.reward !== 'N/A' && trade.shares > 0) ? (parseFloat(trade.reward) * trade.shares).toFixed(2) : 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-text-secondary mb-2">💡 Trading Strategy:</div>
              <ul className="text-sm space-y-1 text-text">
                <li>• Enter at ${trade.entryPrice} or better</li>
                <li>• Set stop loss at ${trade.stopLoss}</li>
                <li>• Target ${trade.target} for profit</li>
                <li>• Buy {trade.shares} shares (max ${maxRisk} risk, max ${maxPosition} position)</li>
                {trade.riskRewardRatio !== 'N/A' && (
                  <li>• Risk/Reward ratio: {trade.riskRewardRatio}:1</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Collapsible Trade Settings Panel */}
      <div className="max-w-2xl mx-auto mt-6">
        <button
          className="flex items-center text-sm text-text-secondary hover:text-text transition-colors mb-2"
          onClick={() => setShowSettings(s => !s)}
        >
          <svg className={`w-5 h-5 mr-2 transition-transform ${showSettings ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Trade Settings
          <svg className={`w-4 h-4 ml-1 transition-transform ${showSettings ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showSettings && (
          <div className="card p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Max Risk per Trade ($)
                </label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  className="input-field w-full"
                  value={maxRisk}
                  onChange={e => setMaxRisk(Math.max(1, Number(e.target.value)))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Max Position Size ($)
                </label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  className="input-field w-full"
                  value={maxPosition}
                  onChange={e => setMaxPosition(Math.max(1, Number(e.target.value)))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Stop Loss
                </label>
                <div className="flex items-center space-x-2">
                  <select
                    className="input-field w-28"
                    value={stopLossMode}
                    onChange={e => setStopLossMode(e.target.value)}
                  >
                    <option value="auto">Auto</option>
                    <option value="custom">Custom %</option>
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    step={1}
                    className="input-field w-20"
                    value={stopLossPct}
                    onChange={e => setStopLossPct(Math.max(1, Math.min(99, Number(e.target.value))))}
                    disabled={stopLossMode !== 'custom'}
                  />
                  <span className="text-sm text-text-secondary">%</span>
                </div>
                <div className="text-xs text-text-secondary mt-1">Auto = recent low; Custom = % below entry</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Target
                </label>
                <div className="flex items-center space-x-2">
                  <select
                    className="input-field w-28"
                    value={targetMode}
                    onChange={e => setTargetMode(e.target.value)}
                  >
                    <option value="auto">Auto</option>
                    <option value="custom">Custom %</option>
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    step={1}
                    className="input-field w-20"
                    value={targetPct}
                    onChange={e => setTargetPct(Math.max(1, Math.min(500, Number(e.target.value))))}
                    disabled={targetMode !== 'custom'}
                  />
                  <span className="text-sm text-text-secondary">%</span>
                </div>
                <div className="text-xs text-text-secondary mt-1">Auto = recent high; Custom = % above entry</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent News Section */}
      {stock.hasRecentNews && (
        <div className="max-w-2xl mx-auto mt-6">
          <div className="card mb-6">
            <h3 className="text-lg font-semibold text-text mb-4">
              Recent News ({stock.newsCount || 0} articles)
            </h3>
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-emerald-800">
                    News activity detected - consider this in your trading decision
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* News Articles Section */}
      {stock.news && stock.news.length > 0 && (
        <div className="max-w-2xl mx-auto mt-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-text mb-4">
              Latest News Articles
            </h3>
            <div className="space-y-4">
              {stock.news.slice(0, 5).map((article, index) => (
                <div key={index} className="border border-border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-text text-sm leading-tight">
                      {article.headline || article.title || 'No headline available'}
                    </h4>
                    {article.datetime && (
                      <span className="text-xs text-text-secondary ml-2 flex-shrink-0">
                        {new Date(article.datetime * 1000).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {article.summary && (
                    <p className="text-sm text-text-secondary mb-3 line-clamp-3">
                      {article.summary}
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-secondary">
                      {article.source || 'Unknown source'}
                    </span>
                    {article.url && (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-accent hover:text-accent-dark transition-colors flex items-center"
                      >
                        Read Full Article
                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {stock.news.length > 5 && (
                <div className="text-center pt-2">
                  <p className="text-sm text-text-secondary">
                    Showing 5 of {stock.news.length} articles
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StockDetailPage; 