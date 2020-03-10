const fs = require('fs-extra');
const path = require('path');

const createUploadQiNiu = require('./qiniu');

function qiNiuUpload(img) {
  let qiNiuConfig;
  try {
    // eslint-disable-next-line global-require
    qiNiuConfig = require('../config/qiniu'); // todo 配置七牛
    const upload = createUploadQiNiu(qiNiuConfig);

    return upload(img);
  } catch (e) {
    console.error('缺少config/qiniu.js配置文件');
    return Promise.reject(e);
  }
}

// todo 上传前压缩图片
async function uploadBufferImage(buffer) {
  const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const filePath = path.resolve(__dirname, `../tmp/${fileName}.png`);

  await fs.writeFile(filePath, buffer); // 创建临时本地文件
  const url = await qiNiuUpload(filePath); // 上传到七牛
  await fs.unlinkSync(filePath); // 删除临时文件
  return url;
}

module.exports = {
  uploadBufferImage,
};
