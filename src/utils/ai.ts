/// <reference types="vite/client" />
// Lightweight LLM wrapper for the browser (Vite).
export type LLMResponse = { text: string; data?: any };

const provider = (import.meta.env.VITE_LLM_PROVIDER || 'tambo') as string;
const key = (
  import.meta.env.VITE_TAMBO_API_KEY ||
  import.meta.env.VITE_OPENAI_API_KEY ||
  ''
) as string;
const baseUrl = (
  import.meta.env.VITE_TAMBO_API_ENDPOINT ||
  import.meta.env.VITE_LLM_BASE_URL ||
  (provider === 'openai' ? 'https://api.openai.com/v1' : 'https://api.tambo.ai/v1')
) as string;

// Module-level persistence for Tambo
let tamboThreadId: string | null = null;
let tamboInFlight = false;

export async function callLLM(prompt: string, options: any = {}): Promise<LLMResponse> {
  const electronInvoke = (globalThis as any)?.electron?.invokeLLM as
    | undefined
    | ((payload: any) => Promise<any>);

  // 1. Handle Electron environment (if applicable)
  if (electronInvoke) {
    try {
      const result = await electronInvoke({
        prompt,
        model: options.model,
        messages: options.messages,
        temperature: options.temperature,
        max_tokens: options.max_tokens,
      });

      if (result?.error) {
        console.error('LLM request failed:', result.error);
        return { text: `Echo: ${prompt}`, data: result };
      }

      const json = result?.data ?? result;
      const text =
        json?.choices?.[0]?.message?.content || json?.response || JSON.stringify(json);

      return { text, data: json };
    } catch (error) {
      console.error('LLM request failed:', error);
      return { text: `Echo: ${prompt}` };
    }
  }

  // 2. Tambo handling via local backend
  if (provider === 'tambo') {
    if (tamboInFlight) {
        console.log("Foxie is thinking... ignoring overlapping request.");
        return { text: "", data: { skipped: true, reason: "in_flight" } };
    }
    tamboInFlight = true;

    try {
        const res = await fetch('/api/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: prompt, 
                threadId: tamboThreadId 
                // model is intentionally omitted to use Tambo project defaults
            })
        });
        
        if (!res.ok) {
            const errText = await res.text();
            console.error("Backend request failed:", res.status, errText);
            
            if (res.status === 502) {
                return { text: "Foxie couldn't reach her AI brain right now. 😵", data: { error: errText, status: 502 } };
            }
            
            return { text: `Error: ${res.statusText}`, data: { error: errText, status: res.status } };
        }
        
        const json = await res.json();
        
        // Persist threadId for the next call
        if (json.threadId) {
            tamboThreadId = json.threadId;
        }

        if (json.error) {
             return { text: `Error: ${json.error}`, data: json };
        }
        
        return { text: json.response || "No response text found", data: json };
    } catch (err) {
        console.error("Backend request failed", err);
        return { text: `Error: Could not connect to Foxie backend.` };
    } finally {
        tamboInFlight = false;
    }
  }

  // 3. Fallback to OpenAI direct call (if configured)
  if (!key) {
    console.warn('LLM API key not set. Returning canned response.');
    return { text: prompt };
  }

  try {
    const endpoint = `${baseUrl.replace(/\/$/, '')}/chat/completions`;
    
    const body = {
      model: options.model || 'gpt-4o-mini',
      messages: options.messages || [{ role: 'user', content: prompt }],
      max_tokens: options.max_tokens ?? 1024,
      temperature: options.temperature ?? 0.7,
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
    });

    const raw = await res.text();
    let json: any = null;
    try {
      json = raw ? JSON.parse(raw) : null;
    } catch {
      json = { raw };
    }

    if (!res.ok) {
      console.error('LLM request failed:', res.status, res.statusText, json);
      return { text: `Error: ${res.status}`, data: json };
    }

    const text = json?.choices?.[0]?.message?.content || json?.response || JSON.stringify(json);
    return { text, data: json };
  } catch (error) {
    console.error('LLM request failed:', error);
    return { text: `Error occurred during request.` };
  }
}


