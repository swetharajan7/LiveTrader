# LiveTrader.ai AWS Setup Guide

Complete guide to deploy your LiveTrader.ai platform on AWS with Bedrock integration.

## 🚀 Quick Start

### Prerequisites
- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Python 3.7+ with pip

### 1. Configure AWS Credentials

```bash
# Option 1: Using AWS CLI
aws configure

# Option 2: Environment Variables
export AWS_ACCESS_KEY_ID=your_access_key_here
export AWS_SECRET_ACCESS_KEY=your_secret_key_here
export AWS_DEFAULT_REGION=us-east-1
```

### 2. Install Dependencies

```bash
pip install boto3 pandas numpy requests
```

### 3. Deploy Infrastructure

```bash
# Complete deployment (recommended)
python deploy.py

# Or step-by-step
python aws_setup.py  # S3 and data only
```

## 📋 What Gets Created

### AWS Resources
- **S3 Bucket**: `livetrader-historical-data`
  - Historical market data (NASDAQ, S&P 500, DOW)
  - Technical indicators and metadata
  - Organized folder structure

- **Lambda Function**: `livetrader-bedrock-agent`
  - Processes natural language queries
  - Integrates with Amazon Bedrock
  - Returns AI-generated market analysis

- **API Gateway**: REST API endpoint
  - Public endpoint for frontend integration
  - CORS enabled for web applications
  - POST /query endpoint

- **IAM Roles**: Proper permissions
  - Lambda execution role
  - S3 read access
  - Bedrock full access

## 🔧 Configuration

### Environment Variables
The Lambda function uses these environment variables:
- `S3_BUCKET`: Name of the S3 bucket (auto-configured)

### Bedrock Model Access
Enable these models in your AWS account:
1. Go to AWS Bedrock console
2. Navigate to "Model access"
3. Enable: `anthropic.claude-3-sonnet-20240229-v1:0`

## 🌐 Frontend Integration

### API Endpoint
After deployment, you'll get an API Gateway URL like:
```
https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/query
```

### Usage Example
```javascript
// Frontend integration
async function queryLiveTrader(userQuery) {
    const response = await fetch('YOUR_API_GATEWAY_URL', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: userQuery,
            user_id: 'web_user'
        })
    });
    
    const result = await response.json();
    return result.response;
}

// Example usage
const analysis = await queryLiveTrader("What happened to NASDAQ during the 2008 financial crisis?");
```

## 📊 Data Structure

### S3 Bucket Organization
```
livetrader-historical-data/
├── nasdaq/
│   └── daily/
│       └── nasdaq_30_years.csv
├── sp500/
│   └── daily/
│       └── sp500_30_years.csv
├── dow/
│   └── daily/
│       └── dow_30_years.csv
├── metadata/
│   ├── nasdaq_metadata.json
│   ├── sp500_metadata.json
│   └── dow_metadata.json
└── patterns/
    └── pattern_definitions.json
```

### CSV Data Format
```csv
Date,Open,High,Low,Close,Volume,SMA_20,SMA_50,SMA_200,RSI,BB_Upper,BB_Middle,BB_Lower
2024-01-01,15000,15100,14900,15050,1000000,15000,15000,15000,50.0,15100,15000,14900
```

## 🔄 Updating Data

### Replace Sample Data with Real Data
1. Install yfinance: `pip install yfinance`
2. Modify `aws_setup.py` to use real data fetching
3. Run the updated script

### Manual Data Upload
```python
import boto3

s3 = boto3.client('s3')
s3.upload_file('your_data.csv', 'livetrader-historical-data', 'nasdaq/daily/nasdaq_30_years.csv')
```

## 🧪 Testing

### Test Lambda Function
```bash
aws lambda invoke \
    --function-name livetrader-bedrock-agent \
    --payload '{"query":"What is the current market trend?","user_id":"test"}' \
    response.json
```

### Test API Gateway
```bash
curl -X POST https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/query \
    -H "Content-Type: application/json" \
    -d '{"query":"Explain the 2008 financial crisis impact on markets","user_id":"test"}'
```

## 🛠 Troubleshooting

### Common Issues

#### 1. "Unable to locate credentials"
```bash
# Solution: Configure AWS credentials
aws configure
# Or set environment variables
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
```

#### 2. "Access Denied" for Bedrock
- Go to AWS Bedrock console
- Enable model access for Claude 3 Sonnet
- Wait for approval (usually instant)

#### 3. Lambda timeout
- Increase timeout in Lambda configuration
- Optimize data processing in the function

#### 4. CORS issues
- API Gateway automatically handles CORS
- Check browser console for specific errors

### Monitoring
- CloudWatch Logs: Monitor Lambda execution
- S3 Access Logs: Track data access patterns
- API Gateway Metrics: Monitor API usage

## 💰 Cost Estimation

### Monthly Costs (approximate)
- **S3 Storage**: $0.50-2.00 (depending on data size)
- **Lambda**: $0.10-1.00 (based on usage)
- **API Gateway**: $0.50-5.00 (based on requests)
- **Bedrock**: $0.10-10.00 (based on AI queries)

**Total**: ~$1-20/month for moderate usage

## 🔒 Security Best Practices

1. **IAM Roles**: Use least privilege principle
2. **API Keys**: Consider adding API key authentication
3. **Rate Limiting**: Implement in API Gateway
4. **Data Encryption**: S3 encryption at rest (enabled by default)
5. **VPC**: Consider VPC deployment for production

## 📈 Scaling Considerations

### High Traffic
- Enable Lambda provisioned concurrency
- Use CloudFront for API caching
- Consider DynamoDB for faster data access

### Large Datasets
- Partition data by date ranges
- Use S3 Select for efficient querying
- Implement data archiving strategy

## 🔄 Updates and Maintenance

### Regular Tasks
1. Update historical data monthly
2. Monitor AWS costs
3. Review CloudWatch logs
4. Update Lambda function code as needed

### Backup Strategy
- S3 versioning is enabled
- Cross-region replication for critical data
- Regular metadata backups

## 📞 Support

### AWS Resources
- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [S3 User Guide](https://docs.aws.amazon.com/s3/latest/userguide/)

### Troubleshooting Steps
1. Check CloudWatch logs
2. Verify IAM permissions
3. Test components individually
4. Review AWS service limits

---

## 🎯 Next Steps After Deployment

1. **Test the Integration**: Use the provided test scripts
2. **Update Frontend**: Integrate the API Gateway URL
3. **Add Real Data**: Replace sample data with actual market data
4. **Monitor Performance**: Set up CloudWatch alarms
5. **Optimize Costs**: Review and adjust resource configurations

Your LiveTrader.ai platform is now ready for production! 🚀