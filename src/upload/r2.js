const AWS = require('aws-sdk');

const createUploadR2 = (opts) => {
  const { accessKeyId, secretAccessKey, endpoint, bucket, host } = opts;

  // 配置 AWS SDK 以连接到 Cloudflare R2
  const s3 = new AWS.S3({
    accessKeyId,
    secretAccessKey,
    endpoint,
    s3ForcePathStyle: true, // 强制使用路径样式的 URL
    signatureVersion: 'v4',
  });

  return (key, filePath) => {
    const fs = require('fs');
    
    return new Promise((resolve, reject) => {
      // 读取文件
      const fileStream = fs.createReadStream(filePath);
      
      const uploadParams = {
        Bucket: bucket,
        Key: key,
        Body: fileStream,
        ContentType: getContentType(key), // 根据文件扩展名设置 Content-Type
      };

      s3.upload(uploadParams, (err, data) => {
        if (err) {
          reject(err);
        } else {
          // 返回文件的公共 URL
          // 如果配置了自定义 host，使用 host + key 的格式
          // 否则使用 data.Location 或默认的 endpoint 格式
          let publicUrl;
          if (host) {
            publicUrl = host.endsWith('/') ? `${host}${key}` : `${host}/${key}`;
          } else {
            publicUrl = data.Location || `${endpoint}/${bucket}/${key}`;
          }
          resolve(publicUrl);
        }
      });
    });
  };
};

// 根据文件扩展名获取 Content-Type
function getContentType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'bmp': 'image/bmp',
    'ico': 'image/x-icon',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

module.exports = createUploadR2;
