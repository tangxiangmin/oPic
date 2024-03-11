const { app, Menu } = require('electron');
const { createTray } = require('./views/tray');

if (require('electron-squirrel-startup')) {
  app.quit();
}

let tray;

const createGlobalTray = () => {
  tray = createTray(app);
};

app.on('ready', () => {
  createGlobalTray();
  // 隐藏dock图标
  Menu.setApplicationMenu(null);
  if (app.dock && app.dock.hide) {
    app.dock.hide();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (!tray) {
    createGlobalTray();
  }
});
