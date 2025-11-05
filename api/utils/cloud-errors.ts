/**
 * Cloud service error types and utilities
 * Provides standardized error handling for AWS and GCP services
 */

// Cloud service error types (using const object instead of enum for Node.js compatibility)
export const CloudServiceErrorType = {
  // AWS-specific errors
  AWS_ACCESS_DENIED: 'AWS_ACCESS_DENIED',
  AWS_RESOURCE_NOT_FOUND: 'AWS_RESOURCE_NOT_FOUND',
  AWS_RESOURCE_ALREADY_EXISTS: 'AWS_RESOURCE_ALREADY_EXISTS',
  AWS_INVALID_PARAMETER: 'AWS_INVALID_PARAMETER',
  AWS_SERVICE_UNAVAILABLE: 'AWS_SERVICE_UNAVAILABLE',
  AWS_RATE_LIMITED: 'AWS_RATE_LIMITED',
  AWS_NETWORK_ERROR: 'AWS_NETWORK_ERROR',
  
  // GCP-specific errors
  GCP_ACCESS_DENIED: 'GCP_ACCESS_DENIED',
  GCP_RESOURCE_NOT_FOUND: 'GCP_RESOURCE_NOT_FOUND',
  GCP_RESOURCE_ALREADY_EXISTS: 'GCP_RESOURCE_ALREADY_EXISTS',
  GCP_INVALID_PARAMETER: 'GCP_INVALID_PARAMETER',
  GCP_SERVICE_UNAVAILABLE: 'GCP_SERVICE_UNAVAILABLE',
  GCP_RATE_LIMITED: 'GCP_RATE_LIMITED',
  GCP_NETWORK_ERROR: 'GCP_NETWORK_ERROR',
  
  // General cloud errors
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  CREDENTIALS_ERROR: 'CREDENTIALS_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type CloudServiceErrorType = typeof CloudServiceErrorType[keyof typeof CloudServiceErrorType];

export interface CloudServiceError extends Error {
  type: CloudServiceErrorType;
  service: string;
  originalError?: any;
  userFriendlyMessage?: string;
  retryable?: boolean;
}

/**
 * Custom Cloud Service Error class
 */
export class CloudServiceError extends Error {
  constructor(
    type: CloudServiceErrorType,
    service: string,
    message: string,
    originalError?: any,
    userFriendlyMessage?: string,
    retryable: boolean = false
  ) {
    super(message);
    this.name = 'CloudServiceError';
    this.type = type;
    this.service = service;
    this.originalError = originalError;
    this.userFriendlyMessage = userFriendlyMessage;
    this.retryable = retryable;
  }
}

/**
 * Map AWS SDK errors to our custom error types
 */
export function mapAWSError(error: any, service: string): CloudServiceError {
  const errorCode = error.Code || error.code || error.name;
  const errorMessage = error.Message || error.message || 'Unknown AWS error';
  
  // Determine error type based on AWS error code
  let type: CloudServiceErrorType;
  let retryable = false;
  let userFriendlyMessage: string;
  
  switch (errorCode) {
    case 'AccessDenied':
    case 'AccessDeniedException':
    case 'UnauthorizedOperation':
      type = CloudServiceErrorType.AWS_ACCESS_DENIED;
      userFriendlyMessage = 'Access denied. Please check your AWS credentials and permissions.';
      break;
      
    case 'ResourceNotFound':
    case 'NoSuchBucket':
    case 'NoSuchKey':
    case 'DBInstanceNotFound':
      type = CloudServiceErrorType.AWS_RESOURCE_NOT_FOUND;
      userFriendlyMessage = 'The requested resource was not found.';
      break;
      
    case 'BucketAlreadyExists':
    case 'DBInstanceAlreadyExists':
    case 'ResourceExistsException':
      type = CloudServiceErrorType.AWS_RESOURCE_ALREADY_EXISTS;
      userFriendlyMessage = 'The resource already exists.';
      break;
      
    case 'InvalidParameterValue':
    case 'ValidationException':
    case 'InvalidBucketName':
      type = CloudServiceErrorType.AWS_INVALID_PARAMETER;
      userFriendlyMessage = 'Invalid parameter provided. Please check your input.';
      break;
      
    case 'ServiceUnavailable':
    case 'InternalServiceError':
      type = CloudServiceErrorType.AWS_SERVICE_UNAVAILABLE;
      userFriendlyMessage = 'AWS service is temporarily unavailable. Please try again later.';
      retryable = true;
      break;
      
    case 'ThrottlingException':
    case 'RequestLimitExceeded':
      type = CloudServiceErrorType.AWS_RATE_LIMITED;
      userFriendlyMessage = 'Too many requests. Please wait and try again.';
      retryable = true;
      break;
      
    case 'NetworkingError':
    case 'TimeoutError':
    case 'ConnectionClosed':
      type = CloudServiceErrorType.AWS_NETWORK_ERROR;
      userFriendlyMessage = 'Network error occurred. Please check your connection.';
      retryable = true;
      break;
      
    default:
      type = CloudServiceErrorType.UNKNOWN_ERROR;
      userFriendlyMessage = 'An unexpected error occurred.';
      break;
  }
  
  return new CloudServiceError(
    type,
    service,
    errorMessage,
    error,
    userFriendlyMessage,
    retryable
  );
}

/**
 * Map GCP errors to our custom error types
 */
export function mapGCPError(error: any, service: string): CloudServiceError {
  const errorCode = error.code || error.status;
  const errorMessage = error.message || 'Unknown GCP error';
  
  let type: CloudServiceErrorType;
  let retryable = false;
  let userFriendlyMessage: string;
  
  switch (errorCode) {
    case 403:
      type = CloudServiceErrorType.GCP_ACCESS_DENIED;
      userFriendlyMessage = 'Access denied. Please check your GCP credentials and permissions.';
      break;
      
    case 404:
      type = CloudServiceErrorType.GCP_RESOURCE_NOT_FOUND;
      userFriendlyMessage = 'The requested resource was not found.';
      break;
      
    case 409:
      type = CloudServiceErrorType.GCP_RESOURCE_ALREADY_EXISTS;
      userFriendlyMessage = 'The resource already exists.';
      break;
      
    case 400:
      type = CloudServiceErrorType.GCP_INVALID_PARAMETER;
      userFriendlyMessage = 'Invalid parameter provided. Please check your input.';
      break;
      
    case 503:
      type = CloudServiceErrorType.GCP_SERVICE_UNAVAILABLE;
      userFriendlyMessage = 'GCP service is temporarily unavailable. Please try again later.';
      retryable = true;
      break;
      
    case 429:
      type = CloudServiceErrorType.GCP_RATE_LIMITED;
      userFriendlyMessage = 'Too many requests. Please wait and try again.';
      retryable = true;
      break;
      
    default:
      if (error.code?.includes('NETWORK') || error.code?.includes('TIMEOUT')) {
        type = CloudServiceErrorType.GCP_NETWORK_ERROR;
        userFriendlyMessage = 'Network error occurred. Please check your connection.';
        retryable = true;
      } else {
        type = CloudServiceErrorType.UNKNOWN_ERROR;
        userFriendlyMessage = 'An unexpected error occurred.';
      }
      break;
  }
  
  return new CloudServiceError(
    type,
    service,
    errorMessage,
    error,
    userFriendlyMessage,
    retryable
  );
}

/**
 * Handle configuration errors
 */
export function createConfigurationError(service: string, message: string, originalError?: any): CloudServiceError {
  return new CloudServiceError(
    CloudServiceErrorType.CONFIGURATION_ERROR,
    service,
    message,
    originalError,
    'Configuration error. Please check your setup.',
    false
  );
}

/**
 * Handle credentials errors
 */
export function createCredentialsError(service: string, message: string, originalError?: any): CloudServiceError {
  return new CloudServiceError(
    CloudServiceErrorType.CREDENTIALS_ERROR,
    service,
    message,
    originalError,
    'Credentials error. Please check your cloud service credentials.',
    false
  );
}

/**
 * Handle validation errors
 */
export function createValidationError(service: string, message: string, originalError?: any): CloudServiceError {
  return new CloudServiceError(
    CloudServiceErrorType.VALIDATION_ERROR,
    service,
    message,
    originalError,
    'Validation error. Please check your input parameters.',
    false
  );
}

/**
 * Generic error handler for cloud operations
 */
export async function handleCloudOperation<T>(
  operation: () => Promise<T>,
  service: string,
  operationName: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    let cloudError: CloudServiceError;
    
    // Check if it's already a CloudServiceError
    if (error instanceof CloudServiceError) {
      cloudError = error;
    } else if (error.name?.includes('AWS') || error.Code) {
      // AWS error
      cloudError = mapAWSError(error, service);
    } else if (error.code || error.status) {
      // GCP error
      cloudError = mapGCPError(error, service);
    } else {
      // Generic error
      cloudError = new CloudServiceError(
        CloudServiceErrorType.UNKNOWN_ERROR,
        service,
        error.message || 'Unknown error occurred',
        error,
        'An unexpected error occurred.',
        false
      );
    }
    
    console.error(`[${service}] ${operationName} failed:`, {
      error: cloudError.message,
      type: cloudError.type,
      userFriendlyMessage: cloudError.userFriendlyMessage,
      retryable: cloudError.retryable,
    });
    
    throw cloudError;
  }
}

/**
 * Retry logic for retryable errors
 */
export async function retryCloudOperation<T>(
  operation: () => Promise<T>,
  service: string,
  operationName: string,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await handleCloudOperation(operation, service, operationName);
    } catch (error) {
      lastError = error;
      
      if (error instanceof CloudServiceError && error.retryable && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
        console.log(`[${service}] ${operationName} failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
}

export default {
  CloudServiceError,
  CloudServiceErrorType,
  mapAWSError,
  mapGCPError,
  createConfigurationError,
  createCredentialsError,
  createValidationError,
  handleCloudOperation,
  retryCloudOperation,
};