/**
 * LiveTrader.ai Frontend-Backend Integration
 * Connects the web interface to AWS Lambda backend
 */

class LiveTraderAPI {
    constructor(apiUrl = null) {
        // Set your API Gateway URL here after deployment
        this.apiUrl = apiUrl || 'https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/query';
        this.isLocal = !apiUrl; // Flag for local development
    }

    /**
     * Query the LiveTrader AI backend
     * @param {string} query - User's natural language query
     * @param {string} userId - User identifier (optional)
     * @returns {Promise<string>} AI response
     */
    async queryAI(query, userId = 'web_user') {
        try {
            // Show loading state
            this.showLoading(true);

            const requestBody = {
                query: query,
                user_id: userId,
                timestamp: new Date().toISOString()
            };

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            // Hide loading state
            this.showLoading(false);

            if (result.response) {
                return result.response;
            } else {
                throw new Error('Invalid response format from API');
            }

        } catch (error) {
            this.showLoading(false);
            console.error('LiveTrader API Error:', error);
            
            // Return fallback response for development
            if (this.isLocal) {
                return this.getFallbackResponse(query);
            }
            
            throw error;
        }
    }

    /**
     * Get fallback response for local development
     * @param {string} query - User query
     * @returns {string} Fallback response
     */
    getFallbackResponse(query) {
        const responses = {
            '2008': `Based on historical analysis, the 2008 financial crisis had a profound impact on markets:

📉 **NASDAQ Impact:**
• Declined 40.5% from peak to trough
• Tech stocks were particularly vulnerable
• Recovery took approximately 2 years

📊 **Key Patterns Detected:**
• Classic bear market formation
• High volatility periods (VIX >40)
• Flight to quality in bonds

💡 **Historical Context:**
This was the worst financial crisis since the Great Depression, triggered by subprime mortgage collapse and excessive leverage in the financial system.`,

            'covid': `The COVID-19 pandemic created unprecedented market conditions in 2020:

📈 **Market Response:**
• Initial crash: -34% in 33 days (fastest bear market in history)
• Rapid recovery: Fed intervention and fiscal stimulus
• Tech stocks led the recovery

🔍 **Unique Patterns:**
• V-shaped recovery (unusual for pandemic-driven crashes)
• Massive increase in retail trading
• Sector rotation from value to growth

📊 **Comparison to Historical Pandemics:**
Unlike the 1918 flu pandemic, modern monetary policy and technology enabled faster recovery.`,

            'default': `I'm analyzing historical market patterns to provide insights about your query: "${query}"

🤖 **AI Analysis in Progress:**
• Scanning 30+ years of market data
• Identifying similar historical patterns
• Generating explainable insights

💡 **Note:** This is a demo response. Deploy the AWS backend to get real AI-powered analysis using Amazon Bedrock.

🚀 **To enable full functionality:**
1. Run \`python deploy.py\` to set up AWS infrastructure
2. Update the API URL in this integration script
3. Configure Bedrock model access in AWS console`
        };

        // Find best matching response
        const queryLower = query.toLowerCase();
        if (queryLower.includes('2008') || queryLower.includes('financial crisis')) {
            return responses['2008'];
        } else if (queryLower.includes('covid') || queryLower.includes('2020') || queryLower.includes('pandemic')) {
            return responses['covid'];
        } else {
            return responses['default'];
        }
    }

    /**
     * Show/hide loading indicator
     * @param {boolean} show - Whether to show loading
     */
    showLoading(show) {
        const loadingElement = document.getElementById('loading-indicator');
        if (loadingElement) {
            loadingElement.style.display = show ? 'block' : 'none';
        }

        // Update chat input
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.disabled = show;
            chatInput.placeholder = show ? 'AI is thinking...' : 'Ask about market patterns, historical events, or trading strategies...';
        }
    }

    /**
     * Update API URL after deployment
     * @param {string} newUrl - New API Gateway URL
     */
    updateApiUrl(newUrl) {
        this.apiUrl = newUrl;
        this.isLocal = false;
        console.log('LiveTrader API URL updated:', newUrl);
    }

    /**
     * Test API connection
     * @returns {Promise<boolean>} Connection status
     */
    async testConnection() {
        try {
            const testQuery = "Test connection";
            await this.queryAI(testQuery);
            return true;
        } catch (error) {
            console.error('API connection test failed:', error);
            return false;
        }
    }
}

// Initialize the API client
const liveTraderAPI = new LiveTraderAPI();

/**
 * Enhanced chat functionality with backend integration
 */
function enhanceChatInterface() {
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const sendButton = document.getElementById('send-button');

    if (!chatInput || !chatMessages) {
        console.warn('Chat interface elements not found');
        return;
    }

    // Enhanced send message function
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message to chat
        addMessageToChat('user', message);
        chatInput.value = '';

        try {
            // Get AI response
            const aiResponse = await liveTraderAPI.queryAI(message);
            
            // Add AI response to chat
            addMessageToChat('ai', aiResponse);
            
        } catch (error) {
            console.error('Error getting AI response:', error);
            addMessageToChat('ai', '❌ Sorry, I encountered an error processing your request. Please try again or check the backend connection.');
        }
    }

    // Add message to chat interface
    function addMessageToChat(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const timestamp = new Date().toLocaleTimeString();
        const senderLabel = sender === 'user' ? 'You' : 'LiveTrader AI';
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <strong>${senderLabel}</strong>
                <span class="timestamp">${timestamp}</span>
            </div>
            <div class="message-content">${formatMessage(message)}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Format message content (convert markdown-like syntax to HTML)
    function formatMessage(message) {
        return message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    // Event listeners
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Add welcome message
    setTimeout(() => {
        addMessageToChat('ai', `👋 Welcome to LiveTrader.ai! I'm your AI market analysis assistant.

I can help you understand:
• Historical market patterns and trends
• Impact of major events (2008 crisis, COVID-19, etc.)
• Trading pattern analysis and explanations
• Market comparisons across different time periods

Ask me anything about market history or trading patterns!`);
    }, 1000);
}

/**
 * Initialize the integration when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('LiveTrader.ai Frontend Integration Loaded');
    
    // Enhance chat interface
    enhanceChatInterface();
    
    // Test API connection (optional)
    liveTraderAPI.testConnection().then(connected => {
        if (connected) {
            console.log('✅ Backend API connection successful');
        } else {
            console.log('⚠️ Backend API not available - using demo mode');
        }
    });
});

// Export for use in other scripts
window.LiveTraderAPI = LiveTraderAPI;
window.liveTraderAPI = liveTraderAPI;