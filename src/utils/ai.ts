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

export async function callLLM(prompt: string, options: any = {}): Promise<LLMResponse> {
  const electronInvoke = (globalThis as any)?.electron?.invokeLLM as
    | undefined
    | ((payload: any) => Promise<any>);

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


  // Use local backend for Tambo integration
  // This is the ONLY path for Tambo now, as direct browser calls are not supported/secure
  if (provider === 'tambo') {
    try {
        const res = await fetch('http://localhost:3001/api/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: prompt, model: options.model })
        });
        
        if (!res.ok) {
            const errText = await res.text();
             console.error("Backend request failed:", res.status, errText);
             return { text: `Error: ${res.statusText} - ${errText}` };
        }
        
        const json = await res.json();
        if (json.error) {
             return { text: `Error from Tambo: ${json.error} - ${json.details || ''}` };
        }
        
        return { text: json.response || "No response text found", data: json };
    } catch (err) {
        console.error("Backend request failed", err);
        return { text: `Error: Could not connect to Foxie backend. Is it running?` };
    }
  }

  // Fallback to OpenAI direct call (if configured)
  if (!key) {
    console.warn('LLM API key not set. Returning canned response.');
    return { text: `Echo: ${prompt}` };
  }

  try {
    const endpoint = `${baseUrl.replace(/\/$/, '')}/chat/completions`;
    
    const body = {
      model: options.model || 'gpt-5.2',
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
      return { text: `Echo: ${prompt}`, data: json };
    }

    const text = json?.choices?.[0]?.message?.content || json?.response || JSON.stringify(json);
    return { text, data: json };
  } catch (error) {
    console.error('LLM request failed:', error);
    return { text: `Echo: ${prompt}` };
  }
}

