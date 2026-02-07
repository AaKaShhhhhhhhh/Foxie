/* global process */

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
function getTextFromContentParts(parts) {
  if (!Array.isArray(parts)) return '';
  return parts
    .map((p) => (p && p.type === 'text' && typeof p.text === 'string' ? p.text : ''))
    .join('');
}

async function readJsonBody(req) {
  return await new Promise((resolve, reject) => {
    let body = '';
    const maxBodyBytes = 1024 * 1024
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > maxBodyBytes) {
        const err = new Error('Request body too large')
        err.code = 'BODY_TOO_LARGE'
        req.destroy()
        reject(err)
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function tamboAskProxyPlugin(env) {
  const key = env.TAMBO_API_KEY || '';
  const threadId = env.TAMBO_THREAD_ID || '';
  const baseUrl = env.TAMBO_API_BASE_URL || env.TAMBO_API_ENDPOINT || 'https://api.tambo.co';

  async function handler(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, x-api-key');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (req.method !== 'POST') return next();

    if (!key || !threadId) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'Missing TAMBO_API_KEY/TAMBO_THREAD_ID (see .env.example)',
        })
      );
      return;
    }

    try {
      const body = await readJsonBody(req);
      const message = typeof body?.message === 'string' ? body.message : '';
      const additionalContext = body?.context && typeof body.context === 'object' ? body.context : undefined;

      const endpoint = `${String(baseUrl).replace(/\/$/, '')}/threads/${encodeURIComponent(threadId)}/advance`;
      const upstreamBody = {
        messageToAppend: {
          role: 'user',
          content: [{ type: 'text', text: message }],
          ...(additionalContext ? { additionalContext } : {}),
        },
      };

      const upstream = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
          'x-api-key': key,
        },
        body: JSON.stringify(upstreamBody),
      });

      const raw = await upstream.text();
      let json = null;
      try {
        json = raw ? JSON.parse(raw) : null;
      } catch (parseErr) {
        json = { parseError: String(parseErr), raw };
      }

      if (!upstream.ok) {
        res.statusCode = upstream.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: upstream.statusText, data: json }));
        return;
      }

      const text = getTextFromContentParts(json?.responseMessageDto?.content);
      const normalized = {
        choices: [{ message: { content: text || '[no text content in Tambo response]' } }],
        raw: json,
      };

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(normalized));
    } catch (err) {
      res.statusCode = err?.code === 'BODY_TOO_LARGE' ? 413 : 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: String(err) }));
    }
  }

  return {
    name: 'tambo-ask-proxy',
    configureServer(server) {
      server.middlewares.use('/ask', handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/ask', handler);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tamboAskProxyPlugin(env)],
  };
});
