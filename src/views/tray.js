const { Menu, Tray, BrowserWindow } = require('electron');

const path = require('path');

const configUtil = require('../util/config');
const { createClipboardImageItem, createUploadItem, clearRecordList } = require('./menuItem');

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
  settingWindow.on('closed', () => {
    settingWindow = null;
  });
};

// 保存开关
const saveConfig = (key, item) => {
  const config = configUtil.getConfig();
  const { checked } = item;
  config[key] = checked;

  configUtil.saveConfig(config);
};

// 创建顶部图标
const createTray = (app) => {
  const icon16 = path.resolve(__dirname, '../assets/upload@3x.png');
  const tray = new Tray(icon16);

  tray.setToolTip('oPic: upload simplify');
  tray.setIgnoreDoubleClickEvents(true);

  tray.on('click', () => {
    const config = configUtil.getConfig();
    const more = {
      label: '更多',
      type: 'submenu',
      submenu: [
        {
          label: '退出', type: 'normal', click: () => {
            app.quit();
          }
        },
      ],
    };
    const template = [
      { label: '待上传', type: 'normal', enabled: false },
      { label: '', type: 'separator' },
      { label: '已上传', type: 'normal', enabled: false },
      { label: '', type: 'separator' },
      {
        label: 'markdown图片格式',
        type: 'checkbox',
        checked: config.autoMarkdown,
        click: saveConfig.bind(null, 'autoMarkdown')
      },
      {
        label: '上传前压缩图片',
        type: 'checkbox',
        checked: config.compressImage,
        click: saveConfig.bind(null, 'compressImage')
      },
      { label: '图床设置', type: 'normal', click: openSettingWindow },
      { label: '清除图片记录', type: 'normal', click: clearRecordList },
      more,
    ];

    const getIndexByLabel = label => template.map(item => item.label)
      .indexOf(label);

    // 如果剪切板中有图片，则添加到待上传列表
    const clipboardImageList = createClipboardImageItem();
    if (clipboardImageList && clipboardImageList.length) {
      const todoInsertIdx = getIndexByLabel('待上传') + 1; // 在separator插入待上传图片
      template.splice(todoInsertIdx, 0, ...clipboardImageList);
    }

    // 如果有历史上传记录，则把相关记录展示
    const uploadImageList = createUploadItem();
    if (uploadImageList && uploadImageList.length) {
      const uploadInsertIdx = getIndexByLabel('已上传') + 1; // 在separator插入已上传图片
      template.splice(uploadInsertIdx, 0, ...uploadImageList);
    }

    // 创建contextMenu并弹出
    const contextMenu = Menu.buildFromTemplate(template);
    tray.popUpContextMenu(contextMenu);
  });
  return tray;
};

// eslint-disable-next-line import/prefer-default-export
module.exports = { createTray };
