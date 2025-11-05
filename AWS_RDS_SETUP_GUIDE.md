# AWS RDS Database Setup Guide - Step by Step

## 🎯 Goal: Create your PostgreSQL database in AWS RDS

Since you haven't set up any AWS database resources yet, this guide will walk you through creating the RDS database manually and getting the connection details.

---

## Step 1: Access AWS Console

1. **Go to AWS Console**: https://console.aws.amazon.com
2. **Sign in** with your AWS account
3. **Make sure you're in the correct region** (top right corner): **US East (N. Virginia) us-east-1**

---

## Step 2: Navigate to RDS Service

1. **Search for "RDS"** in the AWS search bar at the top
2. **Click on "RDS"** under Services
3. **Click "Create database"** (big orange button)

---

## Step 3: Database Creation Configuration

### Choose a database creation method
- ✅ **Standard Create** (gives you full control)

### Engine options
- ✅ **PostgreSQL**
- **Version**: PostgreSQL 15.7-R1 (or latest 15.x version)

### Templates
- ✅ **Free tier** (if available) OR **Dev/Test**

---

## Step 4: Settings Configuration

### DB instance identifier
- **Enter**: `review-scraper-db` (exactly as configured in your .env file)

### Credentials Settings
- **Master username**: `postgres` (exactly as configured)
- **Master password**: 
  - **Create a strong password** (save this!)
  - **Example format**: `ReviewScraper2024!`
  - **Write it down** - you'll need it for GitHub Secrets
- **Confirm password**: Re-enter the same password

---

## Step 5: Instance Configuration

### DB instance class
- ✅ **db.t3.micro** (Free tier eligible)

### Storage
- **Storage type**: General Purpose SSD (gp2)
- **Allocated storage**: 20 GB
- ✅ **Enable storage autoscaling**: Yes (up to 100 GB)

---

## Step 6: Connectivity Configuration

### Virtual private cloud (VPC)
- ✅ **Default VPC** (or create new if you prefer)

### Subnet group
- ✅ **default** (or create new)

### Public access
- ✅ **Yes** (this allows your app to connect from anywhere)

### VPC security group
- ✅ **Create new** (recommended)
- **New VPC security group name**: `review-scraper-sg`

### Availability Zone
- ✅ **No preference**

---

## Step 7: Database Authentication

- ✅ **Password authentication**

---

## Step 8: Additional Configuration

### Initial database name
- **Enter**: `review_scraper` (exactly as configured in your .env file)

### DB parameter group
- ✅ **default.postgres15`

### Backup
- **Backup retention period**: 7 days
- ✅ **Enable encryption**: Yes

---

## Step 9: Create Database

1. **Review all settings** (double-check the names match your .env file)
2. **Click "Create database"** (bottom right)
3. **Wait 5-10 minutes** for creation to complete

---

## Step 10: Get Your Database Connection Details

After the database is created (status shows "Available"):

1. **Click on your database name** (`review-scraper-db`)
2. **Look for "Connectivity & security"** tab
3. **Find the "Endpoint"** - this is your database host
4. **Note the "Port"** (should be 5432)

### Example connection details you'll see:
```
Endpoint: review-scraper-db.xxxxxxxx.us-east-1.rds.amazonaws.com
Port: 5432
Database: review_scraper
Username: postgres
```

---

## Step 11: Update Security Group (IMPORTANT)

1. **Click on the security group** (review-scraper-sg)
2. **Click "Edit inbound rules"**
3. **Add new rule**:
   - **Type**: PostgreSQL
   - **Protocol**: TCP
   - **Port**: 5432
   - **Source**: 0.0.0.0/0 (for now - restrict later for production)
4. **Save rules**

---

## Step 12: Update Your Configuration

### 1. Update your .env file
Replace the placeholder DB password with your actual password:
```
DB_PASSWORD=YourActualPasswordHere
```

### 2. Update GitHub Secrets
Go to your GitHub repository settings and update:

1. **Go to**: https://github.com/superduper19/reviewscraper/settings/secrets/actions
2. **Update these secrets**:
   - `DB_PASSWORD`: Your actual database password
   - `DB_HOST`: Your RDS endpoint (from Step 10)

### 3. Update these GitHub Secrets:
```
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=us-east-1
DB_HOST=review-scraper-db.xxxxxxxx.us-east-1.rds.amazonaws.com
DB_PASSWORD=YourActualPasswordHere
DB_NAME=review_scraper
DB_USER=postgres
DB_PORT=5432
```

---

## Step 13: Test Your Database Connection

Run this command to test connectivity:
```bash
# Install PostgreSQL client (if not installed)
npm install -g pg

# Test connection
node api/scripts/test-aws-connection.js
```

---

## Step 14: Restart Deployment

After updating all secrets:

1. **Go to GitHub Actions**: https://github.com/superduper19/reviewscraper/actions
2. **Re-run the failed workflows** (there should be a "Re-run" button)
3. **Monitor the deployment** - it should now succeed

---

## 🆘 Troubleshooting

### If database creation fails:
- Check AWS service limits in your region
- Ensure you're using the free tier instance type
- Check VPC/security group settings

### If connection fails:
- Verify security group allows PostgreSQL traffic
- Check the endpoint URL is correct
- Ensure password is correctly set in GitHub Secrets

### Need help?
- Check AWS RDS documentation: https://docs.aws.amazon.com/rds/
- Review GitHub Actions logs for specific error messages

---

## ✅ Next Steps

Once your database is created and GitHub Secrets are updated:
1. Re-run the failed GitHub Actions workflows
2. Wait for deployment to complete (15-20 minutes)
3. Access your live application URLs
4. Your Review Sc