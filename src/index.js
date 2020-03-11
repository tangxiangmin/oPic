import { app, Menu } from 'electron';
import { createTray } from './views/tray';

if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

app.on('ready', () => {
  createTray(app);
  // 隐藏dock图标
  Menu.setApplicationMenu(null);
  app.dock.hide();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
