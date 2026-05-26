import { Client } from 'minio';

export const minioClient = new Client({
  endPoint:  process.env.MINIO_ENDPOINT  || 'localhost',
  port:      parseInt(process.env.MINIO_PORT || '9000'),
  useSSL:    process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
});

export const BUCKET = process.env.MINIO_BUCKET || 'onixframe-videos';

/**
 * Upload a Buffer to MinIO and return the storage key.
 * @param {Buffer} buffer
 * @param {string} storageKey  - path inside the bucket, e.g. "videos/abc123.mp4"
 * @param {string} mimeType
 * @param {number} size
 */
export async function uploadToMinio(buffer, storageKey, mimeType, size) {
  await minioClient.putObject(BUCKET, storageKey, buffer, size, {
    'Content-Type': mimeType,
  });
  return storageKey;
}

/**
 * Generate a presigned GET URL valid for `expiry` seconds (default 1 hour).
 *
 * EC2 fix: MinIO generates URLs using its internal Docker hostname (e.g. "minio").
 * MINIO_PUBLIC_URL replaces the hostname/port so browsers can reach it via the
 * EC2 public IP or domain.
 *
 * @param {string} storageKey
 * @param {number} expiry  seconds
 * @returns {Promise<string>} public presigned URL
 */
export async function getPresignedUrl(storageKey, expiry = 3600) {
  const internalUrl = await minioClient.presignedGetObject(BUCKET, storageKey, expiry);

  const publicBase = process.env.MINIO_PUBLIC_URL;
  if (publicBase) {
    try {
      const parsed = new URL(internalUrl);
      const pub    = new URL(publicBase);
      parsed.hostname = pub.hostname;
      parsed.port     = pub.port || '';
      parsed.protocol = pub.protocol;
      return parsed.toString();
    } catch {
      // If URL parsing fails, fall through and return the internal URL
    }
  }

  return internalUrl;
}

/**
 * Stream an object from MinIO (used by the enhance route to feed FFmpeg).
 * @param {string} storageKey
 * @returns {Promise<NodeJS.ReadableStream>}
 */
export async function getObjectStream(storageKey) {
  return minioClient.getObject(BUCKET, storageKey);
}

/**
 * Delete an object from MinIO.
 * @param {string} storageKey
 */
export async function deleteObject(storageKey) {
  return minioClient.removeObject(BUCKET, storageKey);
}

/**
 * Ensure the bucket exists (called at app startup / in upload route).
 */
export async function ensureBucket() {
  const exists = await minioClient.bucketExists(BUCKET);
  if (!exists) {
    await minioClient.makeBucket(BUCKET, 'us-east-1');
  }
}
