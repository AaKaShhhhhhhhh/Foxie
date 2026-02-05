// Lightweight LLM wrapper for the browser (Vite).
export type LLMResponse = { text: string; data?: any };

type LLMProvider = 'openai' | string;

const provider = (import.meta.env.VITE_LLM_PROVIDER || 'openai') as LLMProvider;
const key = (import.meta.env.VITE_LLM_API_KEY || import.meta.env.VITE_OPENAI_API_KEY || '') as string;
const baseUrl = (import.meta.env.VITE_LLM_BASE_URL || 'https://api.openai.com/v1') as string;

export async function callLLM(prompt: string, options: any = {}): Promise<LLMResponse> {
  if (!key) {
    console.warn('LLM API key not set. Returning canned response.');
    return { text: `Echo: ${prompt}` };
  }

  if (provider === 'openai') {
    try {
      const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: options.model || 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 512,
        }),
      });

      const json = await res.json();
      const text = json?.choices?.[0]?.message?.content || JSON.stringify(json);
      return { text, data: json };
    } catch (error) {
      console.error('LLM request failed:', error);
      return { text: `Echo: ${prompt}` };
    }
  }

  // Fallback
  return { text: `Echo: ${prompt}` };
}
