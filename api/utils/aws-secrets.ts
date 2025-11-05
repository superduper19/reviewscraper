import { SecretsManagerClient, CreateSecretCommand, GetSecretValueCommand, UpdateSecretCommand, DeleteSecretCommand, ListSecretsCommand, DescribeSecretCommand } from '@aws-sdk/client-secrets-manager';
import { awsConfig } from '../config/cloud.ts';

// Initialize Secrets Manager client
const secretsClient = new SecretsManagerClient({
  region: awsConfig.region,
  credentials: {
    accessKeyId: awsConfig.accessKeyId!,
    secretAccessKey: awsConfig.secretAccessKey!,
  },
});

/**
 * Create a new secret
 * @param name - Secret name
 * @param value - Secret value (string or object)
 * @param description - Optional description
 * @returns Promise with secret ARN
 */
export async function createSecret(name: string, value: string | object, description?: string): Promise<string | null> {
  try {
    const secretValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    const command = new CreateSecretCommand({
      Name: name,
      SecretString: secretValue,
      Description: description,
    });

    const response = await secretsClient.send(command);
    console.log(`Secret ${name} created successfully`);
    return response.ARN || null;
  } catch (error: any) {
    if (error.name === 'ResourceExistsException') {
      console.log(`Secret ${name} already exists`);
      return null;
    }
    console.error(`Error creating secret ${name}:`, error);
    return null;
  }
}

/**
 * Get secret value
 * @param name - Secret name
 * @returns Promise with secret value
 */
export async function getSecret(name: string): Promise<string | null> {
  try {
    const command = new GetSecretValueCommand({
      SecretId: name,
    });

    const response = await secretsClient.send(command);
    return response.SecretString || null;
  } catch (error: any) {
    if (error.name === 'ResourceNotFoundException') {
      console.log(`Secret ${name} not found`);
      return null;
    }
    console.error(`Error getting secret ${name}:`, error);
    return null;
  }
}

/**
 * Get parsed secret value (JSON)
 * @param name - Secret name
 * @returns Promise with parsed secret object
 */
export async function getSecretParsed(name: string): Promise<any> {
  try {
    const secretValue = await getSecret(name);
    if (!secretValue) return null;
    
    try {
      return JSON.parse(secretValue);
    } catch {
      return secretValue; // Return as string if not valid JSON
    }
  } catch (error) {
    console.error(`Error parsing secret ${name}:`, error);
    return null;
  }
}

/**
 * Update existing secret
 * @param name - Secret name
 * @param value - New secret value (string or object)
 * @returns Promise with update result
 */
export async function updateSecret(name: string, value: string | object): Promise<boolean> {
  try {
    const secretValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    const command = new UpdateSecretCommand({
      SecretId: name,
      SecretString: secretValue,
    });

    await secretsClient.send(command);
    console.log(`Secret ${name} updated successfully`);
    return true;
  } catch (error: any) {
    if (error.name === 'ResourceNotFoundException') {
      console.log(`Secret ${name} not found`);
      return false;
    }
    console.error(`Error updating secret ${name}:`, error);
    return false;
  }
}

/**
 * Delete a secret
 * @param name - Secret name
 * @param forceDeleteWithoutRecovery - Whether to force delete without recovery window
 * @returns Promise with deletion result
 */
export async function deleteSecret(name: string, forceDeleteWithoutRecovery: boolean = false): Promise<boolean> {
  try {
    const command = new DeleteSecretCommand({
      SecretId: name,
      ForceDeleteWithoutRecovery: forceDeleteWithoutRecovery,
    });

    await secretsClient.send(command);
    console.log(`Secret ${name} deleted successfully`);
    return true;
  } catch (error: any) {
    if (error.name === 'ResourceNotFoundException') {
      console.log(`Secret ${name} not found`);
      return false;
    }
    console.error(`Error deleting secret ${name}:`, error);
    return false;
  }
}

/**
 * List all secrets
 * @param prefix - Optional prefix to filter secrets
 * @returns Promise with array of secret names
 */
export async function listSecrets(prefix?: string): Promise<string[]> {
  try {
    const command = new ListSecretsCommand({
      Filters: prefix ? [{ Key: 'name', Values: [prefix] }] : undefined,
    });

    const response = await secretsClient.send(command);
    return response.SecretList?.map(secret => secret.Name || '') || [];
  } catch (error) {
    console.error('Error listing secrets:', error);
    return [];
  }
}

/**
 * Get secret metadata
 * @param name - Secret name
 * @returns Promise with secret metadata
 */
export async function getSecretMetadata(name: string): Promise<any> {
  try {
    const command = new DescribeSecretCommand({
      SecretId: name,
    });

    const response = await secretsClient.send(command);
    return {
      name: response.Name,
      description: response.Description,
      createdDate: response.CreatedDate,
      lastChangedDate: response.LastChangedDate,
      lastAccessedDate: response.LastAccessedDate,
      rotationEnabled: response.RotationEnabled,
      rotationLambdaARN: response.RotationLambdaARN,
      rotationRules: response.RotationRules,
    };
  } catch (error: any) {
    if (error.name === 'ResourceNotFoundException') {
      console.log(`Secret ${name} not found`);
      return null;
    }
    console.error(`Error getting secret metadata ${name}:`, error);
    return null;
  }
}

/**
 * Store database credentials securely
 * @param dbIdentifier - Database instance identifier
 * @param host - Database host
 * @param port - Database port
 * @param database - Database name
 * @param username - Database username
 * @param password - Database password
 * @returns Promise with secret ARN
 */
export async function storeDatabaseCredentials(
  dbIdentifier: string,
  host: string,
  port: number,
  database: string,
  username: string,
  password: string
): Promise<string | null> {
  const secretName = `database/${dbIdentifier}`;
  const credentials = {
    host,
    port,
    database,
    username,
    password,
    engine: 'postgresql',
    connectionString: `postgresql://${username}:${password}@${host}:${port}/${database}`,
  };

  return await createSecret(secretName, credentials, `Database credentials for ${dbIdentifier}`);
}

/**
 * Get database credentials
 * @param dbIdentifier - Database instance identifier
 * @returns Promise with database credentials
 */
export async function getDatabaseCredentials(dbIdentifier: string): Promise<any> {
  const secretName = `database/${dbIdentifier}`;
  return await getSecretParsed(secretName);
}

/**
 * Store API keys securely
 * @param serviceName - Service name (e.g., 'serpapi', 'google')
 * @param apiKey - API key to store
 * @returns Promise with secret ARN
 */
export async function storeApiKey(serviceName: string, apiKey: string): Promise<string | null> {
  const secretName = `api-keys/${serviceName}`;
  const apiKeyData = {
    apiKey,
    service: serviceName,
    createdAt: new Date().toISOString(),
  };

  return await createSecret(secretName, apiKeyData, `API key for ${serviceName}`);
}

/**
 * Get API key
 * @param serviceName - Service name
 * @returns Promise with API key
 */
export async function getApiKey(serviceName: string): Promise<string | null> {
  const secretName = `api-keys/${serviceName}`;
  const secretData = await getSecretParsed(secretName);
  return secretData?.apiKey || null;
}

export default {
  createSecret,
  getSecret,
  getSecretParsed,
  updateSecret,
  deleteSecret,
  listSecrets,
  getSecretMetadata,
  storeDatabaseCredentials,
  getDatabaseCredentials,
  storeApiKey,
  getApiKey,
};