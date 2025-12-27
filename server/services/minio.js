const Minio = require('minio');

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'documents';

// Initialize bucket
async function initBucket() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME);
      console.log(`Bucket '${BUCKET_NAME}' created successfully`);
    } else {
      console.log(`Bucket '${BUCKET_NAME}' already exists`);
    }
  } catch (error) {
    console.error('Error initializing bucket:', error);
    throw error;
  }
}

// Upload file to MinIO
async function uploadFile(objectName, buffer, contentType) {
  try {
    const metaData = {
      'Content-Type': contentType,
    };
    await minioClient.putObject(BUCKET_NAME, objectName, buffer, buffer.length, metaData);
    return objectName;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

// Get file from MinIO
async function getFile(objectName) {
  try {
    const stream = await minioClient.getObject(BUCKET_NAME, objectName);
    return stream;
  } catch (error) {
    console.error('Error getting file:', error);
    throw error;
  }
}

// Delete file from MinIO
async function deleteFile(objectName) {
  try {
    await minioClient.removeObject(BUCKET_NAME, objectName);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

// Delete all files with prefix
async function deleteFilesWithPrefix(prefix) {
  try {
    const objectsList = [];
    const stream = minioClient.listObjects(BUCKET_NAME, prefix, true);

    for await (const obj of stream) {
      objectsList.push(obj.name);
    }

    if (objectsList.length > 0) {
      await minioClient.removeObjects(BUCKET_NAME, objectsList);
    }
    return true;
  } catch (error) {
    console.error('Error deleting files with prefix:', error);
    throw error;
  }
}

// Check if file exists
async function fileExists(objectName) {
  try {
    await minioClient.statObject(BUCKET_NAME, objectName);
    return true;
  } catch (error) {
    if (error.code === 'NotFound') {
      return false;
    }
    throw error;
  }
}

// Get file stat (for content type)
async function getFileStat(objectName) {
  try {
    const stat = await minioClient.statObject(BUCKET_NAME, objectName);
    return stat;
  } catch (error) {
    console.error('Error getting file stat:', error);
    throw error;
  }
}

// Copy file within the bucket
async function copyFile(sourceObject, destObject) {
  try {
    const conds = new Minio.CopyConditions();
    await minioClient.copyObject(
      BUCKET_NAME,
      destObject,
      `/${BUCKET_NAME}/${sourceObject}`,
      conds
    );
    return destObject;
  } catch (error) {
    console.error('Error copying file:', error);
    throw error;
  }
}

module.exports = {
  initBucket,
  uploadFile,
  getFile,
  deleteFile,
  deleteFilesWithPrefix,
  fileExists,
  getFileStat,
  copyFile,
  BUCKET_NAME,
};
