# AWS Deployment Guide for Review Scraper

This guide will walk you through deploying the Review Scraper application to AWS using Amplify for the frontend and Elastic Beanstalk for the backend.

## Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. Node.js 22+ and npm installed
4. Git repository for your project

## Step 1: Database Password Setup

### Option A: Using AWS Secrets Manager (Recommended)

1. **Create a secret in AWS Secrets Manager:**
   ```bash
   aws secretsmanager create-secret \
     --name "review-scraper-db-password" \
     --description "Database password for Review Scraper application" \
     --secret-string "your_secure_password_here"
   ```

2. **Update your backend to use Secrets Manager:**
   ```bash
   # Install AWS SDK for Secrets Manager
   npm install @aws-sdk/client-secrets-manager
   ```

3. **Modify your database connection to retrieve password from Secrets Manager:**
   ```typescript
   // In api/config/database.ts
   import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
   
   async function getDatabasePassword(): Promise<string> {
     const client = new SecretsManagerClient({ region: process.env.AWS_REGION });
     const command = new GetSecretValueCommand({
       SecretId: 'review-scraper-db-password'
     });
     
     try {
       const response = await client.send(command);
       return response.SecretString || '';
     } catch (error) {
       console.error('Error retrieving database password from Secrets Manager:', error);
       throw error;
     }
   }
   ```

### Option B: Environment Variables

1. **Set the database password in your environment:**
   ```bash
   export DB_PASSWORD="your_secure_password_here"
   ```

2. **Update your `.env` file:**
   ```
   DB_PASSWORD=your_secure_password_here
   ```

## Step 2: Frontend Deployment (AWS Amplify)

### 1. Initialize Amplify

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Configure Amplify
amplify configure
```

### 2. Initialize Amplify in your project

```bash
amplify init
```

Follow the prompts:
- Choose your default editor
- Select AWS profile
- Choose "javascript" for framework
- Choose "react" for project type
- Build command: `npm run build`
- Start command: `npm start`
- Choose "dev" for environment

### 3. Add hosting

```bash
amplify add hosting
```

Choose:
- Hosting with Amplify Console
- Manual deployment

### 4. Deploy frontend

```bash
amplify publish
```

Your frontend will be available at: `https://branch-name.d1a2b3c4.amplifyapp.com`

## Step 3: Backend Deployment (Elastic Beanstalk)

### 1. Install EB CLI

```bash
npm install -g elastic-beanstalk
```

### 2. Initialize Elastic Beanstalk

```bash
eb init
```

Follow the prompts:
- Choose your AWS region
- Create new application: "review-scraper-backend"
- Choose "Node.js" platform
- Choose "Node.js 22" version
- Set up SSH (optional)

### 3. Create environment

```bash
eb create review-scraper-prod
```

Choose:
- Load balancer environment
- Single instance (for development) or Load balanced (for production)
- Choose instance type (t3.micro for development, t3.small for production)

### 4. Configure environment variables

```bash
eb setenv NODE_ENV=production

eb setenv AWS_REGION=us-east-1

eb setenv AWS_ACCESS_KEY_ID=your_access_key

eb setenv AWS_SECRET_ACCESS_KEY=your_secret_key

eb setenv DB_HOST=your_rds_endpoint

eb setenv DB_PORT=5432

eb setenv DB_NAME=review_scraper

eb setenv DB_USER=postgres

eb setenv JWT_SECRET=your_jwt_secret

eb setenv S3_BUCKET_NAME=your-s3-bucket-name
```

### 5. Deploy backend

```bash
eb deploy
```

Your backend API will be available at: `http://review-scraper-prod.region.elasticbeanstalk.com`

## Step 4: Database Setup (Amazon RDS)

### 1. Create RDS database

```bash
aws rds create-db-instance \
  --db-instance-identifier review-scraper-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username postgres \
  --master-user-password your_secure_password_here \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-your-security-group-id \
  --db-subnet-group-name your-db-subnet-group
```

### 2. Wait for database to be available

```bash
aws rds wait db-instance-available --db-instance-identifier review-scraper-db
```

### 3. Get database endpoint

```bash
aws rds describe-db-instances --db-instance-identifier review-scraper-db --query 'DBInstances[0].Endpoint.Address'
```

### 4. Update backend environment variables

```bash
eb setenv DB_HOST=your-rds-endpoint.amazonaws.com

eb setenv DB_PASSWORD=your_secure_password_here
```

## Step 5: S3 Bucket Setup

### 1. Create S3 bucket

```bash
aws s3 mb s3://your-review-scraper-bucket-name
```

### 2. Configure CORS

Create `s3-cors.json`:
```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": ["https://your-amplify-domain.amplifyapp.com"],
      "ExposeHeaders": []
    }
  ]
}
```

Apply CORS configuration:
```bash
aws s3api put-bucket-cors --bucket your-review-scraper-bucket-name --cors-configuration file://s3-cors.json
```

### 3. Update backend environment variables

```bash
eb setenv S3_BUCKET_NAME=your-review-scraper-bucket-name
```

## Step 6: Security Configuration

### 1. IAM Roles

Create IAM roles for your application:

```bash
# Create role for Elastic Beanstalk
aws iam create-role --role-name review-scraper-eb-role --assume-role-policy-document file://trust-policy.json

# Attach policies
aws iam attach-role-policy --role-name review-scraper-eb-role --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
aws iam attach-role-policy --role-name review-scraper-eb-role --policy-arn arn:aws:iam::aws:policy/AmazonRDSDataFullAccess
```

### 2. Security Groups

Ensure your security groups allow:
- Port 80 (HTTP) for frontend
- Port 443 (HTTPS) for frontend
- Port 3000 for backend API
- Port 5432 for PostgreSQL (RDS)

## Step 7: Domain and SSL (Optional)

### 1. Route 53 Domain

```bash
# Create hosted zone
aws route53 create-hosted-zone --name yourdomain.com --caller-reference review-scraper-$(date +%s)
```

### 2. ACM SSL Certificate

```bash
# Request SSL certificate
aws acm request-certificate --domain-name yourdomain.com --validation-method DNS
```

## Step 8: Monitoring and Logging

### 1. CloudWatch Logs

```bash
# Create log groups
aws logs create-log-group --log-group-name /aws/elasticbeanstalk/review-scraper-backend
aws logs create-log-group --log-group-name /aws/amplify/review-scraper-frontend
```

### 9: Testing Deployment

### 1. Test backend API

```bash
curl https://your-api-domain.com/api/health
```

### 2. Test frontend

Visit your Amplify URL and verify the application loads correctly.

### 3. Test database connection

```bash
# Connect to RDS
psql -h your-rds-endpoint.amazonaws.com -U postgres -d review_scraper
```

## Troubleshooting

### Database Connection Issues

1. Check security group rules
2. Verify RDS endpoint in environment variables
3. Ensure database is in "available" state
4. Check CloudWatch logs for connection errors

### Backend Deployment Issues

1. Check Elastic Beanstalk logs: `eb logs`
2. Verify environment variables are set correctly
3. Check application health: `eb health`
4. Review build logs in AWS Console

### Frontend Issues

1. Check Amplify build logs
2. Verify API endpoint configuration
3. Check browser console for errors
4. Ensure CORS is properly configured

## Cost Optimization

1. Use t3.micro instances for development
2. Enable auto-scaling only for production
3. Use RDS free tier if eligible
4. Monitor usage with AWS Cost Explorer
5. Set up billing alerts

## Security Best Practices

1. Use AWS Secrets Manager for sensitive data
2. Enable HTTPS with SSL certificates
3. Implement proper IAM roles and policies
4. Regular security audits
5. Keep dependencies updated
6. Use VPC for network isolation
7. Enable AWS CloudTrail for audit logging

## Support

For issues with this deployment:
1. Check AWS CloudWatch logs
2. Review application logs
3. Verify all environment variables
4. Check security group configurations
5. Ensure all AWS services are in the same region

## Next Steps

1. Set up CI/CD pipelines
2. Implement monitoring and alerting
3. Configure backup strategies
4. Set up staging environments
5. Implement proper error handling and logging