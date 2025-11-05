import { S3Client, CreateBucketCommand, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command, HeadBucketCommand } from '@aws-sdk/client-s3';
import { awsConfig, s3Config } from '../config/cloud.ts';

// Initialize S3 client
const s3Client = new S3Client({
  region: awsConfig.region,
  credentials: {
    accessKeyId: awsConfig.accessKeyId!,
    secretAccessKey: awsConfig.secretAccessKey!,
  },
});

/**
 * Create an S3 bucket
 * @param bucketName - Name of the bucket to create
 * @returns Promise with bucket creation result
 */
export async function createBucket(bucketName: string = s3Config.bucketName): Promise<boolean> {
  try {
    const command = new CreateBucketCommand({
      Bucket: bucketName,
      CreateBucketConfiguration: {
        LocationConstraint: awsConfig.region,
      },
    });
    
    await s3Client.send(command);
    console.log(`Bucket ${bucketName} created successfully`);
    return true;
  } catch (error: any) {
    if (error.name === 'BucketAlreadyExists' || error.name === 'BucketAlreadyOwnedByYou') {
      console.log(`Bucket ${bucketName} already exists`);
      return true;
    }
    console.error(`Error creating bucket ${bucketName}:`, error);
    return false;
  }
}

/**
 * Check if a bucket exists
 * @param bucketName - Name of the bucket to check
 * @returns Promise with boolean indicating existence
 */
export async function bucketExists(bucketName: string = s3Config.bucketName): Promise<boolean> {
  try {
    const command = new HeadBucketCommand({ Bucket: bucketName });
    await s3Client.send(command);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Upload a file to S3
 * @param key - Object key (file path in bucket)
 * @param body - File content (Buffer, string, or stream)
 * @param contentType - MIME type of the file
 * @param bucketName - Target bucket name
 * @returns Promise with upload result
 */
export async function uploadFile(
  key: string,
  body: Buffer | string | Uint8Array,
  contentType: string = 'application/octet-stream',
  bucketName: string = s3Config.bucketName
): Promise<string | null> {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    });
    
    await s3Client.send(command);
    console.log(`File ${key} uploaded to bucket ${bucketName}`);
    return `https://${bucketName}.s3.${awsConfig.region}.amazonaws.com/${key}`;
  } catch (error) {
    console.error(`Error uploading file ${key}:`, error);
    return null;
  }
}

/**
 * Download a file from S3
 * @param key - Object key (file path in bucket)
 * @param bucketName - Source bucket name
 * @returns Promise with file content as Buffer
 */
export async function downloadFile(key: string, bucketName: string = s3Config.bucketName): Promise<Buffer | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    
    const response = await s3Client.send(command);
    const chunks: Buffer[] = [];
    
    if (response.Body) {
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    }
    
    return null;
  } catch (error) {
    console.error(`Error downloading file ${key}:`, error);
    return null;
  }
}

/**
 * Delete a file from S3
 * @param key - Object key (file path in bucket)
 * @param bucketName - Target bucket name
 * @returns Promise with deletion result
 */
export async function deleteFile(key: string, bucketName: string = s3Config.bucketName): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    
    await s3Client.send(command);
    console.log(`File ${key} deleted from bucket ${bucketName}`);
    return true;
  } catch (error) {
    console.error(`Error deleting file ${key}:`, error);
    return false;
  }
}

/**
 * List files in a bucket
 * @param prefix - Optional prefix to filter files
 * @param bucketName - Target bucket name
 * @returns Promise with array of file keys
 */
export async function listFiles(prefix?: string, bucketName: string = s3Config.bucketName): Promise<string[]> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    });
    
    const response = await s3Client.send(command);
    return response.Contents?.map(obj => obj.Key || '') || [];
  } catch (error) {
    console.error(`Error listing files in bucket ${bucketName}:`, error);
    return [];
  }
}

export default {
  createBucket,
  bucketExists,
  uploadFile,
  downloadFile,
  deleteFile,
  listFiles,
};