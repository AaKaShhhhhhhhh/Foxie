// Lightweight LLM wrapper. Configure `LLM_API_KEY` and `LLM_PROVIDER` in env.
export type LLMResponse = { text: string; data?: any };

const provider = process.env.LLM_PROVIDER || 'openai';
const key = process.env.LLM_API_KEY || '';

export async function callLLM(prompt: string, options: any = {}): Promise<LLMResponse> {
  // Placeholder implementation. Replace with real provider SDK calls.
  if (!key) {
    console.warn('LLM API key not set. Returning canned response.');
    return { text: `Echo: ${prompt}` };
  }

  if (provider === 'openai') {
    // Minimal fetch example (user must set OPENAI-compatible endpoint)
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ model: options.model || 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 512 }),
    });
    const json = await res.json();
    const text = json?.choices?.[0]?.message?.content || JSON.stringify(json);
    return { text, data: json };
  }

  // Fallback
  return { text: `Echo: ${prompt}` };
}
