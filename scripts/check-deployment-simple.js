#!/usr/bin/env node

const { execSync } = require('child_process');
const https = require('https');

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

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, options = {}) {
  try {
    return execSync(command, { encoding: 'utf8', ...options }).trim();
  } catch (error) {
    log(`Command failed: ${command}`, 'red');
    return null;
  }
}

function checkGitStatus() {
  log('🔍 Checking Git repository status...', 'cyan');
  
  try {
    const lastCommit = runCommand('git log -1 --oneline');
    const currentBranch = runCommand('git branch --show-current');
    const remoteUrl = runCommand('git config --get remote.origin.url');
    
    log(`📍 Repository: ${remoteUrl || 'Not found'}`, 'blue');
    log(`🌿 Branch: ${currentBranch || 'Not found'}`, 'blue');
    log(`📝 Last commit: ${lastCommit || 'Not found'}`, 'blue');
    
    return { lastCommit, currentBranch, remoteUrl };
  } catch (error) {
    log('❌ Error checking git status', 'red');
    return null;
  }
}

function checkAWSResources() {
  log('🔍 Checking AWS resources...', 'cyan');
  
  const resources = {
    amplify: null,
    elasticbeanstalk: null,
    s3: null,
    rds: null
  };
  
  try {
    // Check Amplify apps
    const amplifyOutput = runCommand('aws amplify list-apps --query "apps[?name==`review-scraper-frontend`].{name:name,defaultDomain:defaultDomain,platform:platform,createTime:createTime}" --output json');
    if (amplifyOutput) {
      const amplifyApps = JSON.parse(amplifyOutput);
      if (amplifyApps.length > 0) {
        resources.amplify = amplifyApps[0];
        log(`✅ Amplify app found: ${amplifyApps[0].name}`, 'green');
        log(`   Domain: https://${amplifyApps[0].defaultDomain}`, 'cyan');
      } else {
        log('⏳ Amplify app not found (may still be deploying)', 'yellow');
      }
    }
    
    // Check Elastic Beanstalk environments
    const ebOutput = runCommand('aws elasticbeanstalk describe-environments --application-name review-scraper-backend --query "Environments[?Status!=`Terminated`].{EnvironmentName:EnvironmentName,EnvironmentId:EnvironmentId,Status:Status,Health:Health,CNAME:CNAME}" --output json');
    if (ebOutput) {
      const ebEnvironments = JSON.parse(ebOutput);
      if (ebEnvironments.length > 0) {
        resources.elasticbeanstalk = ebEnvironments[0];
        log(`✅ Elastic Beanstalk environment found: ${ebEnvironments[0].EnvironmentName}`, 'green');
        log(`   Status: ${ebEnvironments[0].Status} | Health: ${ebEnvironments[0].Health}`, 'cyan');
        if (ebEnvironments[0].CNAME) {
          log(`   URL: http://${ebEnvironments[0].CNAME}`, 'cyan');
        }
      } else {
        log('⏳ Elastic Beanstalk environment not found (may still be deploying)', 'yellow');
      }
    }
    
    // Check S3 bucket
    const s3Output = runCommand('aws s3api list-buckets --query "Buckets[?Name==`review-scraper-files`].Name" --output json');
    if (s3Output) {
      const buckets = JSON.parse(s3Output);
      if (buckets.length > 0) {
        resources.s3 = buckets[0];
        log(`✅ S3 bucket found: ${buckets[0]}`, 'green');
      } else {
        log('⏳ S3 bucket not found', 'yellow');
      }
    }
    
    // Check RDS instance
    const rdsOutput = runCommand('aws rds describe-db-instances --db-instance-identifier review-scraper-db --query "DBInstances[?DBInstanceStatus!=`deleting`].{DBInstanceIdentifier:DBInstanceIdentifier,DBInstanceStatus:DBInstanceStatus,Endpoint:Endpoint}" --output json');
    if (rdsOutput) {
      const instances = JSON.parse(rdsOutput);
      if (instances.length > 0) {
        resources.rds = instances[0];
        log(`✅ RDS instance found: ${instances[0].DBInstanceIdentifier}`, 'green');
        log(`   Status: ${instances[0].DBInstanceStatus}`, 'cyan');
        if (instances[0].Endpoint) {
          log(`   Endpoint: ${instances[0].Endpoint.Address}:${instances[0].Endpoint.Port}`, 'cyan');
        }
      } else {
        log('⏳ RDS instance not found', 'yellow');
      }
    }
    
  } catch (error) {
    log(`❌ Error checking AWS resources: ${error.message}`, 'red');
  }
  
  return resources;
}

function checkSecretsManager() {
  log('🔍 Checking AWS Secrets Manager...', 'cyan');
  
  try {
    const secretOutput = runCommand('aws secretsmanager describe-secret --secret-id review-scraper-db-password --query "{Name:Name,LastChangedDate:LastChangedDate}" --output json');
    if (secretOutput) {
      const secret = JSON.parse(secretOutput);
      log(`✅ Secret found: ${secret.Name}`, 'green');
      log(`   Last changed: ${new Date(secret.LastChangedDate * 1000).toLocaleString()}`, 'cyan');
      return secret;
    } else {
      log('⏳ Database secret not found', 'yellow');
      return null;
    }
  } catch (error) {
    log(`❌ Error checking Secrets Manager: ${error.message}`, 'red');
    return null;
  }
}

function testApplicationURLs(resources) {
  log('🌐 Testing application URLs...', 'cyan');
  
  const urls = {
    frontend: resources.amplify ? `https://${resources.amplify.defaultDomain}` : null,
    backend: resources.elasticbeanstalk ? `http://${resources.elasticbeanstalk.CNAME}` : null
  };
  
  log('\n📍 Application URLs:', 'bright');
  log('=' .repeat(30), 'bright');
  
  if (urls.frontend) {
    log(`🚀 Frontend: ${urls.frontend}`, 'green');
    // Test frontend
    https.get(urls.frontend, (res) => {
      if (res.statusCode === 200) {
        log(`   ✅ Frontend is responding (Status: ${res.statusCode})`, 'green');
      } else {
        log(`   ⚠️  Frontend returned status: ${res.statusCode}`, 'yellow');
      }
    }).on('error', (err) => {
      log(`   ❌ Frontend test failed: ${err.message}`, 'red');
    });
  } else {
    log('⏳ Frontend URL: Not available yet', 'yellow');
  }
  
  if (urls.backend) {
    log(`🔧 Backend API: ${urls.backend}`, 'green');
    // Test backend health
    https.get(`${urls.backend}/health`, (res) => {
      if (res.statusCode === 200) {
        log(`   ✅ Backend health check passed (Status: ${res.statusCode})`, 'green');
      } else {
        log(`   ⚠️  Backend health check returned status: ${res.statusCode}`, 'yellow');
      }
    }).on('error', (err) => {
      log(`   ⚠️  Backend health check failed: ${err.message}`, 'yellow');
      // Try root endpoint
      https.get(urls.backend, (res) => {
        log(`   ✅ Backend root endpoint responding (Status: ${res.statusCode})`, 'green');
      }).on('error', () => {
        log(`   ❌ Backend is not responding`, 'red');
      });
    });
  } else {
    log('⏳ Backend URL: Not available yet', 'yellow');
  }
  
  return urls;
}

function displaySummary(gitStatus, resources, urls) {
  log('\n📊 Deployment Summary:', 'bright');
  log('=' .repeat(50), 'bright');
  
  const allResourcesReady = resources.amplify && resources.elasticbeanstalk && resources.s3 && resources.rds;
  
  if (allResourcesReady && urls.frontend && urls.backend) {
    log('🎉 DEPLOYMENT SUCCESSFUL!', 'green');
    log('✅ All AWS resources are deployed and ready', 'green');
    log('✅ Application URLs are available', 'green');
  } else if (resources.amplify || resources.elasticbeanstalk) {
    log('⏳ DEPLOYMENT IN PROGRESS', 'yellow');
    log('⚠️  Some resources are still being deployed', 'yellow');
  } else {
    log('❌ NO DEPLOYMENT FOUND', 'red');
    log('⚠️  No AWS resources detected', 'yellow');
  }
  
  log('\n📋 Resource Status:', 'bright');
  log(`   Frontend (Amplify): ${resources.amplify ? '✅ Ready' : '⏳ Not found'}`, resources.amplify ? 'green' : 'yellow');
  log(`   Backend (Elastic Beanstalk): ${resources.elasticbeanstalk ? '✅ Ready' : '⏳ Not found'}`, resources.elasticbeanstalk ? 'green' : 'yellow');
  log(`   File Storage (S3): ${resources.s3 ? '✅ Ready' : '⏳ Not found'}`, resources.s3 ? 'green' : 'yellow');
  log(`   Database (RDS): ${resources.rds ? '✅ Ready' : '⏳ Not found'}`, resources.rds ? 'green' : 'yellow');
  log(`   Secrets Manager: ${checkSecretsManager() ? '✅ Ready' : '⏳ Not found'}`, checkSecretsManager() ? 'green' : 'yellow');
  
  log('\n🌐 URLs:', 'bright');
  if (urls.frontend) {
    log(`   Frontend: ${urls.frontend}`, 'cyan');
  }
  if (urls.backend) {
    log(`   Backend: ${urls.backend}`, 'cyan');
  }
  
  log('\n🔧 Next Steps:', 'bright');
  if (!allResourcesReady) {
    log('1. ⏳ Wait for deployment to complete', 'cyan');
    log('2. 🔍 Check GitHub Actions for deployment status:', 'cyan');
    if (gitStatus?.remoteUrl) {
      log(`   ${gitStatus.remoteUrl}/actions`, 'blue');
    }
    log('3. 🔄 Run this script again in 5-10 minutes', 'cyan');
  } else {
    log('1. 🌐 Visit your frontend application', 'cyan');
    log('2. 🔧 Test the backend API endpoints', 'cyan');
    log('3. 📊 Check application logs in AWS CloudWatch', 'cyan');
    log('4. 🚀 Your Review Scraper is ready to use!', 'green');
  }
}

async function checkDeploymentStatus() {
  log('🚀 Review Scraper Deployment Status Checker', 'bright');
  log('=' .repeat(50), 'bright');
  
  // Check git status
  const gitStatus = checkGitStatus();
  
  // Check AWS resources
  const resources = checkAWSResources();
  
  // Get URLs and test them
  const urls = testApplicationURLs(resources);
  
  // Display summary
  displaySummary(gitStatus, resources, urls);
  
  return { gitStatus, resources, urls };
}

// Run the deployment checker
if (require.main === module) {
  checkDeploymentStatus().catch(error => {
    log(`❌ Fatal error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { checkDeploymentStatus, checkAWSResources };