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
    req.on('data', (chunk) => {
      body += chunk;
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
  const key = env.TAMBO_PROJECT_API_KEY || env.TAMBO_API_KEY || '';
  const threadId = env.TAMBO_THREAD_ID || '';
  const baseUrl = env.TAMBO_API_BASE_URL || env.TAMBO_API_ENDPOINT || 'https://api.tambo.co';

  async function handler(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
      const contextKey = typeof body?.contextKey === 'string' ? body.contextKey : undefined;
      const additionalContext = body?.context && typeof body.context === 'object' ? body.context : undefined;

      const endpoint = `${String(baseUrl).replace(/\/$/, '')}/threads/${encodeURIComponent(threadId)}/advance`;
      const upstreamBody = {
        ...(contextKey ? { contextKey } : {}),
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
      const json = raw ? JSON.parse(raw) : null;

      if (!upstream.ok) {
        res.statusCode = upstream.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: upstream.statusText, data: json }));
        return;
      }

      const text = getTextFromContentParts(json?.responseMessageDto?.content);
      const normalized = {
        choices: [{ message: { content: text || JSON.stringify(json) } }],
        raw: json,
      };

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(normalized));
    } catch (err) {
      res.statusCode = 500;
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
