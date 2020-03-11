import { Menu, Tray, BrowserWindow } from 'electron';

const path = require('path');
const clipboard = require('electron').clipboard;

const { uploadBufferImage } = require('../upload');
const configUtil = require('../util/config');
const Util = require('../util/index');

const copyUrl = (url) => {
  const config = configUtil.getConfig();
  const text = config.autoMarkdown ? Util.createMarkdownImage(url) : url;

  clipboard.writeText(text);
  return text;
};

const uploadList = []; // 将已上传的图片保存在内存中 todo 保存到本地
// 根据剪切板图片创建menuItem
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
      uploadList.push({
        img,
        url,
      });
      copyUrl(url);
      Util.showNotify(`上传到七牛成功，链接${url}已经复制到剪切板`);
    });
  };
  return { label: '1',
    icon: img,
    type: 'normal',
    click: upload };
};

const createUploadItem = () => uploadList.map(({ img, url }, index) => {
  const handler = () => {
    const text = copyUrl(url);
    Util.showNotify(`链接${text}已经复制到剪切板`);
  };
  return { label: (index + 1).toString(),
    icon: img,
    type: 'normal',
    click: handler };
});

// 打开设置弹窗
let settingWindow;
const openSettingWindow = () => {
  settingWindow = new BrowserWindow({
    width: 600,
    height: 400,
  });

  const url = `file://${path.resolve(__dirname, './setting.html')}`;
  settingWindow.loadURL(url);
  // settingWindow.webContents.openDevTools();
  settingWindow.on('closed', () => { settingWindow = null; });
};

const saveMarkdownFlag = (item) => {
  const config = configUtil.getConfig();
  const { checked } = item;
  config.autoMarkdown = checked;

  configUtil.saveConfig(config);
};

// 创建顶部图标
const createTray = (app) => {
  const icon16 = path.resolve(__dirname, '../assets/icon16.png');
  const tray = new Tray(icon16);

  tray.setToolTip('oPic: upload fast');
  tray.setIgnoreDoubleClickEvents(true);

  tray.on('click', () => {
    const config = configUtil.getConfig();
    const more = {
      label: '更多',
      type: 'submenu',
      submenu: [
        { label: '退出', type: 'normal', click: () => { app.quit(); } },
      ],
    };
    const template = [
      { label: '待上传', type: 'normal', enabled: false },
      { label: '', type: 'separator' },
      { label: '已上传', type: 'normal', enabled: false },
      { label: '', type: 'separator' },
      { label: 'markdown图片格式', type: 'checkbox', checked: config.autoMarkdown, click: saveMarkdownFlag },
      { label: '偏好设置', type: 'normal', click: openSettingWindow },
      more,
    ];

    const getIndexByLabel = (label) => {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < template.length; ++i) {
        if (template[i].label === label) return i;
      }
      return -1;
    };

    // 如果剪切板中有图片，则添加到待上传列表
    const imageItem = createClipboardImageItem();
    if (imageItem) {
      const todoInsertIdx = getIndexByLabel('待上传') + 1; // 在separator插入图片上传
      template.splice(todoInsertIdx, 0, imageItem);
    }

    if (uploadList && uploadList.length) {
      const uploadInsertIdx = getIndexByLabel('已上传') + 1; // 在separator插入图片上传
      const list = createUploadItem();
      template.splice(uploadInsertIdx, 0, ...list);
    }

    // 创建
    const contextMenu = Menu.buildFromTemplate(template);
    tray.popUpContextMenu(contextMenu);
  });
};

// eslint-disable-next-line import/prefer-default-export
export { createTray };
