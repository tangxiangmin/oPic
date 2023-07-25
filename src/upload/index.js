const fs = require('fs-extra');
const path = require('path');

const webp=require('webp-converter');

// const imageMin = require('imagemin');
// const imageJPEG = require('imagemin-jpegtran');
// const imagePNG = require('imagemin-pngquant');

const createUploadQiNiu = require('./qiniu');
const configUtil = require('../util/config');

// 图片压缩
async function compressImage(filePath, destination) {
  const {dir,name} = path.parse(filePath)
  const target =dir + '/' + name + '.webp'
  await webp.cwebp(filePath, target,"-q 80",logging="-v");
  return target
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

async function uploadBufferImage(buffer) {
  const { compressImage: needCompress } = configUtil.getConfig();
  const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const folder = path.resolve(__dirname, '../tmp/');
  await fs.ensureDir(folder)
  let filePath = `${folder}/${fileName}.png`;

  await fs.writeFile(filePath, buffer); // 创建临时本地文件
  // 图片压缩为同名图片
  if (needCompress) {
   filePath = await compressImage(filePath, folder);
  }
  const url = await qiNiuUpload(filePath); // 上传到七牛

  await fs.unlinkSync(filePath); // 删除临时文件
  return url;
}

module.exports = {
  uploadBufferImage,
};
