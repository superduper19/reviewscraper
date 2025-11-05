#!/usr/bin/env node

/**
 * AWS Deployment Setup Script
 * This script helps configure AWS deployment and database password setup
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

interface DeploymentConfig {
  awsRegion: string;
  dbPassword: string;
  jwtSecret: string;
  s3BucketName: string;
  rdsInstanceName: string;
  environmentName: string;
}

class AWSDepploymentSetup {
  private config: Partial<DeploymentConfig> = {};

  constructor() {
    this.loadExistingConfig();
  }

  private loadExistingConfig(): void {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');
      
      lines.forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          switch (key.trim()) {
            case 'AWS_REGION':
              this.config.awsRegion = value.trim();
              break;
            case 'DB_PASSWORD':
              this.config.dbPassword = value.trim();
              break;
            case 'JWT_SECRET':
              this.config.jwtSecret = value.trim();
              break;
            case 'S3_BUCKET_NAME':
              this.config.s3BucketName = value.trim();
              break;
            case 'RDS_INSTANCE_NAME':
              this.config.rdsInstanceName = value.trim();
              break;
          }
        }
      });
    }
  }

  private async prompt(question: string, defaultValue?: string): Promise<string> {
    return new Promise((resolve) => {
      const promptText = defaultValue ? `${question} (${defaultValue}): ` : `${question}: `;
      rl.question(promptText, (answer) => {
        resolve(answer.trim() || defaultValue || '');
      });
    });
  }

  private async promptSecure(question: string): Promise<string> {
    return new Promise((resolve) => {
      const stdin = process.stdin;
      const wasRaw = stdin.isRaw;
      
      if (stdin.isTTY) {
        stdin.setRawMode(true);
      }
      
      process.stdout.write(`${question}: `);
      
      let password = '';
      
      stdin.on('data', (char) => {
        char = char.toString();
        
        switch (char) {
          case '\n':
          case '\r':
          case '\u0004': // Ctrl+D
            if (stdin.isTTY) {
              stdin.setRawMode(wasRaw);
            }
            process.stdout.write('\n');
            stdin.pause();
            resolve(password);
            break;
          case '\u0003': // Ctrl+C
            if (stdin.isTTY) {
              stdin.setRawMode(wasRaw);
            }
            process.stdout.write('\n');
            process.exit(0);
            break;
          case '\u007f': // Backspace
            if (password.length > 0) {
              password = password.slice(0, -1);
              process.stdout.write('\b \b');
            }
            break;
          default:
            password += char;
            process.stdout.write('*');
            break;
        }
      });
      
      stdin.resume();
    });
  }

  private generateSecurePassword(length: number = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  private generateJWTSecret(): string {
    return require('crypto').randomBytes(64).toString('hex');
  }

  private async checkAWSCLI(): Promise<boolean> {
    try {
      execSync('aws --version', { stdio: 'ignore' });
      return true;
    } catch (error) {
      return false;
    }
  }

  private async checkAWSConfig(): Promise<boolean> {
    try {
      execSync('aws sts get-caller-identity', { stdio: 'ignore' });
      return true;
    } catch (error) {
      return false;
    }
  }

  private async createSecretsManagerSecret(secretName: string, secretValue: string): Promise<void> {
    try {
      console.log(`Creating secret: ${secretName}`);
      execSync(`aws secretsmanager create-secret --name "${secretName}" --description "Database password for Review Scraper" --secret-string "${secretValue}" --region ${this.config.awsRegion}`, { stdio: 'inherit' });
      console.log(`✅ Secret created successfully: ${secretName}`);
    } catch (error) {
      console.error(`❌ Failed to create secret: ${error.message}`);
      throw error;
    }
  }

  private async updateSecretsManagerSecret(secretName: string, secretValue: string): Promise<void> {
    try {
      console.log(`Updating secret: ${secretName}`);
      execSync(`aws secretsmanager update-secret --secret-id "${secretName}" --secret-string "${secretValue}" --region ${this.config.awsRegion}`, { stdio: 'inherit' });
      console.log(`✅ Secret updated successfully: ${secretName}`);
    } catch (error) {
      console.error(`❌ Failed to update secret: ${error.message}`);
      throw error;
    }
  }

  private async createS3Bucket(bucketName: string): Promise<void> {
    try {
      console.log(`Creating S3 bucket: ${bucketName}`);
      execSync(`aws s3 mb s3://${bucketName} --region ${this.config.awsRegion}`, { stdio: 'inherit' });
      console.log(`✅ S3 bucket created successfully: ${bucketName}`);
    } catch (error) {
      console.error(`❌ Failed to create S3 bucket: ${error.message}`);
      throw error;
    }
  }

  private async createRDSInstance(instanceName: string, dbPassword: string): Promise<void> {
    try {
      console.log(`Creating RDS instance: ${instanceName}`);
      execSync(`aws rds create-db-instance \
        --db-instance-identifier ${instanceName} \
        --db-instance-class db.t3.micro \
        --engine postgres \
        --master-username postgres \
        --master-user-password ${dbPassword} \
        --allocated-storage 20 \
        --no-publicly-accessible \
        --region ${this.config.awsRegion}`, { stdio: 'inherit' });
      console.log(`✅ RDS instance created successfully: ${instanceName}`);
    } catch (error) {
      console.error(`❌ Failed to create RDS instance: ${error.message}`);
      throw error;
    }
  }

  private updateEnvFile(): void {
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    const envVars = {
      AWS_REGION: this.config.awsRegion,
      DB_PASSWORD: this.config.dbPassword,
      JWT_SECRET: this.config.jwtSecret,
      S3_BUCKET_NAME: this.config.s3BucketName,
      RDS_INSTANCE_NAME: this.config.rdsInstanceName,
      NODE_ENV: 'production',
      ENABLE_FILE_LOGGING: 'true',
      LOG_LEVEL: 'info'
    };

    let updatedContent = envContent;
    
    Object.entries(envVars).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*$`, 'gm');
      if (regex.test(updatedContent)) {
        updatedContent = updatedContent.replace(regex, `${key}=${value}`);
      } else {
        updatedContent += `\n${key}=${value}`;
      }
    });

    fs.writeFileSync(envPath, updatedContent.trim());
    console.log('✅ Environment file updated successfully');
  }

  private createDeploymentConfig(): void {
    const configPath = path.join(process.cwd(), 'deployment-config.json');
    const config = {
      awsRegion: this.config.awsRegion,
      s3BucketName: this.config.s3BucketName,
      rdsInstanceName: this.config.rdsInstanceName,
      environmentName: this.config.environmentName,
      createdAt: new Date().toISOString()
    };
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('✅ Deployment configuration saved to deployment-config.json');
  }

  public async run(): Promise<void> {
    console.log('🚀 AWS Deployment Setup for Review Scraper');
    console.log('==========================================\n');

    // Check prerequisites
    console.log('Checking prerequisites...');
    
    if (!await this.checkAWSCLI()) {
      console.error('❌ AWS CLI is not installed. Please install it first:');
      console.log('   https://aws.amazon.com/cli/');
      process.exit(1);
    }
    console.log('✅ AWS CLI is installed');

    if (!await this.checkAWSConfig()) {
      console.error('❌ AWS CLI is not configured. Please run:');
      console.log('   aws configure');
      process.exit(1);
    }
    console.log('✅ AWS CLI is configured');

    // Collect configuration
    console.log('\n📋 Configuration Setup');
    console.log('----------------------');

    this.config.awsRegion = await this.prompt('AWS Region', this.config.awsRegion || 'us-east-1');
    
    const dbPasswordChoice = await this.prompt('Generate secure database password? (y/n)', 'y');
    if (dbPasswordChoice.toLowerCase() === 'y') {
      this.config.dbPassword = this.generateSecurePassword();
      console.log(`✅ Generated secure password: ${this.config.dbPassword}`);
    } else {
      this.config.dbPassword = await this.promptSecure('Enter database password');
    }

    this.config.jwtSecret = this.generateJWTSecret();
    console.log('✅ Generated JWT secret');

    this.config.s3BucketName = await this.prompt('S3 bucket name', `review-scraper-bucket-${Date.now()}`);
    this.config.rdsInstanceName = await this.prompt('RDS instance name', 'review-scraper-db');
    this.config.environmentName = await this.prompt('Environment name', 'production');

    // Confirm setup
    console.log('\n📋 Configuration Summary:');
    console.log(`   AWS Region: ${this.config.awsRegion}`);
    console.log(`   S3 Bucket: ${this.config.s3BucketName}`);
    console.log(`   RDS Instance: ${this.config.rdsInstanceName}`);
    console.log(`   Environment: ${this.config.environmentName}`);
    
    const confirm = await this.prompt('Proceed with setup? (y/n)', 'y');
    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ Setup cancelled');
      process.exit(0);
    }

    // Execute setup
    console.log('\n🔧 Executing Setup');
    console.log('-----------------');

    try {
      // Create S3 bucket
      await this.createS3Bucket(this.config.s3BucketName!);

      // Create RDS instance
      await this.createRDSInstance(this.config.rdsInstanceName!, this.config.dbPassword!);

      // Store database password in Secrets Manager
      await this.createSecretsManagerSecret('review-scraper-db-password', this.config.dbPassword!);

      // Update environment file
      this.updateEnvFile();

      // Create deployment configuration
      this.createDeploymentConfig();

      console.log('\n✅ Setup completed successfully!');
      console.log('\n📋 Next Steps:');
      console.log('1. Wait for RDS instance to be available (this may take 5-10 minutes)');
      console.log('2. Run: npm run deploy:aws');
      console.log('3. Configure Amplify for frontend deployment');
      console.log('4. Update your frontend API endpoint configuration');

    } catch (error) {
      console.error('\n❌ Setup failed:', error.message);
      console.log('\n💡 Troubleshooting:');
      console.log('1. Check AWS credentials and permissions');
      console.log('2. Ensure AWS services are available in your region');
      console.log('3. Verify resource naming conventions');
      process.exit(1);
    } finally {
      rl.close();
    }
  }
}

// Run the setup script
if (require.main === module) {
  const setup = new AWSDepploymentSetup();
  setup.run().catch(console.error);
}

export default AWSDepploymentSetup;