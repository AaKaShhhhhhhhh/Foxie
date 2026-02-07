const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

function getTextFromContentParts(parts) {
  if (!Array.isArray(parts)) return '';
  return parts
    .map((p) => (p && p.type === 'text' && typeof p.text === 'string' ? p.text : ''))
    .join('');
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
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  ipcMain.handle('ping', async () => 'pong');

  // LLM proxy handler - simple fetch using environment LLM_API_KEY
  ipcMain.handle('invoke-llm', async (_ev, payload) => {
    try {
      const prompt = typeof payload?.prompt === 'string' ? payload.prompt : '';
      const provider = process.env.LLM_PROVIDER || 'tambo';

      if (provider === 'openai') {
        const key = process.env.OPENAI_API_KEY || process.env.LLM_API_KEY || '';
        if (!key) return { error: 'LLM API key not configured on host' };

        const baseUrl = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';
        const endpoint = `${String(baseUrl).replace(/\/$/, '')}/chat/completions`;

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

        const model = payload.model || 'gpt-4o-mini';

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
      }

      const key =
        process.env.TAMBO_API_KEY ||
        process.env.LLM_API_KEY ||
        '';

      if (!key) return { error: 'LLM API key not configured on host' };

      const threadId = process.env.TAMBO_THREAD_ID || '';
      if (!threadId) return { error: 'TAMBO_THREAD_ID not configured on host' };

      const baseUrl =
        process.env.TAMBO_API_BASE_URL ||
        process.env.TAMBO_API_ENDPOINT ||
        'https://api.tambo.co';
      const endpoint = `${String(baseUrl).replace(/\/$/, '')}/threads/${encodeURIComponent(threadId)}/advance`;

      const additionalContext =
        payload?.context && typeof payload.context === 'object' ? payload.context : undefined;

      const body = {
        messageToAppend: {
          role: 'user',
          content: [{ type: 'text', text: prompt }],
          ...(additionalContext ? { additionalContext } : {}),
        },
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
          'x-api-key': key,
        },
        body: JSON.stringify(body),
      });

      const raw = await res.text();
      let json = null;
      try {
        json = raw ? JSON.parse(raw) : null;
      } catch (parseErr) {
        json = { parseError: String(parseErr), raw };
      }

      if (!res.ok) {
        return { error: `LLM request failed: ${res.status} ${res.statusText}`, data: json };
      }

      const text = getTextFromContentParts(json?.responseMessageDto?.content);
      const normalized = {
        choices: [{ message: { content: text || '[no text content in Tambo response]' } }],
        raw: json,
      };

      return { data: normalized };
    } catch (err) {
      return { error: String(err) };
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
