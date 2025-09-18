# LiveTrader.ai

## 🚀 Live Demo
[https://livetraderai.vercel.app/](https://livetraderai.vercel.app/)

## 📦 Deployment

### Frontend (Vercel)
This project is automatically deployed to Vercel from the main branch.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/swetharajan7/LiveTrader)

### Backend (AWS)
Complete AWS infrastructure with Bedrock AI integration:

```bash
# Quick setup
python deploy.py

# Or step-by-step
python aws_setup.py
```

📋 **See [AWS_SETUP_README.md](AWS_SETUP_README.md) for detailed deployment guide**

## About

LiveTrader.ai is an AI Historical Advantage Copilot — an autonomous agent built on AWS that transforms decades of global market data into predictive, explainable insights. Instead of chasing short-term signals, it learns from historical patterns, cycles, and correlations to give brokers and banks a strategic edge.

Powered by Amazon Bedrock AgentCore and reasoning LLMs, LiveTrader.ai:

- Normalizes and stores cross-exchange historical data in a scalable repository
- Uses machine learning and AI reasoning to detect recurring patterns and market analogs
- Provides transparent, explainable predictions with supporting evidence from history
- Delivers insights in real time through a clean, autonomous coaching interface

By bridging the gap between raw data and actionable foresight, LiveTrader.ai empowers financial professionals to anticipate opportunities, manage risk smarter, and make decisions with confidence.

## Value Proposition

### For Brokers and Banks
- Unlocks a historical edge by surfacing cross-market patterns that improve client advisory and portfolio strategy
- Automates complex pattern recognition, backtesting, and scenario analysis, reducing research time from days to minutes
- Provides compliance-friendly explainability, ensuring every prediction comes with evidence grounded in market history

### For Traders and Analysts
- Turns fragmented market archives into a single, queryable memory of global exchanges
- Offers predictive insights and strategy suggestions based on decades of proven patterns
- Enhances decision-making with transparent rationale, building trust in AI-driven recommendations

### For Institutions at Large
- Differentiates their service offering with cutting-edge, AI-driven market foresight
- Reduces reliance on costly data vendors by creating a scalable in-house knowledge base on AWS
- Future-proofs their infrastructure with an agentic platform capable of integrating new markets and asset classes

## 🏗 Technical Architecture

### Frontend Stack
- **HTML5/CSS3/JavaScript**: Clean, responsive interface
- **Alpha Vantage API**: Real-time market data integration
- **Vercel**: Automatic deployment and hosting

### Backend Infrastructure (AWS)
- **Amazon S3**: Historical data storage (30+ years of market data)
- **AWS Lambda**: Serverless query processing
- **Amazon Bedrock**: AI/ML model integration (Claude 3 Sonnet)
- **API Gateway**: RESTful API endpoints
- **IAM**: Secure role-based access control

### Data Pipeline
1. **Ingestion**: Historical market data from multiple sources
2. **Processing**: Technical indicators, pattern recognition
3. **Storage**: Organized S3 data lake with metadata
4. **Analysis**: AI-powered pattern matching and prediction
5. **Delivery**: Real-time insights via API

### Key Features
- 🤖 **AI-Powered Analysis**: Natural language queries about market history
- 📊 **Pattern Recognition**: 22+ trading patterns with classification
- 🔍 **Historical Context**: 30-year market data analysis
- ⚡ **Real-Time Processing**: Sub-second query responses
- 📈 **Live Market Data**: Real-time quotes, charts, and technical indicators
- 🎯 **Multi-Source Integration**: Alpha Vantage, Finnhub, IEX Cloud, Polygon
- 🔒 **Enterprise Security**: AWS-grade security and compliance

## 📊 Market Data Integration

### Real-Time Features
- **Live Market Ticker**: Scrolling ticker with real-time prices
- **Technical Indicators**: RSI, MACD, Bollinger Bands, Moving Averages
- **Historical Charts**: Interactive price charts with volume data
- **Market Status**: Live market hours and trading status
- **Multi-Asset Support**: Stocks, indices, commodities, crypto

### Supported Data Sources
- **Alpha Vantage**: Technical indicators, fundamentals (Free: 500 calls/day)
- **IEX Cloud**: High-frequency quotes, fast updates (Free: 50K credits/month)
- **Finnhub**: Market news, earnings, recommendations (Free: 60 calls/minute)
- **Polygon**: Historical data, aggregates (Free: 5 calls/minute)

### Quick Setup
```javascript
// Configure API keys in api_config.js
const API_CONFIG = {
    ALPHA_VANTAGE: { key: 'your_key_here' },
    IEX_CLOUD: { key: 'your_key_here' },
    FINNHUB: { key: 'your_key_here' }
};
```

📋 **See [MARKET_DATA_SETUP.md](MARKET_DATA_SETUP.md) for detailed integration guide**
