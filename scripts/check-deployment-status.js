#!/usr/bin/env node

const { execSync } = require('child_process');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkEnvFile() {
  log('🔍 Checking environment configuration...', colors.blue);
  
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    log('❌ No .env file found', colors.red);
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasAwsKey = envContent.includes('AWS_ACCESS_KEY_ID');
  const hasAwsSecret = envContent.includes('AWS_SECRET_ACCESS_KEY');
  const hasRegion = envContent.includes('AWS_REGION');
  
  if (hasAwsKey && hasAwsSecret && hasRegion) {
    log('✅ AWS credentials found in .env file', colors.green);
    
    // Check if credentials look like placeholders
    if (envContent.includes('your_') || envContent.includes('placeholder')) {
      log('⚠️  Warning: Some credentials appear to be placeholders', colors.yellow);
      return false;
    }
    return true;
  } else {
    log('❌ Missing AWS configuration in .env file', colors.red);
    return false;
  }
}

function checkGitHubActionsWorkflows() {
  log('\n🔍 Checking GitHub Actions workflows...', colors.blue);
  
  const workflowsPath = path.join(__dirname, '..', '.github', 'workflows');
  if (!fs.existsSync(workflowsPath)) {
    log('❌ No GitHub Actions workflows found', colors.red);
    return false;
  }
  
  const workflows = fs.readdirSync(workflowsPath);
  if (workflows.length === 0) {
    log('❌ No workflow files found', colors.red);
    return false;
  }
  
  log(`✅ Found ${workflows.length} workflow(s):`, colors.green);
  workflows.forEach(file => {
    log(`  - ${file}`, colors.cyan);
  });
  
  return true;
}

function checkLocalBuild() {
  log('\n🔍 Checking local build capability...', colors.blue);
  
  try {
    // Check if package.json exists
    const packagePath = path.join(__dirname, '..', 'package.json');
    if (!fs.existsSync(packagePath)) {
      log('❌ No package.json found', colors.red);
      return false;
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    log(`✅ Found package.json: ${packageJson.name}`, colors.green);
    
    // Check if build script exists
    if (packageJson.scripts && packageJson.scripts.build) {
      log('✅ Build script available', colors.green);
    } else {
      log('⚠️  No build script found', colors.yellow);
    }
    
    return true;
  } catch (error) {
    log(`❌ Error checking package.json: ${error.message}`, colors.red);
    return false;
  }
}

function checkAWSCLI() {
  log('\n🔍 Checking AWS CLI availability...', colors.blue);
  
  try {
    execSync('aws --version', { stdio: 'ignore' });
    log('✅ AWS CLI is available', colors.green);
    return true;
  } catch (error) {
    log('❌ AWS CLI not found', colors.red);
    log('   Install AWS CLI: https://aws.amazon.com/cli/', colors.cyan);
    return false;
  }
}

function checkGitHubCLI() {
  log('\n🔍 Checking GitHub CLI availability...', colors.blue);
  
  try {
    execSync('gh --version', { stdio: 'ignore' });
    log('✅ GitHub CLI is available', colors.green);
    return true;
  } catch (error) {
    log('❌ GitHub CLI not found', colors.red);
    log('   Install GitHub CLI: https://cli.github.com/', colors.cyan);
    return false;
  }
}

function provideDeploymentInstructions() {
  log('\n📋 Deployment Instructions:', colors.blue);
  log('1. Ensure you have valid AWS credentials', colors.cyan);
  log('2. Configure GitHub Secrets in your repository settings', colors.cyan);
  log('3. Push code to trigger GitHub Actions workflows', colors.cyan);
  log('4. Monitor deployment progress at:', colors.cyan);
  log('   https://github.com/superduper19/reviewscraper/actions', colors.cyan);
  
  log('\n🔧 Required GitHub Secrets:', colors.yellow);
  log('   - AWS_ACCESS_KEY_ID', colors.cyan);
  log('   - AWS_SECRET_ACCESS_KEY', colors.cyan);
  log('   - AWS_REGION (us-east-1)', colors.cyan);
  log('   - DB_PASSWORD', colors.cyan);
  log('   - VITE_API_URL', colors.cyan);
  log('   - VITE_JWT_SECRET', colors.cyan);
}

function main() {
  log('🚀 Review Scraper Deployment Status Checker', colors.bright);
  log('=' .repeat(50), colors.bright);
  
  const hasEnv = checkEnvFile();
  const hasWorkflows = checkGitHubActionsWorkflows();
  const hasBuild = checkLocalBuild();
  const hasAWSCLI = checkAWSCLI();
  const hasGitHubCLI = checkGitHubCLI();
  
  log('\n' + '='.repeat(50), colors.bright);
  
  if (hasEnv && hasWorkflows && hasBuild) {
    log('✅ Application is ready for deployment!', colors.green);
    log('   Next step: Push to GitHub to trigger workflows', colors.cyan);
  } else {
    log('⚠️  Application needs configuration before deployment', colors.yellow);
    provideDeploymentInstructions();
  }
  
  if (!hasAWSCLI || !hasGitHubCLI) {
    log('\n📦 Install missing tools:', colors.yellow);
    if (!hasAWSCLI) log('   npm install -g aws-cli', colors.cyan);
    if (!hasGitHubCLI) log('   npm install -g gh', colors.cyan);
  }
  
  log('\n🌐 Repository:', colors.bright);
  log('   https://github.com/superduper19/reviewscraper', colors.cyan);
}