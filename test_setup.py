#!/usr/bin/env python3
"""
LiveTrader.ai Setup Test Script
Tests the AWS infrastructure and deployment
"""

import boto3
import json
import sys
from datetime import datetime

def test_aws_credentials():
    """Test if AWS credentials are configured"""
    print("🔐 Testing AWS credentials...")
    try:
        sts = boto3.client('sts')
        identity = sts.get_caller_identity()
        print(f"✅ AWS credentials valid - Account: {identity['Account']}")
        return True
    except Exception as e:
        print(f"❌ AWS credentials error: {e}")
        print("💡 Run 'aws configure' to set up credentials")
        return False

def test_s3_bucket():
    """Test S3 bucket access"""
    print("\n📦 Testing S3 bucket...")
    try:
        s3 = boto3.client('s3')
        bucket_name = 'livetrader-historical-data'
        
        # Check if bucket exists
        s3.head_bucket(Bucket=bucket_name)
        print(f"✅ S3 bucket '{bucket_name}' accessible")
        
        # List some objects
        response = s3.list_objects_v2(Bucket=bucket_name, MaxKeys=5)
        if 'Contents' in response:
            print(f"✅ Found {len(response['Contents'])} objects in bucket")
            for obj in response['Contents'][:3]:
                print(f"   - {obj['Key']}")
        else:
            print("⚠️ Bucket is empty - run aws_setup.py to populate")
        
        return True
    except Exception as e:
        print(f"❌ S3 bucket error: {e}")
        print("💡 Run 'python aws_setup.py' to create bucket")
        return False

def test_lambda_function():
    """Test Lambda function"""
    print("\n⚡ Testing Lambda function...")
    try:
        lambda_client = boto3.client('lambda')
        function_name = 'livetrader-bedrock-agent'
        
        # Check if function exists
        response = lambda_client.get_function(FunctionName=function_name)
        print(f"✅ Lambda function '{function_name}' exists")
        
        # Test invoke
        test_payload = {
            'query': 'Test query about market trends',
            'user_id': 'test_user'
        }
        
        invoke_response = lambda_client.invoke(
            FunctionName=function_name,
            Payload=json.dumps(test_payload)
        )
        
        result = json.loads(invoke_response['Payload'].read())
        if result.get('statusCode') == 200:
            print("✅ Lambda function test successful")
        else:
            print(f"⚠️ Lambda function returned: {result}")
        
        return True
    except Exception as e:
        print(f"❌ Lambda function error: {e}")
        print("💡 Run 'python deploy.py' to create Lambda function")
        return False

def test_bedrock_access():
    """Test Bedrock model access"""
    print("\n🧠 Testing Bedrock access...")
    try:
        bedrock = boto3.client('bedrock-runtime')
        
        # Test with a simple query
        test_prompt = "Hello, this is a test."
        
        response = bedrock.invoke_model(
            modelId='anthropic.claude-3-sonnet-20240229-v1:0',
            body=json.dumps({
                'anthropic_version': 'bedrock-2023-05-31',
                'max_tokens': 100,
                'messages': [
                    {
                        'role': 'user',
                        'content': test_prompt
                    }
                ]
            })
        )
        
        result = json.loads(response['body'].read())
        if result.get('content'):
            print("✅ Bedrock model access successful")
        else:
            print(f"⚠️ Bedrock response: {result}")
        
        return True
    except Exception as e:
        print(f"❌ Bedrock access error: {e}")
        print("💡 Enable Claude 3 Sonnet model access in AWS Bedrock console")
        return False

def test_api_gateway():
    """Test API Gateway (if deployed)"""
    print("\n🌐 Testing API Gateway...")
    try:
        apigateway = boto3.client('apigateway')
        
        # List APIs
        apis = apigateway.get_rest_apis()
        livetrader_api = None
        
        for api in apis['items']:
            if 'LiveTrader' in api['name']:
                livetrader_api = api
                break
        
        if livetrader_api:
            print(f"✅ API Gateway found: {livetrader_api['name']}")
            api_url = f"https://{livetrader_api['id']}.execute-api.us-east-1.amazonaws.com/prod/query"
            print(f"🔗 API URL: {api_url}")
        else:
            print("⚠️ LiveTrader API Gateway not found")
            print("💡 Run 'python deploy.py' to create API Gateway")
        
        return livetrader_api is not None
    except Exception as e:
        print(f"❌ API Gateway error: {e}")
        return False

def run_comprehensive_test():
    """Run all tests"""
    print("🧪 LiveTrader.ai Infrastructure Test")
    print("=" * 50)
    
    tests = [
        ("AWS Credentials", test_aws_credentials),
        ("S3 Bucket", test_s3_bucket),
        ("Lambda Function", test_lambda_function),
        ("Bedrock Access", test_bedrock_access),
        ("API Gateway", test_api_gateway)
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"❌ {test_name} test failed: {e}")
            results[test_name] = False
    
    # Summary
    print("\n📊 Test Summary")
    print("-" * 30)
    
    passed = sum(results.values())
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:<20} {status}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Your LiveTrader.ai infrastructure is ready!")
    else:
        print(f"\n⚠️ {total - passed} test(s) failed. Check the setup guide for solutions.")
    
    return passed == total

def main():
    """Main test function"""
    if len(sys.argv) > 1 and sys.argv[1] == '--quick':
        # Quick test - just credentials and S3
        print("🚀 Quick Test Mode")
        test_aws_credentials()
        test_s3_bucket()
    else:
        # Comprehensive test
        run_comprehensive_test()

if __name__ == "__main__":
    main()