import AWS from 'aws-sdk';
import { s3Config, awsConfig } from '../config/cloud';

export interface FileUploadResult {
  key: string;
  url: string;
  bucket: string;
}

export interface FileMetadata {
  key: string;
  size: number;
  lastModified: Date;
  contentType?: string;
}

export class S3Service {
  private s3: AWS.S3;
  private bucketName: string;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: awsConfig.accessKeyId,
      secretAccessKey: awsConfig.secretAccessKey,
      region: s3Config.region,
    });
    this.bucketName = s3Config.bucketName;
  }

  /**
   * Upload a file to S3
   */
  async uploadFile(
    key: string,
    buffer: Buffer,
    contentType?: string,
    metadata?: Record<string, string>
  ): Promise<FileUploadResult> {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType || 'application/octet-stream',
      Metadata: metadata || {},
    };

    try {
      const result = await this.s3.upload(params).promise();
      
      return {
        key: result.Key,
        url: result.Location,
        bucket: result.Bucket,
      };
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  /**
   * Download a file from S3
   */
  async downloadFile(key: string): Promise<Buffer> {
    const params: AWS.S3.GetObjectRequest = {
      Bucket: this.bucketName,
      Key: key,
    };

    try {
      const result = await this.s3.getObject(params).promise();
      return result.Body as Buffer;
    } catch (error) {
      console.error('S3 download error:', error);
      throw new Error(`Failed to download file from S3: ${error.message}`);
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(key: string): Promise<FileMetadata> {
    const params: AWS.S3.HeadObjectRequest = {
      Bucket: this.bucketName,
      Key: key,
    };

    try {
      const result = await this.s3.headObject(params).promise();
      
      return {
        key,
        size: result.ContentLength || 0,
        lastModified: result.LastModified || new Date(),
        contentType: result.ContentType,
      };
    } catch (error) {
      console.error('S3 metadata error:', error);
      throw new Error(`Failed to get file metadata from S3: ${error.message}`);
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    const params: AWS.S3.DeleteObjectRequest = {
      Bucket: this.bucketName,
      Key: key,
    };

    try {
      await this.s3.deleteObject(params).promise();
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }

  /**
   * List files in a specific folder/prefix
   */
  async listFiles(prefix?: string, maxKeys: number = 100): Promise<string[]> {
    const params: AWS.S3.ListObjectsV2Request = {
      Bucket: this.bucketName,
      MaxKeys: maxKeys,
    };

    if (prefix) {
      params.Prefix = prefix;
    }

    try {
      const result = await this.s3.listObjectsV2(params).promise();
      
      return (result.Contents || []).map(item => item.Key || '');
    } catch (error) {
      console.error('S3 list error:', error);
      throw new Error(`Failed to list files from S3: ${error.message}`);
    }
  }

  /**
   * Generate a presigned URL for temporary access
   */
  async generatePresignedUrl(
    key: string,
    expiresIn: number = 3600 // 1 hour default
  ): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: key,
      Expires: expiresIn,
    };

    try {
      return this.s3.getSignedUrl('getObject', params);
    } catch (error) {
      console.error('S3 presigned URL error:', error);
      throw new Error(`Failed to generate presigned URL: ${error.message}`);
    }
  }

  /**
   * Upload Excel export file
   */
  async uploadExcelExport(
    userId: number,
    scraperId: number,
    buffer: Buffer,
    filename?: string
  ): Promise<FileUploadResult> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const key = `exports/${userId}/${scraperId}/${filename || `export-${timestamp}.xlsx`}`;
    
    return this.uploadFile(key, buffer, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', {
      userId: userId.toString(),
      scraperId: scraperId.toString(),
      type: 'excel-export',
    });
  }

  /**
   * Upload scraped data backup
   */
  async uploadScraperBackup(
    userId: number,
    scraperId: number,
    buffer: Buffer,
    backupType: 'reviews' | 'configuration' = 'reviews'
  ): Promise<FileUploadResult> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const key = `backups/${userId}/${scraperId}/${backupType}-${timestamp}.json`;
    
    return this.uploadFile(key, buffer, 'application/json', {
      userId: userId.toString(),
      scraperId: scraperId.toString(),
      type: backupType,
    });
  }

  /**
   * Clean up old exports (older than 30 days)
   */
  async cleanupOldExports(userId: number, daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const prefix = `exports/${userId}/`;
    
    try {
      const files = await this.listFiles(prefix, 1000);
      let deletedCount = 0;
      
      for (const key of files) {
        const metadata = await this.getFileMetadata(key);
        if (metadata.lastModified < cutoffDate) {
          await this.deleteFile(key);
          deletedCount++;
        }
      }
      
      return deletedCount;
    } catch (error) {
      console.error('S3 cleanup error:', error);
      throw new Error(`Failed to cleanup old exports: ${error.message}`);
    }
  }
}

export default S3Service;