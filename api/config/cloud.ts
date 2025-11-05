import { config } from 'dotenv';

// Load environment variables
config();

// AWS Configuration
export const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
  accountId: process.env.AWS_ACCOUNT_ID,
};

// Database Configuration
export const dbConfig = {
  name: process.env.DB_NAME || 'review_scraper',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  instanceIdentifier: process.env.DB_INSTANCE_IDENTIFIER || 'review-scraper-db',
  engine: 'postgres',
  instanceClass: 'db.t3.micro',
  allocatedStorage: 20,
  storageType: 'gp2',
  backupRetentionPeriod: 7,
  multiAZ: false,
};

// S3 Configuration
export const s3Config = {
  bucketName: process.env.S3_BUCKET_NAME || 'review-scraper-bucket',
  region: process.env.AWS_REGION || 'us-east-1',
};

// Application Configuration
export const appConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000'),
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// Validation function
export function validateAwsConfig(): { valid: boolean; errors: string[] } {
  const required = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
    'DB_PASSWORD',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    return {
      valid: false,
      errors: missing.map(key => `Missing required environment variable: ${key}`)
    };
  }
  
  return { valid: true, errors: [] };
}

// Cloud service configurations
export const cloudConfig = {
  aws: awsConfig,
  database: dbConfig,
  storage: s3Config,
  app: appConfig,
};

export default cloudConfig;