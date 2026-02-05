import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    transparent: true,
    frame: false,
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const url = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, '../dist/index.html')}`;
  win.loadURL(url);

  // Open devtools in development
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools({ mode: 'right' });
  }

  return win;
}

app.whenReady().then(() => {
  const w = createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Example IPC: ping
  ipcMain.handle('ping', async () => 'pong');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
