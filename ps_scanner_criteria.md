# Penny Stock Scanner Criteria

## Penny Stock Definition
- **Price:** Under $5.00
- **Market Cap:** Under $300 million

---

## Current Filters (Implemented & Active)
- **Price:** Under $5.00
- **Market Cap:** $20M - $300M
- **Volume:** Minimum 500,000 shares
- **Price Change:** 5%+ daily change
- **Volume Spike:** Relative volume > 2.0x average
- **News Activity:** Optional filter for stocks with recent news (last 7 days)

---

## Advanced Features (Implemented)
- **News Integration:** Company news filtering with 24-hour caching
- **Trading Plans:** Automated entry, stop loss, and target calculations
- **Stock Detail Pages:** Comprehensive stock information and analysis
- **Risk Management:** Configurable position sizing and risk parameters
- **Smart Caching:** News results cached to optimize API usage

---

## Example Combined Filter (JavaScript)
```javascript
stock.price < 5.00 &&
stock.marketCap >= 20000000 &&
stock.marketCap <= 300000000 &&
stock.volume >= 500000 &&
stock.percentChange >= 5.0 &&
stock.relativeVolume >= 2.0 &&
// Optional: stock.hasRecentNews === true
```

---

## News Integration
- **News Filter:** Toggle to require stocks with recent news activity
- **Cache Duration:** 24 hours to avoid repeated API calls
- **Rate Optimization:** 15 symbols × 2-4 calls = stays within 60/min limit
- **News Display:** Actual articles with headlines, summaries, and links 