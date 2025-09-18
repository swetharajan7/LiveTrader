# LiveTrader.ai Market Data Integration Guide

Complete guide to integrate real-time market data feeds into your LiveTrader.ai platform.

## 🚀 Quick Start

### 1. Get Free API Keys

#### Alpha Vantage (Recommended)
- **Free Tier**: 5 requests/minute, 500/day
- **Sign up**: https://www.alphavantage.co/support/#api-key
- **Features**: Real-time quotes, historical data, technical indicators

#### IEX Cloud (Best for High Frequency)
- **Free Tier**: 50,000 credits/month
- **Sign up**: https://iexcloud.io/
- **Features**: Real-time quotes, fast updates, reliable

#### Finnhub (Great for News)
- **Free Tier**: 60 calls/minute
- **Sign up**: https://finnhub.io/register
- **Features**: Real-time data, market news, earnings

### 2. Configure API Keys

Edit `api_config.js`:

```javascript
const API_CONFIG = {
    ALPHA_VANTAGE: {
        key: 'YOUR_ALPHA_VANTAGE_KEY_HERE', // Replace 'demo'
        // ... rest of config
    },
    
    IEX_CLOUD: {
        key: 'YOUR_IEX_CLOUD_KEY_HERE', // Replace 'demo'
        // ... rest of config
    },
    
    FINNHUB: {
        key: 'YOUR_FINNHUB_KEY_HERE', // Replace 'demo'
        // ... rest of config
    }
};
```

### 3. Test Integration

Open your browser console and run:

```javascript
// Test real-time quote
marketDataManager.getRealTimeQuote('AAPL').then(console.log);

// Test historical data
marketDataManager.getHistoricalData('AAPL').then(console.log);

// Test technical indicators
marketDataManager.getTechnicalIndicators('AAPL', ['RSI', 'MACD']).then(console.log);
```

## 📊 Features

### Real-Time Market Ticker
- Live updates every 30 seconds during market hours
- Mini charts with price movements
- Click for detailed symbol information
- Smooth scrolling animation
- Responsive design

### Supported Data Types
- **Real-time Quotes**: Current price, change, volume
- **Historical Data**: OHLCV data with customizable periods
- **Technical Indicators**: RSI, MACD, SMA, EMA, Bollinger Bands
- **Market News**: Latest financial news and updates
- **Fundamentals**: Company financials and metrics

### Supported Symbols
- **Indices**: NASDAQ (IXIC), S&P 500 (SPX), DOW (DJI)
- **Stocks**: AAPL, MSFT, GOOGL, AMZN, TSLA, META, NVDA
- **Commodities**: Gold (GLD), Oil (USO), Silver (SLV)
- **Crypto**: Bitcoin (BTC-USD), Ethereum (ETH-USD)

## 🔧 Configuration Options

### Data Source Priority

Configure which API to use first for different data types:

```javascript
const DATA_SOURCE_PRIORITY = {
    realtime_quotes: ['IEX_CLOUD', 'ALPHA_VANTAGE', 'FINNHUB'],
    historical_data: ['ALPHA_VANTAGE', 'IEX_CLOUD'],
    technical_indicators: ['ALPHA_VANTAGE'],
    market_news: ['FINNHUB', 'ALPHA_VANTAGE']
};
```

### Update Intervals

Customize how often data refreshes:

```javascript
const REFRESH_INTERVALS = {
    realtime_quotes: 30000,    // 30 seconds during market hours
    market_status: 60000,      // 1 minute
    historical_daily: 3600000, // 1 hour
    technical_indicators: 300000, // 5 minutes
    market_news: 900000        // 15 minutes
};
```

### Cache Settings

Control data caching to reduce API calls:

```javascript
const CACHE_CONFIG = {
    quotes: 30000,           // 30 seconds
    historical: 3600000,     // 1 hour
    indicators: 300000,      // 5 minutes
    news: 900000,           // 15 minutes
    fundamentals: 86400000   // 24 hours
};
```

## 🎯 API Usage Examples

### Get Real-Time Quote

```javascript
async function getStockPrice(symbol) {
    try {
        const quote = await marketDataManager.getRealTimeQuote(symbol);
        console.log(`${symbol}: $${quote.price} (${quote.changePercent.toFixed(2)}%)`);
        return quote;
    } catch (error) {
        console.error('Error fetching quote:', error);
    }
}

// Usage
getStockPrice('AAPL');
```

### Get Historical Data

```javascript
async function getChartData(symbol, period = '1D') {
    try {
        const data = await marketDataManager.getHistoricalData(symbol, period);
        console.log(`Historical data for ${symbol}:`, data);
        return data;
    } catch (error) {
        console.error('Error fetching historical data:', error);
    }
}

// Usage
getChartData('AAPL', '1D');
```

### Get Technical Indicators

```javascript
async function getIndicators(symbol) {
    try {
        const indicators = await marketDataManager.getTechnicalIndicators(symbol, ['RSI', 'MACD', 'SMA']);
        console.log(`Technical indicators for ${symbol}:`, indicators);
        return indicators;
    } catch (error) {
        console.error('Error fetching indicators:', error);
    }
}

// Usage
getIndicators('AAPL');
```

### Market Status Check

```javascript
function checkMarketStatus() {
    const isOpen = marketDataManager.isMarketOpen();
    console.log(`Market is currently: ${isOpen ? 'OPEN' : 'CLOSED'}`);
    return isOpen;
}

// Usage
checkMarketStatus();
```

## 🔄 Event Handling

### Listen for Market Data Updates

```javascript
// Listen for real-time updates
window.addEventListener('marketDataUpdate', (event) => {
    const { symbol, quote } = event.detail;
    console.log(`${symbol} updated:`, quote);
    
    // Update your UI here
    updatePriceDisplay(symbol, quote);
});

function updatePriceDisplay(symbol, quote) {
    const element = document.querySelector(`[data-symbol="${symbol}"]`);
    if (element) {
        element.querySelector('.price').textContent = quote.price.toFixed(2);
        element.querySelector('.change').textContent = `${quote.changePercent.toFixed(2)}%`;
    }
}
```

### Custom Market Events

```javascript
// Create custom events for your application
function triggerPriceAlert(symbol, price, threshold) {
    if (price > threshold) {
        window.dispatchEvent(new CustomEvent('priceAlert', {
            detail: { symbol, price, threshold, type: 'above' }
        }));
    }
}

// Listen for price alerts
window.addEventListener('priceAlert', (event) => {
    const { symbol, price, threshold, type } = event.detail;
    alert(`${symbol} is ${type} $${threshold}! Current price: $${price}`);
});
```

## 📈 Advanced Features

### Custom Indicators

Add your own technical indicators:

```javascript
class CustomIndicators {
    static calculateRSI(prices, period = 14) {
        // RSI calculation logic
        const gains = [];
        const losses = [];
        
        for (let i = 1; i < prices.length; i++) {
            const change = prices[i] - prices[i - 1];
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? Math.abs(change) : 0);
        }
        
        const avgGain = gains.slice(-period).reduce((a, b) => a + b) / period;
        const avgLoss = losses.slice(-period).reduce((a, b) => a + b) / period;
        
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }
    
    static calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
        // MACD calculation logic
        const fastEMA = this.calculateEMA(prices, fastPeriod);
        const slowEMA = this.calculateEMA(prices, slowPeriod);
        const macdLine = fastEMA.map((fast, i) => fast - slowEMA[i]);
        const signalLine = this.calculateEMA(macdLine, signalPeriod);
        const histogram = macdLine.map((macd, i) => macd - signalLine[i]);
        
        return { macdLine, signalLine, histogram };
    }
    
    static calculateEMA(prices, period) {
        const multiplier = 2 / (period + 1);
        const ema = [prices[0]];
        
        for (let i = 1; i < prices.length; i++) {
            ema.push((prices[i] * multiplier) + (ema[i - 1] * (1 - multiplier)));
        }
        
        return ema;
    }
}

// Usage
const prices = [100, 102, 101, 103, 105, 104, 106];
const rsi = CustomIndicators.calculateRSI(prices);
console.log('RSI:', rsi);
```

### Portfolio Tracking

Track multiple symbols:

```javascript
class PortfolioTracker {
    constructor(symbols) {
        this.symbols = symbols;
        this.portfolio = new Map();
        this.startTracking();
    }
    
    async startTracking() {
        for (const symbol of this.symbols) {
            const quote = await marketDataManager.getRealTimeQuote(symbol);
            this.portfolio.set(symbol, quote);
        }
        
        // Update every minute
        setInterval(() => this.updatePortfolio(), 60000);
    }
    
    async updatePortfolio() {
        for (const symbol of this.symbols) {
            try {
                const quote = await marketDataManager.getRealTimeQuote(symbol);
                this.portfolio.set(symbol, quote);
                this.checkAlerts(symbol, quote);
            } catch (error) {
                console.error(`Error updating ${symbol}:`, error);
            }
        }
    }
    
    checkAlerts(symbol, quote) {
        // Implement your alert logic here
        if (Math.abs(quote.changePercent) > 5) {
            console.log(`Alert: ${symbol} moved ${quote.changePercent.toFixed(2)}%`);
        }
    }
    
    getPortfolioSummary() {
        const summary = {
            totalValue: 0,
            totalChange: 0,
            symbols: []
        };
        
        for (const [symbol, quote] of this.portfolio) {
            summary.symbols.push({
                symbol,
                price: quote.price,
                change: quote.changePercent
            });
            summary.totalChange += quote.changePercent;
        }
        
        summary.avgChange = summary.totalChange / this.portfolio.size;
        return summary;
    }
}

// Usage
const tracker = new PortfolioTracker(['AAPL', 'GOOGL', 'MSFT', 'TSLA']);
```

## 🛠 Troubleshooting

### Common Issues

#### 1. API Rate Limits
```javascript
// Check rate limit status
if (error.message.includes('rate limit')) {
    console.log('Rate limit exceeded, switching to fallback data');
    // Use cached data or alternative source
}
```

#### 2. Invalid Symbols
```javascript
// Validate symbols before API calls
function isValidSymbol(symbol) {
    return /^[A-Z]{1,5}(-USD)?$/.test(symbol);
}

if (!isValidSymbol('INVALID')) {
    console.error('Invalid symbol format');
}
```

#### 3. Network Errors
```javascript
// Implement retry logic
async function fetchWithRetry(url, options, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) return response;
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}
```

### Debug Mode

Enable debug logging:

```javascript
// Add to api_config.js
const DEBUG_MODE = true;

// In market_data_integration.js
if (window.DEBUG_MODE) {
    console.log('API Request:', url);
    console.log('Response:', data);
}
```

## 💰 Cost Management

### Free Tier Limits

| Provider | Free Limit | Best For |
|----------|------------|----------|
| Alpha Vantage | 5 req/min, 500/day | Technical indicators |
| IEX Cloud | 50K credits/month | High-frequency quotes |
| Finnhub | 60 req/minute | Market news |
| Polygon | 5 req/minute | Historical data |

### Optimization Tips

1. **Use Caching**: Reduce API calls with intelligent caching
2. **Batch Requests**: Get multiple symbols in one call when possible
3. **Smart Updates**: Only update during market hours
4. **Fallback Data**: Use demo data when limits are reached

### Monitor Usage

```javascript
class APIUsageTracker {
    constructor() {
        this.usage = new Map();
    }
    
    trackRequest(provider) {
        const today = new Date().toDateString();
        const key = `${provider}_${today}`;
        const current = this.usage.get(key) || 0;
        this.usage.set(key, current + 1);
    }
    
    getUsage(provider) {
        const today = new Date().toDateString();
        const key = `${provider}_${today}`;
        return this.usage.get(key) || 0;
    }
    
    isLimitReached(provider, limit) {
        return this.getUsage(provider) >= limit;
    }
}

const usageTracker = new APIUsageTracker();
```

## 🚀 Production Deployment

### Environment Variables

For production, use environment variables:

```javascript
// In production
const API_CONFIG = {
    ALPHA_VANTAGE: {
        key: process.env.ALPHA_VANTAGE_API_KEY || 'demo',
        // ...
    }
};
```

### CDN Integration

For better performance, consider using a CDN:

```html
<!-- Add to your HTML -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://cdn.jsdelivr.net/npm/moment@2.29.4/moment.min.js"></script>
```

### Monitoring

Set up monitoring for your market data:

```javascript
// Monitor API health
setInterval(() => {
    marketDataManager.testConnection().then(isHealthy => {
        if (!isHealthy) {
            console.error('Market data API is unhealthy');
            // Send alert or switch to backup
        }
    });
}, 300000); // Check every 5 minutes
```

---

## 🎯 Next Steps

1. **Get API Keys**: Sign up for free accounts
2. **Configure Keys**: Update `api_config.js`
3. **Test Integration**: Use browser console
4. **Customize Display**: Modify ticker and charts
5. **Add Alerts**: Implement price notifications
6. **Monitor Usage**: Track API consumption

Your LiveTrader.ai platform now has professional-grade market data integration! 🚀

---

*Need help? Check the browser console for debug information or refer to the API provider documentation.*