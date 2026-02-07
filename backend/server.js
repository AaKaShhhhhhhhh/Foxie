import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const inFlight = new Set();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const TAMBO_API_KEY = process.env.TAMBO_PROJECT_API_KEY;
const TAMBO_API_ENDPOINT = process.env.TAMBO_API_ENDPOINT || 'https://api.tambo.co';

if (!TAMBO_API_KEY) {
  console.error("TAMBO_PROJECT_API_KEY is not set in .env");
  process.exit(1);
}

// Endpoint to handle asking Tambo
app.post('/api/ask', async (req, res) => {
    const { message, threadId: providedThreadId } = req.body;

    // Simple lock to prevent concurrent requests
    const lockKey = providedThreadId || req.ip;
    if (inFlight.has(lockKey)) {
        console.warn(`Request locked for ${lockKey} - ignoring concurrent.`);
        return res.status(429).json({ error: "Request in progress" });
    }
    inFlight.add(lockKey);

    try {
      if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    let threadId = providedThreadId;

    // 1. Create a thread if no threadId is provided
    if (!threadId) {
      console.log('Creating new thread...');
      const createThreadResponse = await fetch(`${TAMBO_API_ENDPOINT}/threads`, {
        method: 'POST',
        headers: {
          'x-api-key': TAMBO_API_KEY,
          
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            projectId: process.env.TAMBO_PROJECT_ID
        })
      });

      if (!createThreadResponse.ok) {
        const errorText = await createThreadResponse.text();
        console.error('Failed to create thread:', createThreadResponse.status, errorText);
        return res.status(createThreadResponse.status).json({ error: 'Failed to create thread', details: errorText });
      }

      const threadData = await createThreadResponse.json();
      threadId = threadData.id;
      console.log('Created thread:', threadId);
    }

    // 2. Send message to the thread using advancestream
    const bodyPayload = {
  messageToAppend: {
    role: 'user',
    content: [{ type: 'text', text: message }],
  },
  // optional but useful for optimistic UI / logging:
  // userMessageText: message,
};
    
    // REMOVED: Relying on Tambo project default model to avoid "Error in streaming response"
    // bodyPayload.model = req.body.model || 'gpt-5.2';

    console.log(`Sending message to thread ${threadId} via advancestream...`);
    const advanceResponse = await fetch(`${TAMBO_API_ENDPOINT}/threads/${threadId}/advancestream`, {
      method: 'POST',
      headers: {
        'x-api-key': TAMBO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyPayload)
    });
    
    // Log the actual body we sent for debugging
    console.log('Sent body to advancestream:', JSON.stringify(bodyPayload));

    console.log("Tambo response status:", advanceResponse.status);
    console.log("Tambo response type:", advanceResponse.headers.get("content-type"));
    console.log("Advance status:", advanceResponse.status);
    console.log("Advance headers:", Object.fromEntries(advanceResponse.headers.entries()));

    if (!advanceResponse.ok) {
        const errorText = await advanceResponse.text();
        console.error('Failed to advance thread:', advanceResponse.status, errorText);
        return res.status(advanceResponse.status).json({ error: 'Failed to get response from Tambo', details: errorText });
    }
    
    // Stream reading to capture all events
    let textBuffer = "";
    console.log('--- Starting Stream Read ---');
    try {
        for await (const chunk of advanceResponse.body) {
            const str = chunk.toString();
            console.log('Stream chunk:', str);
            textBuffer += str;
        }
    } catch (streamErr) {
        console.error('Error reading stream:', streamErr);
    }
    console.log('--- End Stream Read ---');
    
    console.log('Total raw stream buffer length:', textBuffer.length);

    // Check for explicit streaming errors in the buffer
    if (textBuffer.includes("error: Error in streaming response")) {
        console.error("Tambo Stream Error detected in buffer:", textBuffer);
        return res.status(502).json({
            error: "Tambo streaming failed",
            details: textBuffer.slice(0, 500),
            threadId,
        });
    }


console.log("FULL SSE RAW:\n", textBuffer);
    // console.log('Received raw stream buffer:', textBuffer);

    // Naive parsing for SSE-style JSON or plain text
    // Often streaming endpoints return multiple JSON objects or raw text.
    // If Tambo returns SSE events like "data: {...}", we need to parse.
    // Let's assume for now we can just return the raw buffer if it's not standard JSON, 
    // or try to find the last "content" if it's a sequence of JSONs.
    
    // Simplest approach for "advancestream" -> just pass it back or try to extract text.
    // Given we need to return JSON to our frontend:
    
    let fullText = "";
    
    // Attempt to parse SSE events if present
    const lines = textBuffer.split('\n');
    const messageMap = new Map(); // id -> text
    let additiveText = "";

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
            try {
                const jsonStr = trimmed.substring(6).trim();
                if (jsonStr === '[DONE]') continue;
                
                const data = JSON.parse(jsonStr);
                
                // Tambo specific structure: responseMessageDto.content or component.message
                // These are often cumulative updates for a specific message ID.
                const dto = data.responseMessageDto;
                const messageId = dto?.id || data.id;
                
                let currentChunkText = "";
                if (dto?.content && Array.isArray(dto.content)) {
                    currentChunkText = dto.content.map(c => c.text || "").join("");
                } else if (data.component?.message) {
                    currentChunkText = data.component.message;
                }

                if (messageId && currentChunkText) {
                    // Update the latest content for this message ID (cumulative)
                    messageMap.set(messageId, currentChunkText);
                } else {
                    // Fallback to additive parsing for delta streams
                    const deltaText = data.text || data.content || data.delta?.content;
                    if (deltaText) {
                        additiveText += deltaText;
                    }
                }
            } catch (e) {
                // Ignore parse errors for intermediate or malformed chunks
            }
        }
    }

    // Combine cumulative message contents with any additive deltas
    fullText = Array.from(messageMap.values()).join("") + additiveText;

    // If no SSE parsing worked (maybe it's not SSE but just chunked text), use the whole buffer
    if (!fullText && textBuffer.length > 0) {
         // Fallback: it might be just text or a single JSON
         try {
             const data = JSON.parse(textBuffer);
             fullText = data.text || data.content || data.message || JSON.stringify(data);
         } catch {
             fullText = textBuffer;
         }
    }

    const assistantMessage = fullText.trim() || "I received a response but couldn't parse it.";

    res.json({
      response: assistantMessage,
      threadId: threadId,
      fullResponse: { raw: textBuffer.substring(0, 200) + "..." } // Debug info
    });

  } catch (error) {
    console.error('Error in /api/ask:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  } finally {
      const lockKey = req.body.threadId || req.ip;
      inFlight.delete(lockKey);
  }
});

// ==================== SEARCH TOOLS ====================

import { webSearch } from './tools/webSearch.js';
import { youtubeSearch } from './tools/youtubeSearch.js';

/**
 * Web Search Endpoint
 * POST /api/tools/web_search
 * Body: { query: string }
 */
app.post('/api/tools/web_search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    console.log('Web search request:', query);
    const results = await webSearch(query);
    res.json(results);
  } catch (error) {
    console.error('Web search error:', error);
    res.status(500).json({ error: 'Search failed', details: error.message });
  }
});

/**
 * YouTube Search Endpoint
 * POST /api/tools/youtube_search
 * Body: { query: string }
 */
app.post('/api/tools/youtube_search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    console.log('YouTube search request:', query);
    const result = await youtubeSearch(query);
    res.json(result);
  } catch (error) {
    console.error('YouTube search error:', error);
    res.status(500).json({ error: 'Search failed', details: error.message });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
