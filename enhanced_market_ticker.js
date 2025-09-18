/**
 * Enhanced Market Ticker with Real Data Integration
 * Displays live market data with smooth animations and updates
 */

class EnhancedMarketTicker {
    constructor() {
        this.symbols = [
            { symbol: 'IXIC', name: 'NASDAQ', type: 'index' },
            { symbol: 'SPX', name: 'S&P 500', type: 'index' },
            { symbol: 'DJI', name: 'DOW', type: 'index' },
            { symbol: 'GLD', name: 'GOLD', type: 'commodity' },
            { symbol: 'BTC-USD', name: 'BTC', type: 'crypto' },
            { symbol: 'ETH-USD', name: 'ETH', type: 'crypto' }
        ];
        
        this.tickerData = new Map();
        this.isScrolling = false;
        this.updateInterval = null;
        
        this.initializeTicker();
    }

    /**
     * Initialize the market ticker
     */
    initializeTicker() {
        this.createTickerHTML();
        this.startDataUpdates();
        this.setupScrolling();
        
        console.log('📈 Enhanced Market Ticker initialized');
    }

    /**
     * Create ticker HTML structure
     */
    createTickerHTML() {
        const tickerContainer = document.getElementById('market-ticker') || this.createTickerContainer();
        
        tickerContainer.innerHTML = `
            <div class="ticker-wrapper">
                <div class="ticker-content" id="ticker-content">
                    ${this.symbols.map(item => this.createTickerItem(item)).join('')}
                </div>
            </div>
        `;

        this.addTickerStyles();
    }

    /**
     * Create ticker container if it doesn't exist
     */
    createTickerContainer() {
        const container = document.createElement('div');
        container.id = 'market-ticker';
        container.className = 'market-ticker';
        
        // Insert after header or at top of main content
        const header = document.querySelector('header');
        if (header) {
            header.insertAdjacentElement('afterend', container);
        } else {
            document.body.insertBefore(container, document.body.firstChild);
        }
        
        return container;
    }

    /**
     * Create individual ticker item
     */
    createTickerItem(item) {
        return `
            <div class="ticker-item" data-symbol="${item.symbol}" data-type="${item.type}">
                <div class="ticker-symbol">
                    <span class="symbol-name">${item.name}</span>
                    <span class="symbol-type ${item.type}">${item.type.toUpperCase()}</span>
                </div>
                <div class="ticker-price">
                    <span class="price" data-price="0">--</span>
                    <span class="change" data-change="0">--</span>
                </div>
                <div class="ticker-chart">
                    <canvas class="mini-chart" width="60" height="30"></canvas>
                </div>
            </div>
        `;
    }

    /**
     * Add ticker styles
     */
    addTickerStyles() {
        if (document.getElementById('ticker-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'ticker-styles';
        styles.textContent = `
            .market-ticker {
                background: linear-gradient(90deg, rgba(30, 58, 138, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%);
                border-bottom: 2px solid rgba(220, 38, 38, 0.3);
                overflow: hidden;
                white-space: nowrap;
                position: relative;
                z-index: 999;
                backdrop-filter: blur(10px);
            }

            .ticker-wrapper {
                display: flex;
                align-items: center;
                height: 60px;
                overflow: hidden;
            }

            .ticker-content {
                display: flex;
                align-items: center;
                animation: scroll-ticker 60s linear infinite;
                gap: 2rem;
                padding: 0 2rem;
            }

            .ticker-item {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 0.5rem 1rem;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                min-width: 200px;
                transition: all 0.3s ease;
            }

            .ticker-item:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: scale(1.05);
            }

            .ticker-symbol {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
            }

            .symbol-name {
                font-weight: 600;
                font-size: 0.9rem;
                color: #ffffff;
            }

            .symbol-type {
                font-size: 0.7rem;
                padding: 2px 6px;
                border-radius: 4px;
                font-weight: 500;
                text-transform: uppercase;
            }

            .symbol-type.index {
                background: rgba(59, 130, 246, 0.3);
                color: #93c5fd;
            }

            .symbol-type.commodity {
                background: rgba(245, 158, 11, 0.3);
                color: #fbbf24;
            }

            .symbol-type.crypto {
                background: rgba(168, 85, 247, 0.3);
                color: #c084fc;
            }

            .ticker-price {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                min-width: 80px;
            }

            .price {
                font-weight: 700;
                font-size: 1rem;
                color: #ffffff;
                transition: color 0.3s ease;
            }

            .change {
                font-size: 0.8rem;
                font-weight: 500;
                transition: color 0.3s ease;
            }

            .change.positive {
                color: #10b981;
            }

            .change.negative {
                color: #ef4444;
            }

            .change.neutral {
                color: #9ca3af;
            }

            .ticker-chart {
                width: 60px;
                height: 30px;
            }

            .mini-chart {
                width: 100%;
                height: 100%;
            }

            @keyframes scroll-ticker {
                0% {
                    transform: translateX(100%);
                }
                100% {
                    transform: translateX(-100%);
                }
            }

            .ticker-content:hover {
                animation-play-state: paused;
            }

            /* Price flash animations */
            .price-flash-up {
                animation: flash-green 0.5s ease-in-out;
            }

            .price-flash-down {
                animation: flash-red 0.5s ease-in-out;
            }

            @keyframes flash-green {
                0%, 100% { background-color: transparent; }
                50% { background-color: rgba(16, 185, 129, 0.3); }
            }

            @keyframes flash-red {
                0%, 100% { background-color: transparent; }
                50% { background-color: rgba(239, 68, 68, 0.3); }
            }

            /* Responsive design */
            @media (max-width: 768px) {
                .ticker-item {
                    min-width: 150px;
                    gap: 0.5rem;
                }

                .ticker-chart {
                    display: none;
                }

                .symbol-name {
                    font-size: 0.8rem;
                }

                .price {
                    font-size: 0.9rem;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Start data updates
     */
    startDataUpdates() {
        // Initial load
        this.updateAllData();

        // Set up regular updates
        this.updateInterval = setInterval(() => {
            if (window.marketDataManager && window.marketDataManager.isMarketOpen()) {
                this.updateAllData();
            }
        }, 30000); // Update every 30 seconds during market hours

        // Update every 5 minutes when market is closed
        setInterval(() => {
            if (window.marketDataManager && !window.marketDataManager.isMarketOpen()) {
                this.updateAllData();
            }
        }, 300000);
    }

    /**
     * Update all ticker data
     */
    async updateAllData() {
        for (const item of this.symbols) {
            try {
                await this.updateSymbolData(item.symbol);
                // Small delay between requests to respect rate limits
                await new Promise(resolve => setTimeout(resolve, 200));
            } catch (error) {
                console.error(`Error updating ${item.symbol}:`, error);
            }
        }
    }

    /**
     * Update data for a specific symbol
     */
    async updateSymbolData(symbol) {
        try {
            let quote;
            
            if (window.marketDataManager) {
                quote = await window.marketDataManager.getRealTimeQuote(symbol);
            } else {
                quote = this.getFallbackQuote(symbol);
            }

            if (quote) {
                this.updateTickerDisplay(symbol, quote);
                this.updateMiniChart(symbol, quote);
                this.tickerData.set(symbol, quote);
            }
        } catch (error) {
            console.error(`Error fetching data for ${symbol}:`, error);
            // Use fallback data
            const fallbackQuote = this.getFallbackQuote(symbol);
            this.updateTickerDisplay(symbol, fallbackQuote);
        }
    }

    /**
     * Update ticker display with new data
     */
    updateTickerDisplay(symbol, quote) {
        const tickerItem = document.querySelector(`[data-symbol="${symbol}"]`);
        if (!tickerItem) return;

        const priceElement = tickerItem.querySelector('.price');
        const changeElement = tickerItem.querySelector('.change');

        if (priceElement && changeElement) {
            // Get previous price for flash animation
            const previousPrice = parseFloat(priceElement.dataset.price) || 0;
            const currentPrice = quote.price;

            // Update price
            priceElement.textContent = this.formatPrice(currentPrice, symbol);
            priceElement.dataset.price = currentPrice;

            // Update change
            const changeText = `${quote.change >= 0 ? '+' : ''}${quote.change.toFixed(2)} (${quote.changePercent.toFixed(2)}%)`;
            changeElement.textContent = changeText;

            // Update change color
            changeElement.className = `change ${quote.change > 0 ? 'positive' : quote.change < 0 ? 'negative' : 'neutral'}`;

            // Flash animation for price changes
            if (previousPrice !== 0 && previousPrice !== currentPrice) {
                const flashClass = currentPrice > previousPrice ? 'price-flash-up' : 'price-flash-down';
                tickerItem.classList.add(flashClass);
                setTimeout(() => tickerItem.classList.remove(flashClass), 500);
            }
        }
    }

    /**
     * Update mini chart
     */
    updateMiniChart(symbol, quote) {
        const canvas = document.querySelector(`[data-symbol="${symbol}"] .mini-chart`);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Get historical data for mini chart
        const historicalData = this.getHistoricalDataForChart(symbol);
        if (historicalData.length < 2) return;

        // Draw mini chart
        this.drawMiniChart(ctx, historicalData, width, height, quote.change >= 0);
    }

    /**
     * Draw mini chart
     */
    drawMiniChart(ctx, data, width, height, isPositive) {
        const color = isPositive ? '#10b981' : '#ef4444';
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        const maxPrice = Math.max(...data);
        const minPrice = Math.min(...data);
        const priceRange = maxPrice - minPrice || 1;

        data.forEach((price, index) => {
            const x = (index / (data.length - 1)) * width;
            const y = height - ((price - minPrice) / priceRange) * height;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Add gradient fill
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = color;
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    /**
     * Get historical data for chart (simplified)
     */
    getHistoricalDataForChart(symbol) {
        // Generate sample data for mini chart
        const data = [];
        const basePrice = this.getFallbackQuote(symbol).price;
        
        for (let i = 0; i < 20; i++) {
            data.push(basePrice + (Math.random() - 0.5) * basePrice * 0.05);
        }
        
        return data;
    }

    /**
     * Format price based on symbol type
     */
    formatPrice(price, symbol) {
        if (symbol.includes('BTC') || symbol.includes('ETH')) {
            return price.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
        } else if (price > 1000) {
            return price.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
        } else {
            return price.toFixed(2);
        }
    }

    /**
     * Setup scrolling behavior
     */
    setupScrolling() {
        const tickerContent = document.getElementById('ticker-content');
        if (!tickerContent) return;

        // Pause scrolling on hover
        tickerContent.addEventListener('mouseenter', () => {
            tickerContent.style.animationPlayState = 'paused';
        });

        tickerContent.addEventListener('mouseleave', () => {
            tickerContent.style.animationPlayState = 'running';
        });

        // Click to view details
        tickerContent.addEventListener('click', (e) => {
            const tickerItem = e.target.closest('.ticker-item');
            if (tickerItem) {
                const symbol = tickerItem.dataset.symbol;
                this.showSymbolDetails(symbol);
            }
        });
    }

    /**
     * Show symbol details modal
     */
    showSymbolDetails(symbol) {
        const data = this.tickerData.get(symbol);
        if (!data) return;

        const modal = document.createElement('div');
        modal.className = 'symbol-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${symbol} Details</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="detail-row">
                        <span>Current Price:</span>
                        <span>${this.formatPrice(data.price, symbol)}</span>
                    </div>
                    <div class="detail-row">
                        <span>Change:</span>
                        <span class="${data.change >= 0 ? 'positive' : 'negative'}">
                            ${data.change >= 0 ? '+' : ''}${data.change.toFixed(2)} (${data.changePercent.toFixed(2)}%)
                        </span>
                    </div>
                    <div class="detail-row">
                        <span>Volume:</span>
                        <span>${data.volume?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span>High:</span>
                        <span>${data.high?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span>Low:</span>
                        <span>${data.low?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span>Source:</span>
                        <span>${data.source || 'Demo'}</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal functionality
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });

        // Add modal styles
        this.addModalStyles();
    }

    /**
     * Add modal styles
     */
    addModalStyles() {
        if (document.getElementById('modal-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'modal-styles';
        styles.textContent = `
            .symbol-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }

            .modal-content {
                background: linear-gradient(135deg, #1e3a8a 0%, #0a1628 100%);
                border-radius: 12px;
                padding: 2rem;
                max-width: 400px;
                width: 90%;
                color: white;
                border: 1px solid rgba(220, 38, 38, 0.3);
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                padding-bottom: 1rem;
            }

            .modal-header h3 {
                margin: 0;
                color: #ffffff;
            }

            .close-modal {
                background: none;
                border: none;
                color: #ffffff;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background-color 0.3s ease;
            }

            .close-modal:hover {
                background-color: rgba(220, 38, 38, 0.2);
            }

            .detail-row {
                display: flex;
                justify-content: space-between;
                padding: 0.5rem 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .detail-row:last-child {
                border-bottom: none;
            }

            .detail-row .positive {
                color: #10b981;
            }

            .detail-row .negative {
                color: #ef4444;
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Fallback quote for demo mode
     */
    getFallbackQuote(symbol) {
        const baseValues = {
            'IXIC': 15000,
            'SPX': 4500,
            'DJI': 35000,
            'GLD': 180,
            'BTC-USD': 45000,
            'ETH-USD': 3000
        };

        const basePrice = baseValues[symbol] || 100;
        const randomChange = (Math.random() - 0.5) * basePrice * 0.02;
        const price = basePrice + randomChange;

        return {
            symbol: symbol,
            price: price,
            change: randomChange,
            changePercent: (randomChange / basePrice) * 100,
            volume: Math.floor(Math.random() * 10000000),
            high: price + Math.random() * price * 0.01,
            low: price - Math.random() * price * 0.01,
            open: price + (Math.random() - 0.5) * price * 0.005,
            previousClose: price - randomChange,
            timestamp: Date.now(),
            source: 'Demo Data'
        };
    }

    /**
     * Destroy ticker
     */
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        const ticker = document.getElementById('market-ticker');
        if (ticker) {
            ticker.remove();
        }

        const styles = document.getElementById('ticker-styles');
        if (styles) {
            styles.remove();
        }
    }
}

// Initialize enhanced ticker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedMarketTicker = new EnhancedMarketTicker();
});

// Export for global use
window.EnhancedMarketTicker = EnhancedMarketTicker;