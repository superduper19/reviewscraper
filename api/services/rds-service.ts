import { RDS } from 'aws-sdk';
import { dbConfig, awsConfig } from '../config/cloud';

export interface DatabaseBackupResult {
  snapshotId: string;
  status: string;
  createdAt: Date;
}

export interface DatabaseRestoreResult {
  instanceId: string;
  status: string;
  endpoint?: string;
}

export class RDSService {
  private rds: RDS;

  constructor() {
    this.rds = new RDS({
      accessKeyId: awsConfig.accessKeyId,
      secretAccessKey: awsConfig.secretAccessKey,
      region: awsConfig.region,
    });
  }

  /**
   * Create a database snapshot
   */
  async createSnapshot(snapshotId?: string): Promise<DatabaseBackupResult> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const finalSnapshotId = snapshotId || `${dbConfig.instanceIdentifier}-snapshot-${timestamp}`;

    const params: RDS.CreateDBSnapshotMessage = {
      DBSnapshotIdentifier: finalSnapshotId,
      DBInstanceIdentifier: dbConfig.instanceIdentifier,
    };

    try {
      const result = await this.rds.createDBSnapshot(params).promise();
      
      return {
        snapshotId: result.DBSnapshot?.DBSnapshotIdentifier || finalSnapshotId,
        status: result.DBSnapshot?.Status || 'creating',
        createdAt: result.DBSnapshot?.SnapshotCreateTime || new Date(),
      };
    } catch (error) {
      console.error('RDS snapshot error:', error);
      throw new Error(`Failed to create database snapshot: ${error.message}`);
    }
  }

  /**
   * Get snapshot status
   */
  async getSnapshotStatus(snapshotId: string): Promise<string> {
    const params: RDS.DescribeDBSnapshotsMessage = {
      DBSnapshotIdentifier: snapshotId,
    };

    try {
      const result = await this.rds.describeDBSnapshots(params).promise();
      
      if (!result.DBSnapshots || result.DBSnapshots.length === 0) {
        throw new Error('Snapshot not found');
      }
      
      return result.DBSnapshots[0].Status || 'unknown';
    } catch (error) {
      console.error('RDS get snapshot status error:', error);
      throw new Error(`Failed to get snapshot status: ${error.message}`);
    }
  }

  /**
   * Restore database from snapshot
   */
  async restoreFromSnapshot(
    snapshotId: string,
    newInstanceId?: string
  ): Promise<DatabaseRestoreResult> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const finalInstanceId = newInstanceId || `${dbConfig.instanceIdentifier}-restore-${timestamp}`;

    const params: RDS.RestoreDBInstanceFromDBSnapshotMessage = {
      DBInstanceIdentifier: finalInstanceId,
      DBSnapshotIdentifier: snapshotId,
      DBInstanceClass: dbConfig.instanceClass,
      Engine: dbConfig.engine,
      PubliclyAccessible: false,
      MultiAZ: dbConfig.multiAZ,
      StorageType: dbConfig.storageType,
      AllocatedStorage: dbConfig.allocatedStorage,
    };

    try {
      const result = await this.rds.restoreDBInstanceFromDBSnapshot(params).promise();
      
      return {
        instanceId: result.DBInstance?.DBInstanceIdentifier || finalInstanceId,
        status: result.DBInstance?.DBInstanceStatus || 'creating',
        endpoint: result.DBInstance?.Endpoint?.Address,
      };
    } catch (error) {
      console.error('RDS restore error:', error);
      throw new Error(`Failed to restore database from snapshot: ${error.message}`);
    }
  }

  /**
   * Get database instance status
   */
  async getInstanceStatus(): Promise<string> {
    const params: RDS.DescribeDBInstancesMessage = {
      DBInstanceIdentifier: dbConfig.instanceIdentifier,
    };

    try {
      const result = await this.rds.describeDBInstances(params).promise();
      
      if (!result.DBInstances || result.DBInstances.length === 0) {
        throw new Error('Database instance not found');
      }
      
      return result.DBInstances[0].DBInstanceStatus || 'unknown';
    } catch (error) {
      console.error('RDS get instance status error:', error);
      throw new Error(`Failed to get database instance status: ${error.message}`);
    }
  }

  /**
   * Get database endpoint
   */
  async getDatabaseEndpoint(): Promise<string> {
    const params: RDS.DescribeDBInstancesMessage = {
      DBInstanceIdentifier: dbConfig.instanceIdentifier,
    };

    try {
      const result = await this.rds.describeDBInstances(params).promise();
      
      if (!result.DBInstances || result.DBInstances.length === 0) {
        throw new Error('Database instance not found');
      }
      
      const endpoint = result.DBInstances[0].Endpoint;
      if (!endpoint || !endpoint.Address) {
        throw new Error('Database endpoint not available');
      }
      
      return endpoint.Address;
    } catch (error) {
      console.error('RDS get endpoint error:', error);
      throw new Error(`Failed to get database endpoint: ${error.message}`);
    }
  }

  /**
   * Modify database instance
   */
  async modifyInstance(
    params: Partial<{
      instanceClass: string;
      allocatedStorage: number;
      backupRetentionPeriod: number;
      multiAZ: boolean;
    }>
  ): Promise<void> {
    const modifyParams: RDS.ModifyDBInstanceMessage = {
      DBInstanceIdentifier: dbConfig.instanceIdentifier,
      ApplyImmediately: true,
    };

    if (params.instanceClass) {
      modifyParams.DBInstanceClass = params.instanceClass;
    }
    if (params.allocatedStorage) {
      modifyParams.AllocatedStorage = params.allocatedStorage;
    }
    if (params.backupRetentionPeriod) {
      modifyParams.BackupRetentionPeriod = params.backupRetentionPeriod;
    }
    if (params.multiAZ !== undefined) {
      modifyParams.MultiAZ = params.multiAZ;
    }

    try {
      await this.rds.modifyDBInstance(modifyParams).promise();
    } catch (error) {
      console.error('RDS modify error:', error);
      throw new Error(`Failed to modify database instance: ${error.message}`);
    }
  }

  /**
   * List available snapshots
   */
  async listSnapshots(): Promise<DatabaseBackupResult[]> {
    const params: RDS.DescribeDBSnapshotsMessage = {
      DBInstanceIdentifier: dbConfig.instanceIdentifier,
    };

    try {
      const result = await this.rds.describeDBSnapshots(params).promise();
      
      return (result.DBSnapshots || []).map(snapshot => ({
        snapshotId: snapshot.DBSnapshotIdentifier || '',
        status: snapshot.Status || 'unknown',
        createdAt: snapshot.SnapshotCreateTime || new Date(),
      }));
    } catch (error) {
      console.error('RDS list snapshots error:', error);
      throw new Error(`Failed to list database snapshots: ${error.message}`);
    }
  }

  /**
   * Delete old snapshots (older than retention days)
   */
  async cleanupOldSnapshots(retentionDays: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    try {
      const snapshots = await this.listSnapshots();
      let deletedCount = 0;
      
      for (const snapshot of snapshots) {
        if (snapshot.createdAt < cutoffDate && snapshot.status === 'available') {
          await this.rds.deleteDBSnapshot({
            DBSnapshotIdentifier: snapshot.snapshotId,
          }).promise();
          deletedCount++;
        }
      }
      
      return deletedCount;
    } catch (error) {
      console.error('RDS cleanup error:', error);
      throw new Error(`Failed to cleanup old snapshots: ${error.message}`);
    }
  }
}

export default RDSService;