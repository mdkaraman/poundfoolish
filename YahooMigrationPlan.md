# Yahoo Finance Migration & Data Provider Abstraction Plan

## Overview
This document outlines the step-by-step plan to refactor the app for pluggable data providers and migrate to Yahoo Finance as a data source. The goal is to make it easy to swap or add new stock data APIs in the future.

---

## Step-by-Step Migration Plan

### 1. Abstract the Data Provider Interface
- **Create a new directory:** `src/utils/dataProviders/`
- **Define a standard interface** (functions) for all stock data needs:
  - `getStockQuote(symbol)`
  - `getStockProfile(symbol)`
  - `getStockCandles(symbol, options)`
  - `getCompanyNews(symbol, options)`
- **Document the expected return shape** for each function (JSdoc or markdown).

### 2. Implement Finnhub Provider (Current)
- Move all Finnhub-specific logic to `finnhubProvider.js`.
- Ensure it implements the provider interface.
- Update `apiHelpers.js` to export from `finnhubProvider.js`.

### 3. Implement Yahoo Finance Provider
- Create `yahooProvider.js` in `dataProviders/`.
- Use [yahoo-finance2](https://www.npmjs.com/package/yahoo-finance2) or similar library (Node.js backend or serverless recommended).
- Implement all interface functions to fetch:
  - Quote (current price, volume, etc.)
  - Profile (company info, market cap, sector)
  - Candles (historical prices/volumes)
  - News (recent headlines)
- Normalize Yahoo’s data to match the interface.

### 4. Add Provider Selection Logic
- In `apiHelpers.js`, export the functions from the chosen provider (Finnhub or Yahoo).
- Optionally, use an environment variable or config to select the provider.
- Example:
  ```js
  // apiHelpers.js
  import * as yahoo from './dataProviders/yahooProvider';
  export const getStockQuote = yahoo.getStockQuote;
  // ...etc
  ```

### 5. Refactor App to Use Provider Interface
- Replace all direct Finnhub API calls in hooks/components with the provider interface functions from `apiHelpers.js`.
- Ensure all data processing and filtering works with the normalized data shape.

### 6. (Optional) Add Backend Proxy for Yahoo
- If Yahoo blocks browser requests (CORS), create a simple Node.js/Express backend or serverless function to proxy requests.
- The frontend calls your backend, which fetches from Yahoo and returns the data.
- Update the Yahoo provider to use your backend endpoint.

### 7. Test and Validate
- Test all app features (quotes, candles, news, filters, trading plan) with Yahoo as the provider.
- Compare results with Finnhub to ensure consistency.
- Handle any missing data or differences in field names.

### 8. Document and Future-Proof
- Document the provider interface and how to add new providers.
- Optionally, support fallback logic (try Yahoo, then Finnhub, etc.).

---

## Benefits
- **Easy to swap or add new data sources**
- **Cleaner, more maintainable code**
- **Can support multiple providers or fallback logic** 