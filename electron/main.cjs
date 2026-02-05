const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');

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

  const indexHtml = path.join(__dirname, '..', 'dist', 'index.html');
  const startUrl = process.env.ELECTRON_START_URL;
  win.loadURL(startUrl || `file://${indexHtml}`);

  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools({ mode: 'right' });
  }

  return win;
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  ipcMain.handle('ping', async () => 'pong');

  // LLM proxy handler - simple fetch using environment LLM_API_KEY
  ipcMain.handle('invoke-llm', async (_ev, payload) => {
    const key = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || '';
    if (!key) return { error: 'LLM API key not configured on host' };
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model: payload.model || 'gpt-4o-mini', messages: [{ role: 'user', content: payload.prompt }], max_tokens: 512 }),
      });
      const json = await res.json();
      return { data: json };
    } catch (err) {
      return { error: String(err) };
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
