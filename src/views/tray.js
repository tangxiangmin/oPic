import { Menu, Tray, Notification } from 'electron';

const clipboard = require('electron').clipboard;

const { uploadBufferImage } = require('../upload');
const path = require('path');

const showNotify = (msg) => {
  const notify = new Notification({ title: '通知', body: msg });
  notify.show();
};

// 返回图片的markdown形式
const createMarkdownImage = url => `![](${url})`;

const createClipboardImageItem = () => {
  const clipboardImage = clipboard.readImage();
  if (!clipboardImage || clipboardImage.isEmpty()) return null;
  const radio = clipboardImage.getAspectRatio();
  const img = clipboardImage.resize({
    width: 100,
    height: radio / 100,
  });

  const upload = () => {
    const buffer = clipboardImage.toPNG();
    uploadBufferImage(buffer).then((url) => {
      showNotify(`上传到七牛成功，链接${url}已经复制到剪切板`);
      const markdownUrl = createMarkdownImage(url);
      clipboard.writeText(markdownUrl);
    });
  };
  return { label: '1',
    icon: img,
    type: 'normal',
    click: upload };
};

const createTray = () => {
  const icon16 = path.resolve(__dirname, '../assets/icon16.png');
  const tray = new Tray(icon16);

  tray.setToolTip('oPic: upload fast');
  tray.setIgnoreDoubleClickEvents(true);
  tray.on('click', () => {
    const insertIdx = 2; // 在separator插入图片上传
    const template = [
      { label: '待上传', type: 'normal', enabled: false },
      { label: '', type: 'separator' },
      { label: 'markdown图片格式', type: 'checkbox', checked: true },
      {
        label: '更多',
        type: 'submenu',
        submenu: [
          { label: '偏好设置', type: 'radio' },
        ],
      },
    ];

    // 如果剪切板中有图片，则添加到待上传列表
    const imageItem = createClipboardImageItem();
    if (imageItem) {
      template.splice(insertIdx, 0, imageItem);
    }

    // 创建
    const contextMenu = Menu.buildFromTemplate(template);
    tray.popUpContextMenu(contextMenu);
  });
};

// eslint-disable-next-line import/prefer-default-export
export { createTray };
