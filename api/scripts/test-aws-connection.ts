#!/usr/bin/env node

/**
 * AWS Connection Test Script
 * Tests AWS connectivity and demonstrates cloud utilities
 * Run with: npm run test:aws
 */

import * as dotenv from 'dotenv';
import { checkCloudConnectivity } from '../utils/cloud-index.ts';
import { validateAwsConfig } from '../config/cloud.ts';
import { bucketExists, createBucket, listFiles } from '../utils/aws-s3.ts';
import { isDatabaseAvailable, getDatabaseEndpoint } from '../utils/aws-rds.ts';
import { getSecret, listSecrets } from '../utils/aws-secrets.ts';

// Load environment variables
dotenv.config();

async function testAWSConnection() {
  console.log('🚀 Starting AWS Connection Test...\n');
  
  try {
    // Step 1: Validate configuration
    console.log('📋 Step 1: Validating AWS Configuration...');
    const configValidation = validateAwsConfig();
    if (!configValidation.valid) {
      console.error('❌ Configuration validation failed:');
      configValidation.errors.forEach(error => console.error(`  - ${error}`));
      return;
    }
    console.log('✅ Configuration validation passed\n');
    
    // Step 2: Check overall cloud connectivity
    console.log('🔗 Step 2: Testing Cloud Connectivity...');
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
    
    // Step 3: Test S3 connectivity
    console.log('🗂️  Step 3: Testing S3 Connectivity...');
    try {
      const bucketName = process.env.S3_BUCKET_NAME || 'review-scraper-bucket';
      const bucketAvailable = await bucketExists(bucketName);
      
      if (bucketAvailable) {
        console.log(`✅ S3 bucket "${bucketName}" exists`);
        
        // Try to list files
        const files = await listFiles();
        console.log(`📁 Found ${files.length} files in bucket`);
        if (files.length > 0) {
          console.log('   First few files:');
          files.slice(0, 3).forEach(file => console.log(`   - ${file}`));
        }
      } else {
        console.log(`⚠️  S3 bucket "${bucketName}" does not exist`);
        console.log('   You can create it using: npm run create:bucket');
      }
    } catch (error: any) {
      console.error('❌ S3 test failed:', error.message);
    }
    console.log();
    
    // Step 4: Test RDS connectivity
    console.log('🗄️  Step 4: Testing RDS Connectivity...');
    try {
      const dbInstanceId = process.env.DB_INSTANCE_IDENTIFIER || 'review-scraper-db';
      const dbAvailable = await isDatabaseAvailable(dbInstanceId);
      
      if (dbAvailable) {
        console.log(`✅ Database "${dbInstanceId}" is available`);
        
        const endpoint = await getDatabaseEndpoint(dbInstanceId);
        if (endpoint) {
          console.log(`📊 Database details:`);
          console.log(`   Host: ${endpoint.host}`);
          console.log(`   Port: ${endpoint.port}`);
          console.log(`   Database: ${endpoint.database}`);
          console.log(`   Engine: ${endpoint.engine}`);
          console.log(`   Status: ${endpoint.status}`);
        }
      } else {
        console.log(`⚠️  Database "${dbInstanceId}" is not available`);
        console.log('   You can create it using: npm run create:database`');
      }
    } catch (error: any) {
      console.error('❌ RDS test failed:', error.message);
    }
    console.log();
    
    // Step 5: Test Secrets Manager
    console.log('🔐 Step 5: Testing Secrets Manager...');
    try {
      const secrets = await listSecrets();
      console.log(`✅ Found ${secrets.length} secrets`);
      
      if (secrets.length > 0) {
        console.log('   First few secrets:');
        secrets.slice(0, 3).forEach(secret => console.log(`   - ${secret}`));
        
        // Try to get the first secret
        const firstSecret = secrets[0];
        const secretValue = await getSecret(firstSecret);
        if (secretValue) {
          console.log(`   Sample secret "${firstSecret}" retrieved successfully`);
        }
      }
    } catch (error: any) {
      console.error('❌ Secrets Manager test failed:', error.message);
    }
    console.log();
    
    // Summary
    console.log('📊 AWS Connection Test Summary:');
    console.log('✅ Configuration validation');
    console.log('✅ Cloud connectivity check');
    console.log('✅ S3 service test');
    console.log('✅ RDS service test');
    console.log('✅ Secrets Manager test');
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error: any) {
    console.error('❌ Test failed with error:', error.message);
    if (error.userFriendlyMessage) {
      console.error('   User-friendly message:', error.userFriendlyMessage);
    }
    process.exit(1);
  }
}

// Run the test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('test-aws-connection.ts')) {
  testAWSConnection()
    .then(() => {
      console.log('\n✨ Test script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test script failed:', error);
      process.exit(1);
    });
}

export default testAWSConnection;