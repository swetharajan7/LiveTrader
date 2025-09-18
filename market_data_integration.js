/**
 * LiveTrader.ai Real Market Data Integration
 * Integrates multiple data sources for comprehensive market coverage
 */

class MarketDataManager {
    constructor() {
        // API Keys - Replace with your actual keys
        this.alphaVantageKey = 'demo'; // Get free key from https://www.alphavantage.co/support/#api-key
        this.finnhubKey = 'demo'; // Get free key from https://finnhub.io/register
        this.polygonKey = 'demo'; // Get free key from https://polygon.io/
        
        // Data cache to avoid excessive API calls
        this.cache = new Map();
        this.cacheTimeout = 60000; // 1 minute cache
        
        // Rate limiting
        this.lastApiCall = 0;
        this.minApiInterval = 1000; // 1 second between calls
        
        this.initializeDataFeeds();
    }

    /**
     * Initialize real-time data feeds
     */
    initializeDataFeeds() {
        // Start real-time updates
        this.startRealTimeUpdates();
        
        // Initialize market status tracking
        this.updateMarketStatus();
        
        console.log('🚀 Market data feeds initialized');
    }

    /**
     * Get real-time quote for a symbol
     */
    async getRealTimeQuote(symbol) {
        const cacheKey = `quote_${symbol}`;
        
        // Check cache first
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        try {
            // Try multiple data sources for reliability
            let quote = await this.getAlphaVantageQuote(symbol);
            
            if (!quote) {
                quote = await this.getFinnhubQuote(symbol);
            }
            
            if (!quote) {
                quote = await this.getPolygonQuote(symbol);
            }

            if (quote) {
                this.cache.set(cacheKey, {
                    data: quote,
                    timestamp: Date.now()
                });
            }

            return quote;
        } catch (error) {
            console.error(`Error fetching quote for ${symbol}:`, error);
            return this.getFallbackQuote(symbol);
        }
    }

    /**
     * Get Alpha Vantage real-time quote
     */
    async getAlphaVantageQuote(symbol) {
        if (this.alphaVantageKey === 'demo') {
            return this.getFallbackQuote(symbol);
        }

        await this.rateLimitDelay();

        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.alphaVantageKey}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data['Global Quote']) {
                const quote = data['Global Quote'];
                return {
                    symbol: symbol,
                    price: parseFloat(quote['05. price']),
                    change: parseFloat(quote['09. change']),
                    changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
                    volume: parseInt(quote['06. volume']),
                    high: parseFloat(quote['03. high']),
                    low: parseFloat(quote['04. low']),
                    open: parseFloat(quote['02. open']),
                    previousClose: parseFloat(quote['08. previous close']),
                    timestamp: new Date(quote['07. latest trading day']).getTime(),
                    source: 'Alpha Vantage'
                };
            }
        } catch (error) {
            console.error('Alpha Vantage API error:', error);
        }
        
        return null;
    }

    /**
     * Get Finnhub real-time quote
     */
    async getFinnhubQuote(symbol) {
        if (this.finnhubKey === 'demo') {
            return null;
        }

        await this.rateLimitDelay();

        const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${this.finnhubKey}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.c) {
                return {
                    symbol: symbol,
                    price: data.c,
                    change: data.d,
                    changePercent: data.dp,
                    high: data.h,
                    low: data.l,
                    open: data.o,
                    previousClose: data.pc,
                    timestamp: data.t * 1000,
                    source: 'Finnhub'
                };
            }
        } catch (error) {
            console.error('Finnhub API error:', error);
        }
        
        return null;
    }

    /**
     * Get Polygon.io real-time quote
     */
    async getPolygonQuote(symbol) {
        if (this.polygonKey === 'demo') {
            return null;
        }

        await this.rateLimitDelay();

        const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apikey=${this.polygonKey}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.results && data.results[0]) {
                const result = data.results[0];
                return {
                    symbol: symbol,
                    price: result.c,
                    change: result.c - result.o,
                    changePercent: ((result.c - result.o) / result.o) * 100,
                    volume: result.v,
                    high: result.h,
                    low: result.l,
                    open: result.o,
                    previousClose: result.c,
                    timestamp: result.t,
                    source: 'Polygon'
                };
            }
        } catch (error) {
            console.error('Polygon API error:', error);
        }
        
        return null;
    }

    /**
     * Get historical data for technical analysis
     */
    async getHistoricalData(symbol, period = '1D', interval = '5min') {
        const cacheKey = `historical_${symbol}_${period}_${interval}`;
        
        if (this.isCacheValid(cacheKey, 300000)) { // 5 minute cache for historical data
            return this.cache.get(cacheKey).data;
        }

        try {
            let data = await this.getAlphaVantageHistorical(symbol, interval);
            
            if (!data) {
                data = await this.getFinnhubHistorical(symbol, period);
            }

            if (data) {
                this.cache.set(cacheKey, {
                    data: data,
                    timestamp: Date.now()
                });
            }

            return data;
        } catch (error) {
            console.error(`Error fetching historical data for ${symbol}:`, error);
            return this.getFallbackHistoricalData(symbol);
        }
    }

    /**
     * Get Alpha Vantage historical data
     */
    async getAlphaVantageHistorical(symbol, interval) {
        if (this.alphaVantageKey === 'demo') {
            return this.getFallbackHistoricalData(symbol);
        }

        await this.rateLimitDelay();

        const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${this.alphaVantageKey}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            const timeSeriesKey = `Time Series (${interval})`;
            if (data[timeSeriesKey]) {
                const timeSeries = data[timeSeriesKey];
                const historicalData = [];
                
                for (const [timestamp, values] of Object.entries(timeSeries)) {
                    historicalData.push({
                        timestamp: new Date(timestamp).getTime(),
                        open: parseFloat(values['1. open']),
                        high: parseFloat(values['2. high']),
                        low: parseFloat(values['3. low']),
                        close: parseFloat(values['4. close']),
                        volume: parseInt(values['5. volume'])
                    });
                }
                
                return historicalData.sort((a, b) => a.timestamp - b.timestamp);
            }
        } catch (error) {
            console.error('Alpha Vantage historical data error:', error);
        }
        
        return null;
    }

    /**
     * Get technical indicators
     */
    async getTechnicalIndicators(symbol, indicators = ['RSI', 'MACD', 'SMA']) {
        const cacheKey = `indicators_${symbol}_${indicators.join('_')}`;
        
        if (this.isCacheValid(cacheKey, 300000)) {
            return this.cache.get(cacheKey).data;
        }

        const results = {};
        
        for (const indicator of indicators) {
            try {
                const data = await this.getAlphaVantageIndicator(symbol, indicator);
                if (data) {
                    results[indicator] = data;
                }
            } catch (error) {
                console.error(`Error fetching ${indicator} for ${symbol}:`, error);
            }
        }

        if (Object.keys(results).length > 0) {
            this.cache.set(cacheKey, {
                data: results,
                timestamp: Date.now()
            });
        }

        return results;
    }

    /**
     * Get Alpha Vantage technical indicator
     */
    async getAlphaVantageIndicator(symbol, indicator) {
        if (this.alphaVantageKey === 'demo') {
            return this.getFallbackIndicator(symbol, indicator);
        }

        await this.rateLimitDelay();

        const functionMap = {
            'RSI': 'RSI',
            'MACD': 'MACD',
            'SMA': 'SMA',
            'EMA': 'EMA',
            'BBANDS': 'BBANDS'
        };

        const func = functionMap[indicator];
        if (!func) return null;

        const url = `https://www.alphavantage.co/query?function=${func}&symbol=${symbol}&interval=daily&time_period=14&series_type=close&apikey=${this.alphaVantageKey}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            // Parse based on indicator type
            if (indicator === 'RSI' && data[`Technical Analysis: ${func}`]) {
                return this.parseIndicatorData(data[`Technical Analysis: ${func}`], 'RSI');
            } else if (indicator === 'MACD' && data[`Technical Analysis: ${func}`]) {
                return this.parseIndicatorData(data[`Technical Analysis: ${func}`], 'MACD');
            } else if ((indicator === 'SMA' || indicator === 'EMA') && data[`Technical Analysis: ${func}`]) {
                return this.parseIndicatorData(data[`Technical Analysis: ${func}`], func);
            }
        } catch (error) {
            console.error(`${indicator} API error:`, error);
        }
        
        return null;
    }

    /**
     * Parse indicator data
     */
    parseIndicatorData(data, type) {
        const parsed = [];
        
        for (const [timestamp, values] of Object.entries(data)) {
            const entry = {
                timestamp: new Date(timestamp).getTime()
            };
            
            if (type === 'RSI') {
                entry.value = parseFloat(values['RSI']);
            } else if (type === 'MACD') {
                entry.macd = parseFloat(values['MACD']);
                entry.signal = parseFloat(values['MACD_Signal']);
                entry.histogram = parseFloat(values['MACD_Hist']);
            } else if (type === 'SMA' || type === 'EMA') {
                entry.value = parseFloat(values[type]);
            }
            
            parsed.push(entry);
        }
        
        return parsed.sort((a, b) => b.timestamp - a.timestamp).slice(0, 100); // Latest 100 points
    }

    /**
     * Start real-time updates
     */
    startRealTimeUpdates() {
        const symbols = ['IXIC', 'SPX', 'DJI', 'AAPL', 'GOOGL', 'MSFT', 'TSLA'];
        
        // Update every 30 seconds during market hours
        setInterval(async () => {
            if (this.isMarketOpen()) {
                for (const symbol of symbols) {
                    try {
                        const quote = await this.getRealTimeQuote(symbol);
                        if (quote) {
                            this.updateUI(symbol, quote);
                        }
                    } catch (error) {
                        console.error(`Error updating ${symbol}:`, error);
                    }
                    
                    // Small delay between symbols
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            }
        }, 30000);
    }

    /**
     * Update market status
     */
    updateMarketStatus() {
        const updateStatus = () => {
            const now = new Date();
            const marketOpen = this.isMarketOpen(now);
            
            const statusElement = document.getElementById('market-status');
            if (statusElement) {
                statusElement.textContent = marketOpen ? 'OPEN' : 'CLOSED';
                statusElement.className = `market-status ${marketOpen ? 'open' : 'closed'}`;
            }
        };
        
        updateStatus();
        setInterval(updateStatus, 60000); // Update every minute
    }

    /**
     * Check if market is open
     */
    isMarketOpen(date = new Date()) {
        const nyTime = new Date(date.toLocaleString("en-US", {timeZone: "America/New_York"}));
        const day = nyTime.getDay();
        const hour = nyTime.getHours();
        const minute = nyTime.getMinutes();
        const time = hour * 100 + minute;
        
        // Monday to Friday, 9:30 AM to 4:00 PM ET
        return day >= 1 && day <= 5 && time >= 930 && time < 1600;
    }

    /**
     * Update UI with new data
     */
    updateUI(symbol, quote) {
        // Update ticker display
        const tickerElement = document.querySelector(`[data-symbol="${symbol}"]`);
        if (tickerElement) {
            const priceElement = tickerElement.querySelector('.price');
            const changeElement = tickerElement.querySelector('.change');
            
            if (priceElement) {
                priceElement.textContent = quote.price.toFixed(2);
            }
            
            if (changeElement) {
                const changeText = `${quote.change >= 0 ? '+' : ''}${quote.change.toFixed(2)} (${quote.changePercent.toFixed(2)}%)`;
                changeElement.textContent = changeText;
                changeElement.className = `change ${quote.change >= 0 ? 'positive' : 'negative'}`;
            }
        }

        // Trigger custom event for other components
        window.dispatchEvent(new CustomEvent('marketDataUpdate', {
            detail: { symbol, quote }
        }));
    }

    /**
     * Rate limiting helper
     */
    async rateLimitDelay() {
        const now = Date.now();
        const timeSinceLastCall = now - this.lastApiCall;
        
        if (timeSinceLastCall < this.minApiInterval) {
            await new Promise(resolve => setTimeout(resolve, this.minApiInterval - timeSinceLastCall));
        }
        
        this.lastApiCall = Date.now();
    }

    /**
     * Check if cache is valid
     */
    isCacheValid(key, timeout = this.cacheTimeout) {
        const cached = this.cache.get(key);
        return cached && (Date.now() - cached.timestamp) < timeout;
    }

    /**
     * Fallback quote for demo mode
     */
    getFallbackQuote(symbol) {
        const baseValues = {
            'IXIC': 15000,
            'SPX': 4500,
            'DJI': 35000,
            'AAPL': 175,
            'GOOGL': 140,
            'MSFT': 350,
            'TSLA': 250
        };

        const basePrice = baseValues[symbol] || 100;
        const randomChange = (Math.random() - 0.5) * 10;
        const price = basePrice + randomChange;
        
        return {
            symbol: symbol,
            price: price,
            change: randomChange,
            changePercent: (randomChange / basePrice) * 100,
            volume: Math.floor(Math.random() * 10000000),
            high: price + Math.random() * 5,
            low: price - Math.random() * 5,
            open: price + (Math.random() - 0.5) * 3,
            previousClose: price - randomChange,
            timestamp: Date.now(),
            source: 'Demo Data'
        };
    }

    /**
     * Fallback historical data
     */
    getFallbackHistoricalData(symbol) {
        const data = [];
        const basePrice = this.getFallbackQuote(symbol).price;
        
        for (let i = 100; i >= 0; i--) {
            const timestamp = Date.now() - (i * 5 * 60 * 1000); // 5-minute intervals
            const price = basePrice + (Math.random() - 0.5) * 20;
            
            data.push({
                timestamp: timestamp,
                open: price + (Math.random() - 0.5) * 2,
                high: price + Math.random() * 3,
                low: price - Math.random() * 3,
                close: price,
                volume: Math.floor(Math.random() * 1000000)
            });
        }
        
        return data;
    }

    /**
     * Fallback technical indicator
     */
    getFallbackIndicator(symbol, indicator) {
        const data = [];
        
        for (let i = 50; i >= 0; i--) {
            const timestamp = Date.now() - (i * 24 * 60 * 60 * 1000); // Daily
            
            if (indicator === 'RSI') {
                data.push({
                    timestamp: timestamp,
                    value: 30 + Math.random() * 40 // RSI between 30-70
                });
            } else if (indicator === 'MACD') {
                data.push({
                    timestamp: timestamp,
                    macd: (Math.random() - 0.5) * 10,
                    signal: (Math.random() - 0.5) * 8,
                    histogram: (Math.random() - 0.5) * 5
                });
            }
        }
        
        return data;
    }

    /**
     * Set API keys
     */
    setApiKeys(keys) {
        if (keys.alphaVantage) this.alphaVantageKey = keys.alphaVantage;
        if (keys.finnhub) this.finnhubKey = keys.finnhub;
        if (keys.polygon) this.polygonKey = keys.polygon;
        
        console.log('✅ API keys updated');
    }
}

// Initialize market data manager
const marketDataManager = new MarketDataManager();

// Export for global use
window.MarketDataManager = MarketDataManager;
window.marketDataManager = marketDataManager;