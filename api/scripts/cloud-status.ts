#!/usr/bin/env node

/**
 * Cloud Status Script
 * Quick overview of cloud service status
 * Run with: npm run cloud:status
 */

import * as dotenv from 'dotenv';
import { checkCloudConnectivity } from '../utils/cloud-index';
import { validateAwsConfig } from '../config/cloud';
import { getDatabaseEndpoint } from '../utils/aws-rds';
import { listSecrets } from '../utils/aws-secrets';
import { listFiles } from '../utils/aws-s3';

// Load environment variables
dotenv.config();

async function showCloudStatus() {
  console.log('☁️  Cloud Services Status Report');
  console.log('=====================================\n');
  
  try {
    // Configuration Status
    console.log('📋 Configuration Status:');
    const configValidation = validateAwsConfig();
    if (configValidation.valid) {
      console.log('✅ AWS Configuration: Valid');
    } else {
      console.log('❌ AWS Configuration: Invalid');
      configValidation.errors.forEach(error => console.log(`   - ${error}`));
    }
    console.log();
    
    // Service Connectivity
    console.log('🔗 Service Connectivity:');
    const connectivityStatus = await checkCloudConnectivity();
    connectivityStatus.forEach(status => {
      const statusIcon = status.status === 'connected' ? '✅' : 
                        status.status === 'error' ? '❌' : '⚠️';
      console.log(`${statusIcon} ${status.service}: ${status.status}`);
      if (status.message) {
        console.log(`   ${status.message}`);
      }
    });
    console.log();
    
    // AWS Resources Summary
    console.log('📊 AWS Resources Summary:');
    
    // S3 Bucket
    try {
      const bucketName = process.env.S3_BUCKET_NAME || 'review-scraper-bucket';
      const files = await listFiles();
      console.log(`🗂️  S3 Bucket "${bucketName}": ${files.length} objects`);
    } catch (error) {
      console.log('⚠️  S3: Unable to access bucket');
    }
    
    // RDS Database
    try {
      const dbInstanceId = process.env.AWS_DB_INSTANCE_IDENTIFIER || 'review-scraper-db';
      const endpoint = await getDatabaseEndpoint(dbInstanceId);
      if (endpoint) {
        console.log(`🗄️  RDS Database "${dbInstanceId}": ${endpoint.status}`);
        console.log(`   Host: ${endpoint.host}:${endpoint.port}`);
      } else {
        console.log(`⚠️  RDS Database "${dbInstanceId}": Not found`);
      }
    } catch (error) {
      console.log('⚠️  RDS: Unable to access database');
    }
    
    // Secrets Manager
    try {
      const secrets = await listSecrets();
      console.log(`🔐 Secrets Manager: ${secrets.length} secrets`);
      if (secrets.length > 0) {
        secrets.slice(0, 3).forEach(secret => console.log(`   - ${secret}`));
        if (secrets.length > 3) {
          console.log(`   ... and ${secrets.length - 3} more`);
        }
      }
    } catch (error) {
      console.log('⚠️  Secrets Manager: Unable to access secrets');
    }
    
    console.log('\n✨ Status check completed!');
    
  } catch (error: any) {
    console.error('❌ Status check failed:', error.message);
    process.exit(1);
  }
}

// Run the status check
// Fix for Windows path issues with import.meta.url
const isMainModule = import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` ||
                      import.meta.url === `file://${process.argv[1]}` ||
                      process.argv[1].includes('cloud-status.ts');

if (isMainModule) {
  showCloudStatus()
    .then(() => {
      console.log('\n✨ Status check completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Status check failed:', error);
      process.exit(1);
    });
}

export default showCloudStatus;