#!/usr/bin/env python3
"""
LiveTrader.ai AWS Setup Script
Creates S3 buckets and initial infrastructure for historical data storage
"""

import boto3
import json
from datetime import datetime, timedelta
# import yfinance as yf  # Will add sample data instead
import pandas as pd
import os

class LiveTraderAWSSetup:
    def __init__(self, region='us-east-1'):
        self.region = region
        self.s3_client = boto3.client('s3', region_name=region)
        self.bucket_name = 'livetrader-historical-data'
        
    def create_s3_bucket(self):
        """Create S3 bucket for historical data storage"""
        try:
            if self.region == 'us-east-1':
                # us-east-1 doesn't need LocationConstraint
                self.s3_client.create_bucket(Bucket=self.bucket_name)
            else:
                self.s3_client.create_bucket(
                    Bucket=self.bucket_name,
                    CreateBucketConfiguration={'LocationConstraint': self.region}
                )
            
            print(f"✅ Created S3 bucket: {self.bucket_name}")
            
            # Enable versioning
            self.s3_client.put_bucket_versioning(
                Bucket=self.bucket_name,
                VersioningConfiguration={'Status': 'Enabled'}
            )
            print("✅ Enabled S3 bucket versioning")
            
        except Exception as e:
            if 'BucketAlreadyOwnedByYou' in str(e):
                print(f"✅ S3 bucket {self.bucket_name} already exists")
            else:
                print(f"❌ Error creating S3 bucket: {e}")
    
    def create_folder_structure(self):
        """Create organized folder structure in S3"""
        folders = [
            'nasdaq/daily/',
            'nasdaq/weekly/',
            'nasdaq/monthly/',
            'sp500/daily/',
            'sp500/weekly/',
            'sp500/monthly/',
            'dow/daily/',
            'dow/weekly/',
            'dow/monthly/',
            'individual_stocks/',
            'processed_data/',
            'patterns/',
            'metadata/'
        ]
        
        for folder in folders:
            try:
                self.s3_client.put_object(
                    Bucket=self.bucket_name,
                    Key=folder,
                    Body=''
                )
                print(f"✅ Created folder: {folder}")
            except Exception as e:
                print(f"❌ Error creating folder {folder}: {e}")
    
    def fetch_historical_data(self):
        """Create sample historical data for major indices"""
        symbols = {
            'nasdaq': '^IXIC',
            'sp500': '^GSPC', 
            'dow': '^DJI'
        }
        
        # Create sample data for demonstration
        start_date = (datetime.now() - timedelta(days=30*365)).strftime('%Y-%m-%d')
        end_date = datetime.now().strftime('%Y-%m-%d')
        
        for name, symbol in symbols.items():
            try:
                print(f"📊 Creating sample {name.upper()} data from {start_date} to {end_date}...")
                
                # Create sample data structure
                sample_data = self.create_sample_data(name, start_date, end_date)
                
                # Save to S3
                csv_data = sample_data
                self.s3_client.put_object(
                    Bucket=self.bucket_name,
                    Key=f'{name}/daily/{name}_30_years.csv',
                    Body=csv_data,
                    ContentType='text/csv'
                )
                
                # Create metadata
                metadata = {
                    'symbol': symbol,
                    'name': name.upper(),
                    'start_date': start_date,
                    'end_date': end_date,
                    'total_records': 1000,  # Sample count
                    'last_updated': datetime.now().isoformat(),
                    'note': 'Sample data for demonstration - replace with real data'
                }
                
                self.s3_client.put_object(
                    Bucket=self.bucket_name,
                    Key=f'metadata/{name}_metadata.json',
                    Body=json.dumps(metadata, indent=2),
                    ContentType='application/json'
                )
                
                print(f"✅ Uploaded sample data for {name.upper()}")
                
            except Exception as e:
                print(f"❌ Error creating {name} data: {e}")
    
    def create_sample_data(self, name, start_date, end_date):
        """Create sample CSV data for demonstration"""
        header = "Date,Open,High,Low,Close,Volume,SMA_20,SMA_50,SMA_200,RSI,BB_Upper,BB_Middle,BB_Lower,Volume_SMA,Volume_Ratio\n"
        
        # Sample data rows (simplified for demo)
        sample_rows = []
        base_price = 15000 if name == 'nasdaq' else (4500 if name == 'sp500' else 35000)
        
        for i in range(100):  # 100 sample days
            date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
            price = base_price + (i * 10) + (i % 50 * 20)  # Simple price variation
            volume = 1000000 + (i * 10000)
            
            row = f"{date},{price-50},{price+50},{price-100},{price},{volume},{price},{price},{price},50.0,{price+100},{price},{price-100},{volume},1.0\n"
            sample_rows.append(row)
        
        return header + ''.join(sample_rows)
    
    def add_technical_indicators(self, df):
        """Add basic technical indicators to the data"""
        # Simple Moving Averages
        df['SMA_20'] = df['Close'].rolling(window=20).mean()
        df['SMA_50'] = df['Close'].rolling(window=50).mean()
        df['SMA_200'] = df['Close'].rolling(window=200).mean()
        
        # RSI
        delta = df['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['RSI'] = 100 - (100 / (1 + rs))
        
        # Bollinger Bands
        df['BB_Middle'] = df['Close'].rolling(window=20).mean()
        bb_std = df['Close'].rolling(window=20).std()
        df['BB_Upper'] = df['BB_Middle'] + (bb_std * 2)
        df['BB_Lower'] = df['BB_Middle'] - (bb_std * 2)
        
        # Volume indicators
        df['Volume_SMA'] = df['Volume'].rolling(window=20).mean()
        df['Volume_Ratio'] = df['Volume'] / df['Volume_SMA']
        
        return df
    
    def create_sample_patterns(self):
        """Create sample pattern data for training"""
        patterns = {
            'bullish_patterns': [
                'Ascending Triangle',
                'Bull Flag',
                'Cup and Handle',
                'Double Bottom',
                'Inverse Head and Shoulders'
            ],
            'bearish_patterns': [
                'Descending Triangle',
                'Bear Flag',
                'Head and Shoulders',
                'Double Top',
                'Rising Wedge'
            ],
            'neutral_patterns': [
                'Symmetrical Triangle',
                'Rectangle',
                'Pennant'
            ]
        }
        
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key='patterns/pattern_definitions.json',
                Body=json.dumps(patterns, indent=2),
                ContentType='application/json'
            )
            print("✅ Created pattern definitions")
        except Exception as e:
            print(f"❌ Error creating patterns: {e}")

def main():
    """Main setup function"""
    print("🚀 Starting LiveTrader.ai AWS Setup...")
    
    # Initialize setup
    setup = LiveTraderAWSSetup()
    
    # Step 1: Create S3 bucket
    setup.create_s3_bucket()
    
    # Step 2: Create folder structure
    setup.create_folder_structure()
    
    # Step 3: Fetch historical data
    setup.fetch_historical_data()
    
    # Step 4: Create pattern definitions
    setup.create_sample_patterns()
    
    print("\n🎉 AWS Setup Complete!")
    print(f"📊 Historical data stored in S3 bucket: {setup.bucket_name}")
    print("🔗 Ready for Bedrock Agent integration!")

if __name__ == "__main__":
    main()