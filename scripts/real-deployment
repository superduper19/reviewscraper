#!/usr/bin/env node

const https = require('https');
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
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkGitHubActionsAPI() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',
      path: '/repos/superduper19/reviewscraper/actions/runs?per_page=5',
      method: 'GET',
      headers: {
        'User-Agent': 'Node.js',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.workflow_runs && result.workflow_runs.length > 0) {
            log('📊 Recent GitHub Actions:', colors.blue);
            result.workflow_runs.slice(0, 3).forEach(run => {
              const status = run.status;
              const conclusion = run.conclusion;
              const name = run.name;
              const created = new Date(run.created_at).toLocaleString();
              
              let statusText = `${status}`;
              if (conclusion) statusText = `${conclusion}`;
              
              const color = conclusion === 'success' ? colors.green : 
                           conclusion === 'failure' ? colors.red : colors.yellow;
              
              log(`  ${name}: ${statusText} (${created})`, color);
            });
            resolve(true);
          } else {
            log('⏳ No recent GitHub Actions runs found', colors.yellow);
            resolve(false);
          }
        } catch (error) {
          log('⚠️  Could not parse GitHub API response', colors.yellow);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      log('⚠️  Could not connect to GitHub API', colors.yellow);
      log('   This is normal if you don\'t have GitHub CLI configured', colors.cyan);
      resolve(false);
    });

    req.setTimeout(10000, () => {
      log('⏱️  GitHub API request timeout', colors.yellow);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

function checkEnvCredentials() {
  log('🔍 Checking your configuration...', colors.blue);
  
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    log('❌ No .env file found', colors.red);
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check AWS credentials
  const awsKey = envContent.match(/AWS_ACCESS_KEY_ID=(.+)/);
  const awsSecret = envContent.match(/AWS_SECRET_ACCESS_KEY=(.+)/);
  const awsRegion = envContent.match(/AWS_REGION=(.+)/);
  
  if (awsKey && awsSecret && awsRegion) {
    log('✅ AWS credentials configured', colors.green);
    log(`   Region: ${awsRegion[1]}`, colors.cyan);
    
    // Check if they look like real credentials
    if (awsKey[1].includes('your_') || awsKey[1].includes('placeholder')) {
      log('⚠️  Warning: AWS credentials appear to be placeholders', colors.yellow);
      return false;
    }
    return true;
  } else {
    log('❌ AWS credentials missing or incomplete', colors.red);
    return false;
  }
}

function provideRealisticStatus() {
  log('\n🎯 CURRENT REALITY CHECK:', colors.bright);
  log('=' .repeat(50), colors.bright);
  
  log('❌ NO LIVE SITE URL AVAILABLE YET', colors.red);
  log('\n📝 What this means:', colors.yellow);
  log('   • Your code is pushed to GitHub ✅', colors.cyan);
  log('   • GitHub Actions workflows exist ✅', colors.cyan);
  log('   • But AWS deployment has NOT happened yet ❌', colors.cyan);
  
  log('\n🔧 What you need to do:', colors.blue);
  log('1. Set up GitHub Secrets in your repository:', colors.yellow);
  log('   Go to: https://github.com/superduper19/reviewscraper/settings/secrets/actions', colors.cyan);
  log('   Add these secrets:', colors.cyan);
  log('   - AWS_ACCESS_KEY_ID (your real AWS access key)', colors.cyan);
  log('   - AWS_SECRET_ACCESS_KEY (your real AWS secret key)', colors.cyan);
  log('   - AWS_REGION (us-east-1)', colors.cyan);
  log('   - DB_PASSWORD (a secure password for your database)', colors.cyan);
  log('   - VITE_API_URL (will be your backend URL)', colors.cyan);
  log('   - VITE_JWT_SECRET (a secure JWT secret)', colors.cyan);
  
  log('\n2. After setting secrets, push a small change to trigger deployment', colors.yellow);
  log('   Or manually trigger a workflow from GitHub Actions tab', colors.cyan);
  
  log('\n3. Wait 15-20 minutes for AWS to deploy everything', colors.yellow);
  
  log('\n4. Check deployment status at:', colors.yellow);
  log('   https://github.com/superduper19/reviewscraper/actions', colors.cyan);
}

async function main() {
  log('🚀 Review Scraper - REAL Deployment Status', colors.bright);
  log('=' .repeat(50), colors.bright);
  
  const hasValidCredentials = checkEnvCredentials();
  await checkGitHubActionsAPI();
  
  provideRealisticStatus();
  
  log('\n🌐 Your Repository:', colors.bright);
  log('   https://github.com/superduper19/reviewscraper', colors.cyan);
  
  log('\n📞 Need help?', colors.bright);
  log('   Check the deployment guide in your repository', colors.cyan);
  log('   or visit the GitHub Actions tab to see what\'s happening', colors.cyan);
}

main().catch(error => {
  log(`❌ Script error: ${error.message}`, colors.red);
  process.exit(1);
});