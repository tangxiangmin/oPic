const { clipboard } = require('electron');

const uploadList = []; // 将已上传的图片保存在内存中 todo 保存到本地
const clipboardImageList = []; // 保存最近未上传的图片

const { uploadBufferImage } = require('../upload');
const configUtil = require('../util/config');
const Util = require('../util/index');

// 复制URL
const copyUrl = (url) => {
  const config = configUtil.getConfig();
  const text = config.autoMarkdown ? Util.createMarkdownImage(url) : url;

  clipboard.writeText(text);
  return text;
};

const addToImageList = (list, item, maxTempImageLength = 3) => {
  list.unshift(item);
  // 超过最大长度则移除
  if (list.length > maxTempImageLength) {
    list.pop();
  }
};
const removeFromClipboardList = (img) => {
  const idx = clipboardImageList.map(item => item.img).indexOf(img);
  if (idx > -1) {
    clipboardImageList.splice(idx, 1);
  }
};

// 根据剪切板图片创建menuItem
const createClipboardImageItem = () => {
  const clipboardImage = clipboard.readImage();
  // 剪切板如果有数据，则保存到clipboardImageList中
  if (clipboardImage && !clipboardImage.isEmpty()) {
    const radio = clipboardImage.getAspectRatio();
    const img = clipboardImage.resize({
      width: 100,
      height: radio / 100,
    });

    // 将图片暂存在clipboardImageList中
    addToImageList(clipboardImageList, { img, raw: clipboardImage }, 1);
  }

  return clipboardImageList.map((row, index) => {
    const { raw, img } = row;
    // 点击事件
    const upload = () => {
      const buffer = raw.toPNG();
      uploadBufferImage(buffer)
        .then((url) => {
          // 更新列表
          addToImageList(uploadList, { img, url });
          removeFromClipboardList(img);

          // 自动复制url
          copyUrl(url);
          Util.showNotify(`上传到七牛成功，链接${url}已经复制到剪切板`);
        })
        .catch((e) => {
          console.log(e);
          Util.showNotify('图片上传失败');
        });
    };
    return {
      label: (index + 1).toString(),
      icon: row.img,
      type: 'normal',
      click: upload
    };
  });
};

// 创建已上传的图片记录
const createUploadItem = () => uploadList.map(({ img, url }, index) => {
  const handler = () => {
    const text = copyUrl(url);
    Util.showNotify(`链接${text}已经复制到剪切板`);
  };
  return {
    label: (index + 1).toString(),
    icon: img,
    type: 'normal',
    click: handler
  };
});

// 清空列表
const clearRecordList = () => {
  uploadList.splice(0, uploadList.length);
  clipboardImageList.splice(0, clipboardImageList.length);
};


module.exports = {
  createClipboardImageItem,
  createUploadItem,
  clearRecordList,
};
