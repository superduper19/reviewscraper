#!/usr/bin/env node

/**
 * Create S3 Bucket Script
 * Creates an S3 bucket for the review scraper project
 * Run with: npm run create:bucket
 */

import * as dotenv from 'dotenv';
import { createBucket, bucketExists } from '../utils/aws-s3';
import { validateAwsConfig } from '../config/cloud';

// Load environment variables
dotenv.config();

async function createS3Bucket() {
  console.log('🗂️  Creating S3 Bucket for Review Scraper');
  console.log('========================================\n');
  
  try {
    // Validate configuration
    console.log('📋 Validating AWS Configuration...');
    const configValidation = validateAwsConfig();
    if (!configValidation.valid) {
      console.error('❌ Configuration validation failed:');
      configValidation.errors.forEach(error => console.error(`  - ${error}`));
      return;
    }
    console.log('✅ Configuration validation passed\n');
    
    // Get bucket name from environment or use default
    const bucketName = process.env.AWS_S3_BUCKET_NAME || 'review-scraper-dev-bucket';
    console.log(`🎯 Target bucket: ${bucketName}`);
    
    // Check if bucket already exists
    console.log('🔍 Checking if bucket already exists...');
    const exists = await bucketExists(bucketName);
    
    if (exists) {
      console.log(`✅ Bucket "${bucketName}" already exists`);
      console.log('ℹ️  No action needed');
      return;
    }
    
    console.log(`🚀 Creating bucket "${bucketName}"...`);
    const success = await createBucket(bucketName);
    
    if (success) {
      console.log(`✅ Bucket "${bucketName}" created successfully!`);
      console.log('\n📊 Bucket Details:');
      console.log(`   Name: ${bucketName}`);
      console.log(`   Region: ${process.env.AWS_REGION || 'us-east-1'}`);
      console.log(`   URL: https://s3.console.aws.amazon.com/s3/buckets/${bucketName}`);
      
      console.log('\n💡 Next Steps:');
      console.log('   - Configure your application to use this bucket');
      console.log('   - Set up appropriate bucket policies and permissions');
      console.log('   - Consider enabling versioning for data protection');
      console.log('   - Set up lifecycle policies for cost optimization');
      
    } else {
      console.error(`❌ Failed to create bucket "${bucketName}"`);
      console.log('💡 Troubleshooting:');
      console.log('   - Check your AWS credentials and permissions');
      console.log('   - Ensure the bucket name is globally unique');
      console.log('   - Verify your AWS region settings');
      console.log('   - Check AWS service health status');
    }
    
  } catch (error: any) {
    console.error('❌ Bucket creation failed:', error.message);
    if (error.userFriendlyMessage) {
      console.error('   User-friendly message:', error.userFriendlyMessage);
    }
    console.log('\n💡 Common Issues:');
    console.log('   - Bucket names must be globally unique across all AWS accounts');
    console.log('   - You need appropriate IAM permissions (s3:CreateBucket)');
    console.log('   - Some bucket names may be reserved or restricted');
    console.log('   - Check your AWS service limits');
    process.exit(1);
  }
}

// Run the bucket creation
if (require.main === module) {
  createS3Bucket()
    .then(() => {
      console.log('\n✨ Bucket creation script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Bucket creation script failed:', error);