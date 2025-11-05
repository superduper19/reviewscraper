// Cloud utilities index file
// Exports all cloud service utilities for easy importing

// AWS Utilities
export * from './aws-s3.ts';
export * from './aws-rds.ts';
export * from './aws-secrets.ts';

// Cloud Error Handling
export * from './cloud-errors.ts';

// Re-export commonly used items for convenience
export { default as s3Utils } from './aws-s3.ts';
export { default as rdsUtils } from './aws-rds.ts';
export { default as secretsUtils } from './aws-secrets.ts';
export { default as cloudErrors } from './cloud-errors.ts';

// Cloud service types and interfaces
export interface CloudServiceStatus {
  service: string;
  status: 'connected' | 'disconnected' | 'error';
  message?: string;
  lastChecked: Date;
}

export interface CloudResource {
  id: string;
  name: string;
  type: string;
  status: string;
  createdAt?: Date;
  region: string;
  tags?: Record<string, string>;
}

// Utility functions for common cloud operations
export function formatResourceName(name: string, environment: string = 'dev'): string {
  const projectName = 'review-scraper';
  return `${projectName}-${environment}-${name}`;
}

export function parseResourceName(resourceName: string): {
  project: string;
  environment: string;
  name: string;
} {
  const parts = resourceName.split('-');
  if (parts.length >= 3) {
    return {
      project: parts[0],
      environment: parts[1],
      name: parts.slice(2).join('-'),
    };
  }
  return {
    project: 'unknown',
    environment: 'unknown',
    name: resourceName,
  };
}

export function generateResourceTags(environment: string = 'dev', additionalTags: Record<string, string> = {}): Record<string, string> {
  return {
    'Project': 'review-scraper',
    'Environment': environment,
    'ManagedBy': 'cloud-utils',
    'CreatedAt': new Date().toISOString(),
    ...additionalTags,
  };
}

// Cloud service health check utilities
export async function checkCloudConnectivity(): Promise<CloudServiceStatus[]> {
  const results: CloudServiceStatus[] = [];
  const timestamp = new Date();

  // Check AWS connectivity
  try {
    const { awsConfig } = await import('../config/cloud.ts');
    if (awsConfig.accessKeyId && awsConfig.secretAccessKey) {
      // Simple credential validation
      results.push({
        service: 'AWS',
        status: 'connected',
        lastChecked: timestamp,
      });
    } else {
      results.push({
        service: 'AWS',
        status: 'disconnected',
        message: 'AWS credentials not configured',
        lastChecked: timestamp,
      });
    }
  } catch (error) {
    results.push({
      service: 'AWS',
      status: 'error',
      message: 'Failed to check AWS connectivity',
      lastChecked: timestamp,
    });
  }

  // Check GCP connectivity (placeholder for future implementation)
  results.push({
    service: 'GCP',
    status: 'disconnected',
    message: 'GCP integration not yet implemented',
    lastChecked: timestamp,
  });

  return results;
}