#!/usr/bin/env node

/**
 * Create RDS Database Script
 * Creates a PostgreSQL database instance for the review scraper project
 * Run with: npm run create:database
 */

import * as dotenv from 'dotenv';
import { createDatabaseInstance, isDatabaseAvailable } from '../utils/aws-rds';
import { storeDatabaseCredentials } from '../utils/aws-secrets';
import { validateAwsConfig, dbConfig } from '../config/cloud';

// Load environment variables
dotenv.config();
console.log('DEBUG: Environment variables loaded');

async function createRDSDatabase() {
  console.log('🗄️  Creating RDS Database for Review Scraper');
  console.log('============================================\n');
  console.log('DEBUG: Script started');
  
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
    
    // Get database configuration
    const dbInstanceId = dbConfig.instanceIdentifier;
    console.log(`🎯 Target database: ${dbInstanceId}`);
    console.log(`📊 Database Configuration:`);
    console.log(`   Engine: ${dbConfig.engine}`);
    console.log(`   Instance Class: ${dbConfig.instanceClass}`);
    console.log(`   Allocated Storage: ${dbConfig.allocatedStorage} GB`);
    console.log(`   Storage Type: ${dbConfig.storageType}`);
    console.log(`   Multi-AZ: ${dbConfig.multiAZ}`);
    console.log(`   Backup Retention: ${dbConfig.backupRetentionPeriod} days`);
    console.log();
    
    // Check if database already exists
    console.log('🔍 Checking if database already exists...');
    const exists = await isDatabaseAvailable(dbInstanceId);
    
    if (exists) {
      console.log(`✅ Database "${dbInstanceId}" already exists and is available`);
      console.log('ℹ️  No action needed');
      
      // Show connection details
      const { getDatabaseEndpoint } = await import('../utils/aws-rds');
      const endpoint = await getDatabaseEndpoint(dbInstanceId);
      if (endpoint) {
        console.log('\n🔗 Connection Details:');
        console.log(`   Host: ${endpoint.host}`);
        console.log(`   Port: ${endpoint.port}`);
        console.log(`   Database: ${endpoint.database}`);
        console.log(`   Username: ${endpoint.username}`);
        console.log(`   Engine: ${endpoint.engine}`);
      }
      return;
    }
    
    console.log(`🚀 Creating database "${dbInstanceId}"...`);
    console.log('⏳ This may take several minutes...');
    console.log();
    
    console.log('🚀 About to call createDatabaseInstance()...');
    const success = await createDatabaseInstance();
    console.log(`✅ createDatabaseInstance() returned: ${success}`);
    
    if (success) {
      console.log(`✅ Database "${dbInstanceId}" created successfully!`);
      
      // Get connection details
      const { getDatabaseEndpoint } = await import('../utils/aws-rds');
      const endpoint = await getDatabaseEndpoint(dbInstanceId);
      
      if (endpoint) {
        console.log('\n🔗 Connection Details:');
        console.log(`   Host: ${endpoint.host}`);
        console.log(`   Port: ${endpoint.port}`);
        console.log(`   Database: ${endpoint.database}`);
        console.log(`   Username: ${endpoint.username}`);
        console.log(`   Engine: ${endpoint.engine}`);
        console.log(`   Status: ${endpoint.status}`);
        
        // Store credentials in Secrets Manager
        console.log('\n🔐 Storing credentials in Secrets Manager...');
        const secretArn = await storeDatabaseCredentials(
          dbInstanceId,
          endpoint.host,
          endpoint.port,
          endpoint.database!,
          endpoint.username!,
          dbConfig.password
        );
        
        if (secretArn) {
          console.log(`✅ Credentials stored securely in Secrets Manager`);
          console.log(`   Secret ARN: ${secretArn}`);
        } else {
          console.log('⚠️  Failed to store credentials in Secrets Manager');
        }
        
        console.log('\n💡 Next Steps:');
        console.log('   - Test your database connection');
        console.log('   - Set up your application database schema');
        console.log('   - Configure database backup policies');
        console.log('   - Monitor database performance');
        console.log('   - Set up connection pooling for production');
        
        console.log('\n🔗 Connection String:');
        const connectionString = `postgresql://${dbConfig.user}:${dbConfig.password}@${endpoint.host}:${endpoint.port}/${endpoint.database}`;
        console.log(`   ${connectionString}`);
        console.log('\n⚠️  Keep your connection string secure and never commit it to version control!');
      }
      
    } else {
      console.error(`❌ Failed to create database "${dbInstanceId}"`);
      console.log('\n💡 Troubleshooting:');
      console.log('   - Check your AWS credentials and permissions');
      console.log('   - Ensure you have RDS permissions (rds:CreateDBInstance)');
      console.log('   - Check AWS service limits for your account');
      console.log('   - Verify your VPC and security group settings');
      console.log('   - Check AWS service health status');
    }
    
  } catch (error: any) {
    console.error('❌ Database creation failed:', error.message);
    if (error.userFriendlyMessage) {
      console.error('   User-friendly message:', error.userFriendlyMessage);
    }
    console.log('\n💡 Common Issues:');
    console.log('   - Ensure your AWS account has RDS permissions');
    console.log('   - Check if you have reached your RDS instance limit');
    console.log('   - Verify your VPC and subnet configurations');
    console.log('   - Ensure your security groups allow necessary traffic');
    console.log('   - Check if the database name is already in use');
    process.exit(1);
  }
}

// Run the database creation
// Fix for Windows path issues with import.meta.url
const isMainModule = import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` ||
                      import.meta.url === `file://${process.argv[1]}` ||
                      process.argv[1].includes('create-rds-database.ts');

if (isMainModule) {
  createRDSDatabase()
    .then(() => {
      console.log('\n✨ Database creation script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Database creation script failed:', error);
      process.exit(1);
    });
} else {
  console.log('DEBUG: Not running main function - imported as module');
}