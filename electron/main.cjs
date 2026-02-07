const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

// Electron main doesn't automatically load Vite-style `.env.local` files.
function loadEnvFromProjectRoot() {
  const root = path.join(__dirname, '..');
  const dotenv = require('dotenv');

  for (const filename of ['.env', '.env.local']) {
    const envPath = path.join(root, filename);
    if (!fs.existsSync(envPath)) continue;

    dotenv.config({ path: envPath, override: true });
  }
}

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
  loadEnvFromProjectRoot();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  ipcMain.handle('ping', async () => 'pong');

  // LLM proxy handler - simple fetch using environment LLM_API_KEY
  ipcMain.handle('invoke-llm', async (_ev, payload) => {
    const provider = process.env.LLM_PROVIDER || process.env.VITE_LLM_PROVIDER || 'tambo';
    const sharedKey = process.env.LLM_API_KEY || process.env.VITE_LLM_API_KEY || '';
    const key =
      provider === 'openai'
        ? process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || sharedKey
        : process.env.TAMBO_API_KEY || process.env.VITE_TAMBO_API_KEY || sharedKey;

    if (!key) return { error: 'LLM API key not configured on host', errorCode: 'NO_API_KEY' };

    const sharedBaseUrl =
      process.env.LLM_API_ENDPOINT ||
      process.env.LLM_BASE_URL ||
      process.env.VITE_LLM_API_ENDPOINT ||
      process.env.VITE_LLM_BASE_URL ||
      '';

    const baseUrl =
      provider === 'openai'
        ? process.env.OPENAI_API_ENDPOINT || process.env.VITE_OPENAI_API_ENDPOINT || sharedBaseUrl || 'https://api.openai.com/v1'
        : process.env.TAMBO_API_ENDPOINT ||
          process.env.VITE_TAMBO_API_ENDPOINT ||
          sharedBaseUrl ||
          'https://api.tambo.ai/v1';

    try {
      const endpoint = `${String(baseUrl).replace(/\/$/, '')}/chat/completions`;

      const prompt = typeof payload?.prompt === 'string' ? payload.prompt : '';
      const rawMessages = Array.isArray(payload?.messages) ? payload.messages : null;
      const messages = rawMessages?.length
        ? rawMessages.filter(
            (m) =>
              m &&
              typeof m === 'object' &&
              typeof m.role === 'string' &&
              typeof m.content === 'string'
          )
        : [{ role: 'user', content: prompt }];

      const model =
        payload.model || (provider === 'openai' ? 'gpt-4o-mini' : 'gpt-5.2');

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model,
          messages,
          temperature: payload.temperature ?? 0.7,
          max_tokens: payload.max_tokens ?? 1024,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        return { error: `LLM request failed: ${res.status} ${res.statusText}`, data: json };
      }

      return { data: json };
    } catch (err) {
      return { error: String(err) };
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
