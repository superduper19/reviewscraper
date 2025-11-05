# GitHub CI/CD Setup for Review Scraper

This document explains the GitHub Actions workflows and CI/CD setup for the Review Scraper application.

## 🚀 Quick Start

1. **Fork this repository** or clone it to your GitHub account
2. **Set up AWS credentials** in GitHub Secrets (see below)
3. **Configure deployment environments** in GitHub Settings
4. **Push to main branch** to trigger production deployment

## 🔧 Required GitHub Secrets

Add these secrets to your repository settings (`Settings > Secrets and variables > Actions`):

### AWS Configuration
- `AWS_ACCESS_KEY_ID` - Your AWS access key
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret key
- `AWS_REGION` - AWS region (default: us-east-1)

### Application Secrets
- `DB_PASSWORD` - Database password for RDS
- `VITE_API_URL` - Backend API URL
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_JWT_SECRET` - JWT secret for authentication
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (if using payments)

## 🔄 Workflow Overview

### Frontend Deployment (`frontend-deploy.yml`)
- Triggers on push to `main` and `develop` branches
- Builds and tests the React frontend
- Deploys to AWS Amplify
- Creates preview URLs for pull requests

### Backend Deployment (`backend-deploy.yml`)
- Triggers on changes to `api/**`, `.ebextensions/**`, or package files
- Builds and tests the Express.js backend
- Deploys to AWS Elastic Beanstalk
- Manages database password in AWS Secrets Manager
- Supports both development and production environments

### Database Migration (`database-migrate.yml`)
- Triggers on changes to database models or migration files
- Runs database migrations safely
- Creates backups before production migrations
- Supports both manual and automatic triggers

### CI/CD Pipeline (`ci-cd.yml`)
- Comprehensive pipeline that orchestrates all deployments
- Runs security scanning and code quality checks
- Manages branch-based deployments
- Creates deployment notifications

## 🌿 Branch Strategy

### Main Branches
- `main` - Production environment
- `develop` - Development environment

### Feature Branches
- `feature/*` - New features
- `hotfix/*` - Critical bug fixes

## 🌍 Environments

### Development Environment
- **Frontend**: Amplify branch deployment
- **Backend**: Elastic Beanstalk development environment
- **Database**: Development RDS instance

### Production Environment
- **Frontend**: Amplify production deployment
- **Backend**: Elastic Beanstalk production environment
- **Database**: Production RDS instance with automated backups

## 📊 Monitoring and Alerts

### CloudWatch Integration
- Application logs are automatically sent to CloudWatch
- Set up alarms for error rates and performance metrics
- Monitor deployment success/failure rates

### GitHub Notifications
- Deployment status comments on pull requests
- Success/failure notifications in commit history
- Environment-specific deployment confirmations

## 🔒 Security Features

### Code Security
- Automated dependency vulnerability scanning
- Secret detection in code commits
- Branch protection rules for main branches

### Infrastructure Security
- Database passwords stored in AWS Secrets Manager
- Encrypted connections to all services
- IAM roles with minimal required permissions

## 🚀 Deployment Process

### For Development
1. Create a feature branch from `develop`
2. Make your changes and commit
3. Push to GitHub
4. Automatic deployment to development environment
5. Preview URL will be posted in the pull request

### For Production
1. Merge feature branch to `develop` first
2. Test in development environment
3. Create pull request to `main`
4. Code review and approval required
5. Automatic deployment to production after merge

## 🛠️ Troubleshooting

### Common Issues

#### Deployment Fails
1. Check GitHub Actions logs for specific errors
2. Verify AWS credentials are correct
3. Check if required secrets are set
4. Review build logs in Amplify/Elastic Beanstalk

#### Database Connection Issues
1. Verify RDS instance is running
2. Check security group rules
3. Confirm database password in Secrets Manager
4. Review connection string format

#### Build Failures
1. Check Node.js version compatibility
2. Verify all dependencies are installed
3. Review build scripts in package.json
4. Check for environment variable issues

### Getting Help
- Check the [AWS Deployment Guide](../AWS_DEPLOYMENT_GUIDE.md)
- Review the [Deployment Summary](../DEPLOYMENT_SUMMARY.md)
- Check GitHub Actions logs for detailed error messages
- Ensure all required secrets are properly configured

## 📋 Pre-deployment Checklist

Before deploying to production:
- [ ] All tests pass
- [ ] Security scan completed
- [ ] Database backup created
- [ ] Environment variables set
- [ ] AWS credentials configured
- [ ] Code review completed
- [ ] Performance tested
- [ ] Monitoring configured

## 🔧 Manual Deployment (Optional)

If you need to deploy manually:

```bash
# Windows
./deploy.bat

# Linux/Mac
./deploy.sh
```

See the main [README.md](../README.md) for detailed deployment instructions.