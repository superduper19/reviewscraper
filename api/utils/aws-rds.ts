import { RDSClient, CreateDBInstanceCommand, DeleteDBInstanceCommand, DescribeDBInstancesCommand, waitUntilDBInstanceAvailable, waitUntilDBInstanceDeleted } from '@aws-sdk/client-rds';
import type { CreateDBInstanceCommandInput } from '@aws-sdk/client-rds';
import { awsConfig, dbConfig } from '../config/cloud.ts';

// Initialize RDS client
const rdsClient = new RDSClient({
  region: awsConfig.region,
  credentials: {
    accessKeyId: awsConfig.accessKeyId!,
    secretAccessKey: awsConfig.secretAccessKey!,
  },
});

/**
 * Create a PostgreSQL database instance
 * @param params - Optional parameters to override defaults
 * @returns Promise with database creation result
 */
export async function createDatabaseInstance(params?: Partial<CreateDBInstanceCommandInput>): Promise<boolean> {
  try {
    console.log('🔧 createDatabaseInstance: Starting database creation...');
    const createParams: CreateDBInstanceCommandInput = {
      DBInstanceIdentifier: dbConfig.instanceIdentifier,
      DBInstanceClass: dbConfig.instanceClass,
      Engine: dbConfig.engine,
      MasterUsername: dbConfig.user,
      MasterUserPassword: dbConfig.password,
      AllocatedStorage: dbConfig.allocatedStorage,
      StorageType: dbConfig.storageType,
      BackupRetentionPeriod: dbConfig.backupRetentionPeriod,
      MultiAZ: dbConfig.multiAZ,
      PubliclyAccessible: true, // For development access
      VPCSecurityGroups: params?.VPCSecurityGroups || ['default'],
      DBName: dbConfig.name,
      ...params,
    };

    const command = new CreateDBInstanceCommand(createParams);
    console.log('🔧 Sending CreateDBInstanceCommand...');
    await rdsClient.send(command);
    console.log('✅ CreateDBInstanceCommand sent successfully');
    
    console.log(`Database instance ${dbConfig.instanceIdentifier} creation initiated`);
    
    // Wait for the database to be available
    console.log('Waiting for database to be available...');
    try {
      await waitUntilDBInstanceAvailable(
        {
          client: rdsClient,
          maxWaitTime: 600, // 10 minutes
        },
        { DBInstanceIdentifier: dbConfig.instanceIdentifier }
      );
      console.log(`Database instance ${dbConfig.instanceIdentifier} is now available`);
    } catch (waitError: any) {
      console.log(`⚠️  waitUntilDBInstanceAvailable failed: ${waitError.message}`);
      throw waitError;
    }
    
    return true;
  } catch (error: any) {
    if (error.name === 'DBInstanceAlreadyExists') {
      console.log(`Database instance ${dbConfig.instanceIdentifier} already exists`);
      return true;
    }
    console.error(`Error creating database instance:`, error);
    return false;
  }
}

/**
 * Delete a database instance
 * @param dbInstanceIdentifier - Database instance identifier
 * @param skipFinalSnapshot - Whether to skip final snapshot
 * @returns Promise with deletion result
 */
export async function deleteDatabaseInstance(
  dbInstanceIdentifier: string = dbConfig.instanceIdentifier,
  skipFinalSnapshot: boolean = false
): Promise<boolean> {
  try {
    const command = new DeleteDBInstanceCommand({
      DBInstanceIdentifier: dbInstanceIdentifier,
      SkipFinalSnapshot: skipFinalSnapshot,
      FinalDBSnapshotIdentifier: skipFinalSnapshot ? undefined : `${dbInstanceIdentifier}-final-snapshot`,
    });

    await rdsClient.send(command);
    console.log(`Database instance ${dbInstanceIdentifier} deletion initiated`);
    
    // Wait for the database to be deleted
    console.log('Waiting for database to be deleted...');
    await waitUntilDBInstanceDeleted(
      {
        client: rdsClient,
        maxWaitTime: 600, // 10 minutes
      },
      { DBInstanceIdentifier: dbInstanceIdentifier }
    );
    
    console.log(`Database instance ${dbInstanceIdentifier} has been deleted`);
    return true;
  } catch (error) {
    console.error(`Error deleting database instance:`, error);
    return false;
  }
}

/**
 * Get database instance details
 * @param dbInstanceIdentifier - Database instance identifier
 * @returns Promise with database instance details
 */
export async function getDatabaseInstance(dbInstanceIdentifier: string = dbConfig.instanceIdentifier) {
  try {
    const command = new DescribeDBInstancesCommand({
      DBInstanceIdentifier: dbInstanceIdentifier,
    });

    const response = await rdsClient.send(command);
    return response.DBInstances?.[0] || null;
  } catch (error) {
    console.error(`Error getting database instance details:`, error);
    return null;
  }
}

/**
 * Get database connection endpoint
 * @param dbInstanceIdentifier - Database instance identifier
 * @returns Promise with connection details
 */
export async function getDatabaseEndpoint(dbInstanceIdentifier: string = dbConfig.instanceIdentifier) {
  try {
    const dbInstance = await getDatabaseInstance(dbInstanceIdentifier);
    
    if (!dbInstance || !dbInstance.Endpoint) {
      return null;
    }

    return {
      host: dbInstance.Endpoint.Address,
      port: dbInstance.Endpoint.Port,
      database: dbInstance.DBName,
      username: dbInstance.MasterUsername,
      engine: dbInstance.Engine,
      status: dbInstance.DBInstanceStatus,
    };
  } catch (error) {
    console.error(`Error getting database endpoint:`, error);
    return null;
  }
}

/**
 * Check if database instance exists and is available
 * @param dbInstanceIdentifier - Database instance identifier
 * @returns Promise with boolean indicating availability
 */
export async function isDatabaseAvailable(dbInstanceIdentifier: string = dbConfig.instanceIdentifier): Promise<boolean> {
  try {
    const dbInstance = await getDatabaseInstance(dbInstanceIdentifier);
    return dbInstance?.DBInstanceStatus === 'available';
  } catch (error) {
    return false;
  }
}

/**
 * Get database connection string
 * @param dbInstanceIdentifier - Database instance identifier
 * @returns Promise with PostgreSQL connection string
 */
export async function getConnectionString(dbInstanceIdentifier: string = dbConfig.instanceIdentifier): Promise<string | null> {
  try {
    const endpoint = await getDatabaseEndpoint(dbInstanceIdentifier);
    
    if (!endpoint) {
      return null;
    }

    return `postgresql://${dbConfig.user}:${dbConfig.password}@${endpoint.host}:${endpoint.port}/${dbConfig.name}`;
  } catch (error) {
    console.error(`Error getting connection string:`, error);
    return null;
  }
}

export default {
  createDatabaseInstance,
  deleteDatabaseInstance,
  getDatabaseInstance,
  getDatabaseEndpoint,
  isDatabaseAvailable,
  getConnectionString,
};