#!/usr/bin/env python3
"""
LiveTrader.ai Complete Deployment Script
Handles AWS infrastructure setup, data ingestion, and Lambda deployment
"""

import boto3
import json
import os
import zipfile
import time
from datetime import datetime

class LiveTraderDeployment:
    def __init__(self, region='us-east-1'):
        self.region = region
        self.bucket_name = 'livetrader-historical-data'
        self.lambda_function_name = 'livetrader-bedrock-agent'
        
        # Initialize AWS clients
        try:
            self.s3_client = boto3.client('s3', region_name=region)
            self.lambda_client = boto3.client('lambda', region_name=region)
            self.iam_client = boto3.client('iam', region_name=region)
            self.apigateway_client = boto3.client('apigateway', region_name=region)
            print("✅ AWS clients initialized successfully")
        except Exception as e:
            print(f"❌ Error initializing AWS clients: {e}")
            print("💡 Make sure you have AWS credentials configured:")
            print("   - Run 'aws configure' to set up credentials")
            print("   - Or set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables")
            exit(1)
    
    def deploy_all(self):
        """Deploy complete LiveTrader.ai infrastructure"""
        print("🚀 Starting Complete LiveTrader.ai Deployment...")
        
        # Step 1: Create S3 bucket and data
        self.setup_s3_infrastructure()
        
        # Step 2: Create IAM roles
        self.create_iam_roles()
        
        # Step 3: Deploy Lambda function
        self.deploy_lambda_function()
        
        # Step 4: Create API Gateway
        self.create_api_gateway()
        
        # Step 5: Test the deployment
        self.test_deployment()
        
        print("\n🎉 Deployment Complete!")
        print("🔗 Your LiveTrader.ai backend is ready!")
    
    def setup_s3_infrastructure(self):
        """Set up S3 bucket and upload sample data"""
        print("\n📦 Setting up S3 infrastructure...")
        
        # Create bucket
        try:
            if self.region == 'us-east-1':
                self.s3_client.create_bucket(Bucket=self.bucket_name)
            else:
                self.s3_client.create_bucket(
                    Bucket=self.bucket_name,
                    CreateBucketConfiguration={'LocationConstraint': self.region}
                )
            print(f"✅ Created S3 bucket: {self.bucket_name}")
        except Exception as e:
            if 'BucketAlreadyOwnedByYou' in str(e):
                print(f"✅ S3 bucket {self.bucket_name} already exists")
            else:
                print(f"❌ Error creating S3 bucket: {e}")
                return
        
        # Upload sample data
        self.upload_sample_data()
    
    def upload_sample_data(self):
        """Upload sample historical data"""
        symbols = ['nasdaq', 'sp500', 'dow']
        
        for symbol in symbols:
            try:
                # Create sample CSV data
                sample_data = self.generate_sample_csv(symbol)
                
                # Upload to S3
                self.s3_client.put_object(
                    Bucket=self.bucket_name,
                    Key=f'{symbol}/daily/{symbol}_30_years.csv',
                    Body=sample_data,
                    ContentType='text/csv'
                )
                
                # Create metadata
                metadata = {
                    'symbol': symbol.upper(),
                    'name': symbol.upper(),
                    'start_date': '1995-01-01',
                    'end_date': datetime.now().strftime('%Y-%m-%d'),
                    'total_records': 1000,
                    'last_updated': datetime.now().isoformat(),
                    'note': 'Sample data for demonstration'
                }
                
                self.s3_client.put_object(
                    Bucket=self.bucket_name,
                    Key=f'metadata/{symbol}_metadata.json',
                    Body=json.dumps(metadata, indent=2),
                    ContentType='application/json'
                )
                
                print(f"✅ Uploaded sample data for {symbol.upper()}")
                
            except Exception as e:
                print(f"❌ Error uploading {symbol} data: {e}")
    
    def generate_sample_csv(self, symbol):
        """Generate sample CSV data for a symbol"""
        header = "Date,Open,High,Low,Close,Volume,SMA_20,SMA_50,SMA_200,RSI,BB_Upper,BB_Middle,BB_Lower\n"
        
        base_prices = {'nasdaq': 15000, 'sp500': 4500, 'dow': 35000}
        base_price = base_prices.get(symbol, 10000)
        
        rows = []
        for i in range(1000):  # 1000 sample days
            date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
            price = base_price + (i * 5) + ((i % 100) * 50)
            volume = 1000000 + (i * 5000)
            
            row = f"{date},{price-25},{price+25},{price-50},{price},{volume},{price},{price},{price},50.0,{price+50},{price},{price-50}\n"
            rows.append(row)
        
        return header + ''.join(rows)
    
    def create_iam_roles(self):
        """Create IAM roles for Lambda function"""
        print("\n🔐 Creating IAM roles...")
        
        # Lambda execution role
        trust_policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {"Service": "lambda.amazonaws.com"},
                    "Action": "sts:AssumeRole"
                }
            ]
        }
        
        try:
            self.iam_client.create_role(
                RoleName='LiveTraderLambdaRole',
                AssumeRolePolicyDocument=json.dumps(trust_policy),
                Description='Role for LiveTrader Lambda function'
            )
            print("✅ Created Lambda execution role")
        except Exception as e:
            if 'EntityAlreadyExists' in str(e):
                print("✅ Lambda execution role already exists")
            else:
                print(f"❌ Error creating Lambda role: {e}")
        
        # Attach policies
        policies = [
            'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
            'arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess',
            'arn:aws:iam::aws:policy/AmazonBedrockFullAccess'
        ]
        
        for policy in policies:
            try:
                self.iam_client.attach_role_policy(
                    RoleName='LiveTraderLambdaRole',
                    PolicyArn=policy
                )
            except Exception as e:
                print(f"⚠️ Policy attachment warning: {e}")
    
    def deploy_lambda_function(self):
        """Deploy Lambda function"""
        print("\n⚡ Deploying Lambda function...")
        
        # Create deployment package
        zip_path = self.create_lambda_package()
        
        # Get role ARN
        try:
            role_response = self.iam_client.get_role(RoleName='LiveTraderLambdaRole')
            role_arn = role_response['Role']['Arn']
        except Exception as e:
            print(f"❌ Error getting role ARN: {e}")
            return
        
        # Deploy function
        try:
            with open(zip_path, 'rb') as zip_file:
                self.lambda_client.create_function(
                    FunctionName=self.lambda_function_name,
                    Runtime='python3.9',
                    Role=role_arn,
                    Handler='lambda_bedrock_agent.lambda_handler',
                    Code={'ZipFile': zip_file.read()},
                    Description='LiveTrader.ai Bedrock Agent',
                    Timeout=30,
                    MemorySize=256,
                    Environment={
                        'Variables': {
                            'S3_BUCKET': self.bucket_name
                        }
                    }
                )
            print("✅ Lambda function deployed successfully")
        except Exception as e:
            if 'ResourceConflictException' in str(e):
                print("✅ Lambda function already exists, updating...")
                self.update_lambda_function(zip_path)
            else:
                print(f"❌ Error deploying Lambda function: {e}")
        
        # Clean up
        os.remove(zip_path)
    
    def create_lambda_package(self):
        """Create Lambda deployment package"""
        zip_path = 'lambda_deployment.zip'
        
        with zipfile.ZipFile(zip_path, 'w') as zip_file:
            zip_file.write('lambda_bedrock_agent.py')
        
        return zip_path
    
    def update_lambda_function(self, zip_path):
        """Update existing Lambda function"""
        try:
            with open(zip_path, 'rb') as zip_file:
                self.lambda_client.update_function_code(
                    FunctionName=self.lambda_function_name,
                    ZipFile=zip_file.read()
                )
            print("✅ Lambda function updated successfully")
        except Exception as e:
            print(f"❌ Error updating Lambda function: {e}")
    
    def create_api_gateway(self):
        """Create API Gateway for Lambda function"""
        print("\n🌐 Creating API Gateway...")
        
        try:
            # Create REST API
            api_response = self.apigateway_client.create_rest_api(
                name='LiveTraderAPI',
                description='API for LiveTrader.ai',
                endpointConfiguration={'types': ['REGIONAL']}
            )
            api_id = api_response['id']
            print(f"✅ Created API Gateway: {api_id}")
            
            # Get root resource
            resources = self.apigateway_client.get_resources(restApiId=api_id)
            root_id = resources['items'][0]['id']
            
            # Create resource
            resource_response = self.apigateway_client.create_resource(
                restApiId=api_id,
                parentId=root_id,
                pathPart='query'
            )
            resource_id = resource_response['id']
            
            # Create method
            self.apigateway_client.put_method(
                restApiId=api_id,
                resourceId=resource_id,
                httpMethod='POST',
                authorizationType='NONE'
            )
            
            # Set up integration
            lambda_arn = f"arn:aws:lambda:{self.region}:{self.get_account_id()}:function:{self.lambda_function_name}"
            
            self.apigateway_client.put_integration(
                restApiId=api_id,
                resourceId=resource_id,
                httpMethod='POST',
                type='AWS_PROXY',
                integrationHttpMethod='POST',
                uri=f"arn:aws:apigateway:{self.region}:lambda:path/2015-03-31/functions/{lambda_arn}/invocations"
            )
            
            # Deploy API
            self.apigateway_client.create_deployment(
                restApiId=api_id,
                stageName='prod'
            )
            
            api_url = f"https://{api_id}.execute-api.{self.region}.amazonaws.com/prod/query"
            print(f"✅ API Gateway deployed: {api_url}")
            
            # Add Lambda permission
            self.lambda_client.add_permission(
                FunctionName=self.lambda_function_name,
                StatementId='api-gateway-invoke',
                Action='lambda:InvokeFunction',
                Principal='apigateway.amazonaws.com',
                SourceArn=f"arn:aws:execute-api:{self.region}:{self.get_account_id()}:{api_id}/*/*"
            )
            
            return api_url
            
        except Exception as e:
            print(f"❌ Error creating API Gateway: {e}")
            return None
    
    def get_account_id(self):
        """Get AWS account ID"""
        try:
            sts_client = boto3.client('sts')
            return sts_client.get_caller_identity()['Account']
        except Exception as e:
            print(f"❌ Error getting account ID: {e}")
            return "123456789012"  # Fallback
    
    def test_deployment(self):
        """Test the deployed infrastructure"""
        print("\n🧪 Testing deployment...")
        
        # Test Lambda function
        try:
            test_event = {
                'query': 'What happened to NASDAQ in 2008?',
                'user_id': 'test_user'
            }
            
            response = self.lambda_client.invoke(
                FunctionName=self.lambda_function_name,
                Payload=json.dumps(test_event)
            )
            
            result = json.loads(response['Payload'].read())
            if result.get('statusCode') == 200:
                print("✅ Lambda function test passed")
            else:
                print(f"⚠️ Lambda function test warning: {result}")
                
        except Exception as e:
            print(f"❌ Lambda function test failed: {e}")

def main():
    """Main deployment function"""
    print("🚀 LiveTrader.ai Complete Deployment")
    print("=" * 50)
    
    # Check AWS credentials
    try:
        boto3.client('sts').get_caller_identity()
        print("✅ AWS credentials found")
    except Exception as e:
        print("❌ AWS credentials not found")
        print("💡 Please run 'aws configure' or set environment variables:")
        print("   export AWS_ACCESS_KEY_ID=your_access_key")
        print("   export AWS_SECRET_ACCESS_KEY=your_secret_key")
        print("   export AWS_DEFAULT_REGION=us-east-1")
        return
    
    # Start deployment
    deployment = LiveTraderDeployment()
    deployment.deploy_all()
    
    print("\n🎯 Next Steps:")
    print("1. Update your frontend to use the API Gateway URL")
    print("2. Test the integration with real queries")
    print("3. Replace sample data with real historical data")
    print("4. Configure Bedrock model access in your AWS account")

if __name__ == "__main__":
    main()