import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

export const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB per image
export const MAX_USER_STORAGE_BYTES = 5 * 1024 * 1024; // 5 MB per user

function getR2Client(): { client: S3Client; bucketName: string } {
  const accountId = process.env.R2_ACCOUNT_ID || '';
  const accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
  const bucketName = process.env.R2_BUCKET_NAME || 'bookshelf';
  const endpoint = process.env.R2_ENDPOINT || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : '');

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error('R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME are required for image storage');
  }

  const client = new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return { client, bucketName };
}

/**
 * Upload a file to Cloudflare R2
 */
export async function uploadToR2(
  key: string,
  body: Uint8Array | Buffer,
  contentType: string
): Promise<{ success: boolean; key: string; url: string }> {
  const { client, bucketName } = getR2Client();

  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return {
    success: true,
    key,
    url: `/api/images/${key}`,
  };
}

/**
 * Get an object from Cloudflare R2
 */
export async function getFromR2(key: string) {
  const { client, bucketName } = getR2Client();
  const res = await client.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  );
  return res;
}

/**
 * Delete an object from Cloudflare R2
 */
export async function deleteFromR2(key: string): Promise<boolean> {
  try {
    const { client, bucketName } = getR2Client();
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );
    return true;
  } catch (err) {
    console.error('Failed to delete from R2:', err);
    return false;
  }
}
