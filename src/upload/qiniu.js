

const qiniu = require('qiniu');
const path = require('path');

const createUploadQiNiu = (opts) => {
  const { accesskey, secretkey, bucket, host } = opts;

  return (filePath) => {
    const key = `img/${path.basename(filePath)}`;

    // 设置上传策略
    const putPolicy = new qiniu.rs.PutPolicy({
      scope: `${bucket}:${key}`,
    });

    // 根据密钥创建鉴权对象mac，获取上传token
    const mac = new qiniu.auth.digest.Mac(accesskey, secretkey);
    const uploadToken = putPolicy.uploadToken(mac);

    // 配置对象
    const config = new qiniu.conf.Config();
    // 上传机房，z2是华南
    config.zone = qiniu.zone.Zone_z2;

    // 扩展参数，主要是用于文件分片上传使用的，这里可以忽略
    const putExtra = new qiniu.form_up.PutExtra();

    // 实例化上传对象
    const formUploader = new qiniu.form_up.FormUploader(config);

    return new Promise((resolve, reject) => {
      formUploader.putFile(uploadToken, key, filePath, putExtra, (respErr, respBody, respInfo) => {
        if (respErr) { reject(respErr); }

        if (respInfo && respInfo.statusCode === 200) {
          // 拼接服务器路径
          const filename = host + key;
          resolve(filename);
        } else {
          reject('respInfo is error');
        }
      });
    });
  };
};
module.exports = createUploadQiNiu;
