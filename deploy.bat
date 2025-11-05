@echo off
REM AWS Deployment Script for Review Scraper (Windows)
REM This script automates the deployment process

echo 🚀 Review Scraper AWS Deployment Script
echo =======================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 22+
    exit /b 1
)
echo [INFO] Node.js is installed

REM Check if AWS CLI is installed
aws --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] AWS CLI is not installed. Please install AWS CLI first.
    echo Visit: https://aws.amazon.com/cli/
    exit /b 1
)
echo [INFO] AWS CLI is installed

REM Check if AWS CLI is configured
aws sts get-caller-identity >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] AWS CLI is not configured. Please run: aws configure
    exit /b 1
)
echo [INFO] AWS CLI is configured

REM Install dependencies
echo [INFO] Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)
echo [INFO] Dependencies installed successfully

REM Build application
echo [INFO] Building application...
npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build application
    exit /b 1
)
echo [INFO] Application built successfully

REM Check if DB_PASSWORD is set
if "%DB_PASSWORD%"=="" (
    echo [WARNING] DB_PASSWORD environment variable is not set
    echo Please enter your database password:
    set /p DB_PASSWORD=
    setx DB_PASSWORD "%DB_PASSWORD%"
)

REM Create S3 bucket
echo [INFO] Creating S3 bucket...
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (
    set month=%%a
    set day=%%b
    set year=%%c
)
for /f "tokens=1-2 delims=: " %%a in ('time /t') do (
    set hour=%%a
    set minute=%%b
)
set BUCKET_NAME=review-scraper-bucket-%year%%month%%day%%hour%%minute%

aws s3 mb s3://%BUCKET_NAME%
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create S3 bucket
    exit /b 1
)
echo [INFO] S3 bucket created: %BUCKET_NAME%

REM Store bucket name in environment
echo S3_BUCKET_NAME=%BUCKET_NAME% >> .env

echo.
echo 🎉 Deployment preparation completed!
echo.
echo 📋 Next Steps:
echo 1. Set up AWS Amplify for frontend deployment
echo 2. Set up Elastic Beanstalk for backend deployment
echo 3. Configure RDS database instance
echo 4. Update environment variables
echo.
echo 🔧 Manual Setup Required:
echo 1. Install Amplify CLI: npm install -g @aws-amplify/cli
echo 2. Install EB CLI: pip install awsebcli
echo 3. Run: amplify init (for frontend)
echo 4. Run: eb init (for backend)