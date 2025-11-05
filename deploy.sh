#!/bin/bash

# AWS Deployment Script for Review Scraper
# This script automates the deployment process

set -e

echo "🚀 Review Scraper AWS Deployment Script"
echo "======================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if AWS CLI is installed
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        echo "Visit: https://aws.amazon.com/cli/"
        exit 1
    fi
    print_status "AWS CLI is installed"
}

# Check if AWS CLI is configured
check_aws_config() {
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS CLI is not configured. Please run: aws configure"
        exit 1
    fi
    print_status "AWS CLI is configured"
}

# Check if Node.js is installed
check_nodejs() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 22+"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)
    
    if [ "$MAJOR_VERSION" -lt 22 ]; then
        print_error "Node.js version 22+ is required. Current version: $NODE_VERSION"
        exit 1
    fi
    
    print_status "Node.js $NODE_VERSION is installed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm install
    print_status "Dependencies installed successfully"
}

# Build the application
build_application() {
    print_status "Building application..."
    npm run build
    print_status "Application built successfully"
}

# Deploy backend to Elastic Beanstalk
deploy_backend() {
    print_status "Deploying backend to Elastic Beanstalk..."
    
    # Check if EB CLI is installed
    if ! command -v eb &> /dev/null; then
        print_warning "EB CLI is not installed. Installing..."
        pip install awsebcli
    fi
    
    # Initialize Elastic Beanstalk if not already done
    if [ ! -d ".elasticbeanstalk" ]; then
        print_status "Initializing Elastic Beanstalk..."
        eb init --platform "Node.js 22" --region us-east-1
    fi
    
    # Deploy to Elastic Beanstalk
    eb deploy
    print_status "Backend deployed successfully"
}

# Deploy frontend to Amplify
deploy_frontend() {
    print_status "Deploying frontend to Amplify..."
    
    # Check if Amplify CLI is installed
    if ! command -v amplify &> /dev/null; then
        print_warning "Amplify CLI is not installed. Installing..."
        npm install -g @aws-amplify/cli
    fi
    
    # Initialize Amplify if not already done
    if [ ! -d "amplify" ]; then
        print_status "Initializing Amplify..."
        amplify init
    fi
    
    # Deploy frontend
    amplify publish
    print_status "Frontend deployed successfully"
}

# Setup database password
setup_database_password() {
    print_status "Setting up database password..."
    
    # Check if password is already set in environment
    if [ -z "$DB_PASSWORD" ]; then
        print_warning "DB_PASSWORD environment variable is not set"
        echo "Please enter your database password:"
        read -s DB_PASSWORD
        export DB_PASSWORD
        echo "export DB_PASSWORD=\"$DB_PASSWORD\"" >> ~/.bashrc
    fi
    
    # Store password in AWS Secrets Manager
    if aws secretsmanager describe-secret --secret-id review-scraper-db-password &> /dev/null; then
        print_status "Updating existing secret..."
        aws secretsmanager update-secret --secret-id review-scraper-db-password --secret-string "$DB_PASSWORD"
    else
        print_status "Creating new secret..."
        aws secretsmanager create-secret --name review-scraper-db-password --description "Database password for Review Scraper" --secret-string "$DB_PASSWORD"
    fi
    
    print_status "Database password configured successfully"
}

# Create S3 bucket
create_s3_bucket() {
    print_status "Creating S3 bucket..."
    
    BUCKET_NAME="review-scraper-bucket-$(date +%s)"
    
    if aws s3 mb s3://$BUCKET_NAME 2>/dev/null; then
        print_status "S3 bucket created: $BUCKET_NAME"
        
        # Configure CORS
        cat > s3-cors.json << EOF
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": []
    }
  ]
}
EOF
        
        aws s3api put-bucket-cors --bucket $BUCKET_NAME --cors-configuration file://s3-cors.json
        rm s3-cors.json
        
        # Update environment variable
        echo "S3_BUCKET_NAME=$BUCKET_NAME" >> .env
        print_status "S3 bucket configured successfully"
    else
        print_error "Failed to create S3 bucket"
        exit 1
    fi
}

# Create RDS instance
create_rds_instance() {
    print_status "Creating RDS instance..."
    
    INSTANCE_NAME="review-scraper-db"
    
    # Check if instance already exists
    if aws rds describe-db-instances --db-instance-identifier $INSTANCE_NAME &> /dev/null; then
        print_status "RDS instance already exists: $INSTANCE_NAME"
        return 0
    fi
    
    # Create RDS instance
    aws rds create-db-instance \
        --db-instance-identifier $INSTANCE_NAME \
        --db-instance-class db.t3.micro \
        --engine postgres \
        --master-username postgres \
        --master-user-password "$DB_PASSWORD" \
        --allocated-storage 20 \
        --no-publicly-accessible
    
    print_status "RDS instance created: $INSTANCE_NAME"
    print_status "Waiting for RDS instance to be available... (this may take 5-10 minutes)"
    
    # Wait for RDS to be available
    aws rds wait db-instance-available --db-instance-identifier $INSTANCE_NAME
    
    # Get RDS endpoint
    RDS_ENDPOINT=$(aws rds describe-db-instances --db-instance-identifier $INSTANCE_NAME --query 'DBInstances[0].Endpoint.Address' --output text)
    
    # Update environment variables
    echo "DB_HOST=$RDS_ENDPOINT" >> .env
    echo "RDS_INSTANCE_NAME=$INSTANCE_NAME" >> .env
    
    print_status "RDS instance is ready: $RDS_ENDPOINT"
}

# Main deployment function
main() {
    echo "Starting AWS deployment process..."
    echo ""
    
    # Check prerequisites
    check_aws_cli
    check_aws_config
    check_nodejs
    
    # Setup database password
    setup_database_password
    
    # Create AWS resources
    create_s3_bucket
    create_rds_instance
    
    # Install dependencies and build
    install_dependencies
    build_application
    
    # Deploy applications
    deploy_backend
    deploy_frontend
    
    echo ""
    print_status "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Update your frontend API endpoint configuration"
    echo "2. Test the deployed application"
    echo "3. Set up monitoring and alerts"
    echo "4. Configure SSL certificates for production"
    echo ""
    echo "🔧 Useful Commands:"
    echo "- View backend logs: eb logs"
    echo "- View frontend build: amplify console"
    echo "- Check RDS status: aws rds describe-db-instances --db-instance-identifier review-scraper-db"
    echo "- Check S3 bucket: aws s3 ls"
    echo ""
}

# Handle script interruption
trap 'print_error "Deployment