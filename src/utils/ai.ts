// Lightweight LLM wrapper for the browser (Vite).
export type LLMResponse = { text: string; data?: any };

type LLMProvider = 'openai' | string;

const provider = (import.meta.env.VITE_LLM_PROVIDER || 'openai') as LLMProvider;
const key = (import.meta.env.VITE_TAMBO_API_KEY || import.meta.env.VITE_OPENAI_API_KEY || '') as string;
const baseUrl = (import.meta.env.VITE_TAMBO_API_ENDPOINT || import.meta.env.VITE_LLM_BASE_URL || 'https://api.tambo.ai/v1') as string;

export async function callLLM(prompt: string, options: any = {}): Promise<LLMResponse> {
  if (!key) {
    console.warn('LLM API key not set. Returning canned response.');
    return { text: `Echo: ${prompt}` };
  }

  const currentProvider = import.meta.env.VITE_LLM_PROVIDER || 'tambo';

  try {
    const endpoint = `${baseUrl.replace(/\/$/, '')}/chat/completions`;
    
    const body = {
      model: options.model || (currentProvider === 'tambo' ? 'gpt-5.2' : 'gpt-4o-mini'),
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
      temperature: 0.7,
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

    // OpenAI and Tambo proxy should both return choices format
    const text = json?.choices?.[0]?.message?.content || json?.response || JSON.stringify(json);
    
    return { text, data: json };
  } catch (error) {
    console.error('LLM request failed:', error);
    return { text: `Echo: ${prompt}` };
  }
}
