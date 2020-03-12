
const fs = require('fs-extra');
const path = require('path');

const defaultConfig = {
  autoMarkdown: true, // 复制url格式自动转markdown
  compressImage: true, // 上传前压缩图片
  upload: {
    qiNiu: {
      accessKey: '',
      secretKey: '',
      bucket: '',
      host: '',
    },
  },
};

const configFile = '../config.json';
// 获取配置
function getConfig() {
  try {
    // eslint-disable-next-line global-require,import/no-dynamic-require
    return require(configFile);
  } catch (e) {
    return defaultConfig;
  }
}
// 保存配置
function saveConfig(config) {
  const fileName = path.resolve(__dirname, configFile);
  return fs.writeFile(fileName, JSON.stringify(config));
}

module.exports = {
  getConfig,
  saveConfig,
};
