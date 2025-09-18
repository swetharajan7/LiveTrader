#!/usr/bin/env python3
"""
LiveTrader.ai Bedrock Agent Lambda Function
Handles natural language queries about historical market data
"""

import json
import boto3
import pandas as pd
from datetime import datetime, timedelta
import io

class LiveTraderAgent:
    def __init__(self):
        self.s3_client = boto3.client('s3')
        self.bedrock_client = boto3.client('bedrock-runtime')
        self.bucket_name = 'livetrader-historical-data'
        
    def lambda_handler(self, event, context):
        """Main Lambda handler for Bedrock Agent"""
        try:
            # Parse the incoming request
            query = event.get('query', '')
            user_id = event.get('user_id', 'anonymous')
            
            print(f"📝 Processing query: {query}")
            
            # Analyze the query and fetch relevant data
            analysis_result = self.analyze_query(query)
            
            # Generate response using Bedrock
            response = self.generate_bedrock_response(query, analysis_result)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                'body': json.dumps({
                    'response': response,
                    'timestamp': datetime.now().isoformat(),
                    'user_id': user_id
                })
            }
            
        except Exception as e:
            print(f"❌ Error processing request: {e}")
            return {
                'statusCode': 500,
                'body': json.dumps({
                    'error': 'Internal server error',
                    'message': str(e)
                })
            }
    
    def analyze_query(self, query):
        """Analyze user query and fetch relevant historical data"""
        query_lower = query.lower()
        
        # Determine which dataset to use
        if 'nasdaq' in query_lower or 'tech' in query_lower:
            dataset = 'nasdaq'
        elif 's&p' in query_lower or 'sp500' in query_lower:
            dataset = 'sp500'
        elif 'dow' in query_lower:
            dataset = 'dow'
        else:
            dataset = 'nasdaq'  # Default to NASDAQ
        
        # Determine time period
        if '2008' in query or 'financial crisis' in query_lower:
            start_date = '2007-01-01'
            end_date = '2010-01-01'
        elif '2020' in query or 'covid' in query_lower:
            start_date = '2019-01-01'
            end_date = '2022-01-01'
        elif 'dot-com' in query_lower or '2000' in query:
            start_date = '1999-01-01'
            end_date = '2003-01-01'
        else:
            # Default to last 5 years
            start_date = (datetime.now() - timedelta(days=5*365)).strftime('%Y-%m-%d')
            end_date = datetime.now().strftime('%Y-%m-%d')
        
        # Fetch data from S3
        historical_data = self.fetch_s3_data(dataset, start_date, end_date)
        
        return {
            'dataset': dataset,
            'start_date': start_date,
            'end_date': end_date,
            'data_summary': self.summarize_data(historical_data),
            'patterns_detected': self.detect_patterns(historical_data)
        }
    
    def fetch_s3_data(self, dataset, start_date, end_date):
        """Fetch historical data from S3"""
        try:
            # Get the main dataset file
            response = self.s3_client.get_object(
                Bucket=self.bucket_name,
                Key=f'{dataset}/daily/{dataset}_30_years.csv'
            )
            
            # Read CSV data
            csv_data = response['Body'].read().decode('utf-8')
            df = pd.read_csv(io.StringIO(csv_data), index_col=0, parse_dates=True)
            
            # Filter by date range
            df_filtered = df[(df.index >= start_date) & (df.index <= end_date)]
            
            return df_filtered
            
        except Exception as e:
            print(f"❌ Error fetching S3 data: {e}")
            return pd.DataFrame()
    
    def summarize_data(self, df):
        """Create summary statistics for the data"""
        if df.empty:
            return {}
        
        return {
            'total_days': len(df),
            'start_price': float(df['Close'].iloc[0]),
            'end_price': float(df['Close'].iloc[-1]),
            'max_price': float(df['High'].max()),
            'min_price': float(df['Low'].min()),
            'total_return': float((df['Close'].iloc[-1] / df['Close'].iloc[0] - 1) * 100),
            'volatility': float(df['Close'].pct_change().std() * 100),
            'avg_volume': float(df['Volume'].mean())
        }
    
    def detect_patterns(self, df):
        """Basic pattern detection"""
        if df.empty or len(df) < 50:
            return []
        
        patterns = []
        
        # Simple trend detection
        recent_trend = df['Close'].iloc[-20:].pct_change().mean()
        if recent_trend > 0.001:
            patterns.append("Bullish trend detected in recent 20 days")
        elif recent_trend < -0.001:
            patterns.append("Bearish trend detected in recent 20 days")
        
        # Support/Resistance levels
        recent_high = df['High'].iloc[-60:].max()
        recent_low = df['Low'].iloc[-60:].min()
        current_price = df['Close'].iloc[-1]
        
        if current_price > recent_high * 0.98:
            patterns.append("Price near resistance level")
        elif current_price < recent_low * 1.02:
            patterns.append("Price near support level")
        
        # Volume analysis
        avg_volume = df['Volume'].iloc[-20:].mean()
        recent_volume = df['Volume'].iloc[-5:].mean()
        
        if recent_volume > avg_volume * 1.5:
            patterns.append("Above-average volume detected")
        
        return patterns
    
    def generate_bedrock_response(self, query, analysis):
        """Generate response using Amazon Bedrock"""
        try:
            # Prepare context for Bedrock
            context = f"""
            User Query: {query}
            
            Historical Data Analysis:
            - Dataset: {analysis['dataset'].upper()}
            - Period: {analysis['start_date']} to {analysis['end_date']}
            - Data Summary: {json.dumps(analysis['data_summary'], indent=2)}
            - Patterns Detected: {', '.join(analysis['patterns_detected'])}
            
            Please provide a comprehensive, easy-to-understand analysis in plain English 
            that a non-financial person can understand. Include specific numbers, 
            historical context, and actionable insights.
            """
            
            # Call Bedrock (using Claude 3 Sonnet)
            response = self.bedrock_client.invoke_model(
                modelId='anthropic.claude-3-sonnet-20240229-v1:0',
                body=json.dumps({
                    'anthropic_version': 'bedrock-2023-05-31',
                    'max_tokens': 1000,
                    'messages': [
                        {
                            'role': 'user',
                            'content': f"""You are LiveTrader.ai, a friendly AI assistant that helps people understand stock market patterns and historical data. 

{context}

Respond in a conversational, educational tone that makes complex financial concepts accessible to everyone."""
                        }
                    ]
                })
            )
            
            response_body = json.loads(response['body'].read())
            return response_body['content'][0]['text']
            
        except Exception as e:
            print(f"❌ Bedrock error: {e}")
            return self.generate_fallback_response(query, analysis)
    
    def generate_fallback_response(self, query, analysis):
        """Generate fallback response when Bedrock is unavailable"""
        summary = analysis['data_summary']
        patterns = analysis['patterns_detected']
        
        response = f"Based on historical {analysis['dataset'].upper()} data from {analysis['start_date']} to {analysis['end_date']}:\n\n"
        
        if summary:
            total_return = summary.get('total_return', 0)
            response += f"📈 **Performance Summary:**\n"
            response += f"• Total return: {total_return:.2f}%\n"
            response += f"• Price range: ${summary.get('min_price', 0):.2f} - ${summary.get('max_price', 0):.2f}\n"
            response += f"• Average volatility: {summary.get('volatility', 0):.2f}%\n\n"
        
        if patterns:
            response += f"🔍 **Patterns Detected:**\n"
            for pattern in patterns:
                response += f"• {pattern}\n"
        
        response += f"\n💡 **Key Insight:** This analysis is based on {summary.get('total_days', 0)} days of historical data."
        
        return response

# For testing locally
if __name__ == "__main__":
    setup = LiveTraderAWSSetup()
    
    # Test query
    test_event = {
        'query': 'What happened to NASDAQ during the 2008 financial crisis?',
        'user_id': 'test_user'
    }
    
    result = setup.lambda_handler(test_event, None)
    print("🧪 Test Result:")
    print(json.dumps(result, indent=2))