const fs = require('fs-extra');
const path = require('path');


const imageMin = require('imagemin');
const imageJPEG = require('imagemin-jpegtran');
const imagePNG = require('imagemin-pngquant');

const createUploadQiNiu = require('./qiniu');
const configUtil = require('../util/config');

// 图片压缩
function compressImage(filePath, destination) {
  return imageMin([filePath], {
    destination,
    plugins: [
      imageJPEG(),
      imagePNG({
        quality: [0.6, 0.8],
      }),
    ],
  });
}

function qiNiuUpload(img) {
  try {
    const { upload: uploadConfig } = configUtil.getConfig();
    const upload = createUploadQiNiu(uploadConfig.qiNiu);

    return upload(img);
  } catch (e) {
    console.log('缺少config.json配置文件');
    return Promise.reject(e);
  }
}

// todo 上传前压缩图片
async function uploadBufferImage(buffer) {
  const { compressImage: needCompress } = configUtil.getConfig();
  const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const folder = path.resolve(__dirname, '../tmp/');
  const filePath = `${folder}/${fileName}.png`;

  await fs.writeFile(filePath, buffer); // 创建临时本地文件
  // 图片压缩为同名图片
  if (needCompress) {
    await compressImage(filePath, folder);
  }
  const url = await qiNiuUpload(filePath); // 上传到七牛

  await fs.unlinkSync(filePath); // 删除临时文件
  return url;
}

module.exports = {
  uploadBufferImage,
};
