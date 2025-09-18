/**
 * LiveTrader.ai API Configuration
 * Configure your market data API keys here
 */

const API_CONFIG = {
    // Alpha Vantage - Free tier: 5 API requests per minute, 500 per day
    // Get your free key: https://www.alphavantage.co/support/#api-key
    ALPHA_VANTAGE: {
        key: 'demo', // Replace with your actual API key
        baseUrl: 'https://www.alphavantage.co/query',
        rateLimit: 12000, // 12 seconds between calls for free tier
        features: ['quotes', 'historical', 'technical_indicators', 'fundamentals']
    },

    // Finnhub - Free tier: 60 API calls/minute
    // Get your free key: https://finnhub.io/register
    FINNHUB: {
        key: 'demo', // Replace with your actual API key
        baseUrl: 'https://finnhub.io/api/v1',
        rateLimit: 1000, // 1 second between calls
        features: ['quotes', 'news', 'earnings', 'recommendations']
    },

    // Polygon.io - Free tier: 5 API calls/minute
    // Get your free key: https://polygon.io/
    POLYGON: {
        key: 'demo', // Replace with your actual API key
        baseUrl: 'https://api.polygon.io',
        rateLimit: 12000, // 12 seconds between calls for free tier
        features: ['quotes', 'historical', 'aggregates', 'trades']
    },

    // Yahoo Finance (via RapidAPI) - Alternative free option
    // Get your free key: https://rapidapi.com/apidojo/api/yahoo-finance1/
    YAHOO_FINANCE: {
        key: 'demo', // Replace with your RapidAPI key
        baseUrl: 'https://yahoo-finance1.p.rapidapi.com',
        rateLimit: 500, // 0.5 seconds between calls
        features: ['quotes', 'historical', 'news', 'options']
    },

    // IEX Cloud - Free tier: 50,000 core data credits/month
    // Get your free key: https://iexcloud.io/
    IEX_CLOUD: {
        key: 'demo', // Replace with your actual API key
        baseUrl: 'https://cloud.iexapis.com/stable',
        rateLimit: 100, // Very fast rate limit
        features: ['quotes', 'historical', 'stats', 'dividends']
    }
};

/**
 * Market Data Source Priority
 * Order of preference for different data types
 */
const DATA_SOURCE_PRIORITY = {
    realtime_quotes: ['IEX_CLOUD', 'ALPHA_VANTAGE', 'FINNHUB', 'POLYGON'],
    historical_data: ['ALPHA_VANTAGE', 'POLYGON', 'IEX_CLOUD'],
    technical_indicators: ['ALPHA_VANTAGE', 'POLYGON'],
    market_news: ['FINNHUB', 'YAHOO_FINANCE', 'ALPHA_VANTAGE'],
    fundamentals: ['ALPHA_VANTAGE', 'FINNHUB', 'IEX_CLOUD']
};

/**
 * Symbol mappings for different exchanges
 */
const SYMBOL_MAPPINGS = {
    // Major indices
    'NASDAQ': 'IXIC',
    'S&P500': 'SPX',
    'DOW': 'DJI',
    'VIX': 'VIX',
    
    // Popular stocks
    'APPLE': 'AAPL',
    'MICROSOFT': 'MSFT',
    'GOOGLE': 'GOOGL',
    'AMAZON': 'AMZN',
    'TESLA': 'TSLA',
    'META': 'META',
    'NVIDIA': 'NVDA',
    
    // Crypto (where supported)
    'BITCOIN': 'BTC-USD',
    'ETHEREUM': 'ETH-USD',
    
    // Commodities
    'GOLD': 'GLD',
    'OIL': 'USO',
    'SILVER': 'SLV'
};

/**
 * Market hours configuration
 */
const MARKET_HOURS = {
    NYSE: {
        timezone: 'America/New_York',
        regular: {
            open: '09:30',
            close: '16:00'
        },
        extended: {
            premarket: '04:00',
            afterhours: '20:00'
        },
        weekdays: [1, 2, 3, 4, 5] // Monday to Friday
    },
    NASDAQ: {
        timezone: 'America/New_York',
        regular: {
            open: '09:30',
            close: '16:00'
        },
        extended: {
            premarket: '04:00',
            afterhours: '20:00'
        },
        weekdays: [1, 2, 3, 4, 5]
    }
};

/**
 * Data refresh intervals (in milliseconds)
 */
const REFRESH_INTERVALS = {
    realtime_quotes: 30000,    // 30 seconds during market hours
    market_status: 60000,      // 1 minute
    historical_daily: 3600000, // 1 hour
    technical_indicators: 300000, // 5 minutes
    market_news: 900000,       // 15 minutes
    extended_hours: 60000      // 1 minute for pre/after market
};

/**
 * Cache configuration
 */
const CACHE_CONFIG = {
    quotes: 30000,           // 30 seconds
    historical: 3600000,     // 1 hour
    indicators: 300000,      // 5 minutes
    news: 900000,           // 15 minutes
    fundamentals: 86400000   // 24 hours
};

/**
 * API Setup Instructions
 */
const SETUP_INSTRUCTIONS = {
    ALPHA_VANTAGE: {
        name: "Alpha Vantage",
        url: "https://www.alphavantage.co/support/#api-key",
        steps: [
            "1. Visit https://www.alphavantage.co/support/#api-key",
            "2. Enter your email address",
            "3. Click 'GET FREE API KEY'",
            "4. Copy the API key from your email",
            "5. Replace 'demo' with your key in API_CONFIG.ALPHA_VANTAGE.key"
        ],
        free_tier: "5 API requests per minute, 500 per day"
    },
    
    FINNHUB: {
        name: "Finnhub",
        url: "https://finnhub.io/register",
        steps: [
            "1. Visit https://finnhub.io/register",
            "2. Create a free account",
            "3. Verify your email",
            "4. Go to your dashboard to get API key",
            "5. Replace 'demo' with your key in API_CONFIG.FINNHUB.key"
        ],
        free_tier: "60 API calls per minute"
    },
    
    IEX_CLOUD: {
        name: "IEX Cloud",
        url: "https://iexcloud.io/",
        steps: [
            "1. Visit https://iexcloud.io/",
            "2. Click 'Start for Free'",
            "3. Create account and verify email",
            "4. Get your publishable API key from console",
            "5. Replace 'demo' with your key in API_CONFIG.IEX_CLOUD.key"
        ],
        free_tier: "50,000 core data credits per month"
    }
};

/**
 * Initialize API configuration
 */
function initializeAPIConfig() {
    // Check if we're in demo mode
    const isDemoMode = Object.values(API_CONFIG).every(config => config.key === 'demo');
    
    if (isDemoMode) {
        console.log('📊 Market Data: Running in DEMO mode');
        console.log('🔑 To enable real data, configure API keys in api_config.js');
        console.log('📖 See SETUP_INSTRUCTIONS for help getting free API keys');
    } else {
        console.log('✅ Market Data: Real API keys configured');
    }
    
    return {
        config: API_CONFIG,
        priority: DATA_SOURCE_PRIORITY,
        symbols: SYMBOL_MAPPINGS,
        hours: MARKET_HOURS,
        intervals: REFRESH_INTERVALS,
        cache: CACHE_CONFIG,
        setup: SETUP_INSTRUCTIONS,
        isDemoMode: isDemoMode
    };
}

// Export configuration
window.API_CONFIG = API_CONFIG;
window.DATA_SOURCE_PRIORITY = DATA_SOURCE_PRIORITY;
window.SYMBOL_MAPPINGS = SYMBOL_MAPPINGS;
window.MARKET_HOURS = MARKET_HOURS;
window.REFRESH_INTERVALS = REFRESH_INTERVALS;
window.CACHE_CONFIG = CACHE_CONFIG;
window.SETUP_INSTRUCTIONS = SETUP_INSTRUCTIONS;
window.initializeAPIConfig = initializeAPIConfig;

// Initialize on load
document.addEventListener('DOMContentLoaded', initializeAPIConfig);