# Technical Indicators Analysis for PoundFoolish

> **Note:** As of the current MVP, technical indicators (SMA, VWAP, RSI, MACD) are disabled due to Finnhub API limitations on historical data. The codebase is structured to support these indicators in the future when data access is available.

## Finnhub Data Available (Free Tier)
- Real-time price data
- Historical price data (limited)
- Volume data
- Basic company info
- News sentiment

## Technical Indicators We Need vs. Complexity

### 1. Simple Moving Average (SMA) - EASY
```javascript
// Simple to calculate
const calculateSMA = (prices, period) => {
  const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
  return sum / period;
};
```
**Complexity:** ⭐ (Very Easy)
**Data needed:** Historical price data (50 days for SMA_50)

### 2. Volume Weighted Average Price (VWAP) - EASY
```javascript
// Straightforward calculation
const calculateVWAP = (priceVolumeData) => {
  const totalVolume = priceVolumeData.reduce((sum, item) => sum + item.volume, 0);
  const volumePriceSum = priceVolumeData.reduce((sum, item) => 
    sum + (item.price * item.volume), 0);
  return volumePriceSum / totalVolume;
};
```
**Complexity:** ⭐ (Very Easy)
**Data needed:** Intraday price and volume data

### 3. Relative Strength Index (RSI) - MEDIUM
```javascript
// More complex but well-documented
const calculateRSI = (prices, period = 14) => {
  const gains = [];
  const losses = [];
  
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i-1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
  const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
};
```
**Complexity:** ⭐⭐ (Medium)
**Data needed:** Historical price data (14+ days)

### 4. MACD (Moving Average Convergence Divergence) - MEDIUM
```javascript
// Requires multiple calculations
const calculateMACD = (prices) => {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdLine = ema12 - ema26;
  const signalLine = calculateEMA([...Array(26).fill(0), macdLine], 9);
  const histogram = macdLine - signalLine;
  
  return {
    macd: macdLine,
    signal: signalLine,
    histogram: histogram,
    bullish: macdLine > signalLine
  };
};

const calculateEMA = (prices, period) => {
  const multiplier = 2 / (period + 1);
  let ema = prices[0];
  
  for (let i = 1; i < prices.length; i++) {
    ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
  }
  return ema;
};
```
**Complexity:** ⭐⭐⭐ (Medium-Hard)
**Data needed:** Historical price data (26+ days)

## Implementation Strategy

### Phase 1: Basic Indicators (Week 1)
- SMA calculation
- VWAP calculation
- Basic price momentum

### Phase 2: Advanced Indicators (Week 2)
- RSI calculation
- MACD calculation
- Signal generation

### Phase 3: Optimization (Week 3)
- Caching calculations
- Performance optimization
- Error handling

## Data Requirements from Finnhub

### Minimum Historical Data Needed:
- **Daily prices:** 50+ days (for SMA_50)
- **Intraday data:** For VWAP calculation
- **Volume data:** For volume-weighted calculations

### Finnhub API Endpoints We'll Use:
```javascript
// Get historical data
GET /stock/candle?symbol=AAPL&resolution=D&from=timestamp&to=timestamp

// Get real-time quote
GET /quote?symbol=AAPL

// Get company profile (market cap)
GET /stock/profile2?symbol=AAPL
```

## Challenges & Solutions

### Challenge 1: Limited Historical Data
**Problem:** Finnhub free tier might limit historical data
**Solution:** 
- Cache data in localStorage
- Use available data for shorter periods
- Implement progressive loading

### Challenge 2: Calculation Performance
**Problem:** Client-side calculations might be slow
**Solution:**
- Use Web Workers for heavy calculations
- Implement memoization
- Batch calculations

### Challenge 3: Data Accuracy
**Problem:** Our calculations vs. professional data
**Solution:**
- Cross-reference with multiple sources
- Add confidence intervals
- Focus on relative values, not absolute precision

## Code Structure

```javascript
// utils/technicalIndicators.js
export class TechnicalIndicators {
  static calculateSMA(prices, period) { /* ... */ }
  static calculateVWAP(priceVolumeData) { /* ... */ }
  static calculateRSI(prices, period = 14) { /* ... */ }
  static calculateMACD(prices) { /* ... */ }
  static calculateAllIndicators(stockData) { /* ... */ }
}

// hooks/useTechnicalIndicators.js
export const useTechnicalIndicators = (stockData) => {
  const [indicators, setIndicators] = useState({});
  
  useEffect(() => {
    if (stockData) {
      const calculated = TechnicalIndicators.calculateAllIndicators(stockData);
      setIndicators(calculated);
    }
  }, [stockData]);
  
  return indicators;
};
```

## Time Estimate

### Development Time:
- **Basic indicators (SMA, VWAP):** 2-3 hours
- **RSI calculation:** 3-4 hours
- **MACD calculation:** 4-5 hours
- **Integration & testing:** 3-4 hours
- **Total:** ~12-16 hours (2-3 days)

### Maintenance:
- **Ongoing:** Minimal (calculations are stable)
- **Updates:** Only if we change indicator logic

## Recommendation

**Go with Finnhub + Client-side calculations** because:

✅ **Cost-effective:** No additional API costs
✅ **Educational:** You'll understand the indicators better
✅ **Flexible:** Can customize calculations
✅ **Reliable:** No dependency on third-party indicator APIs
✅ **Fast development:** Well-documented formulas

The complexity is manageable, and the benefits outweigh the development time investment. 