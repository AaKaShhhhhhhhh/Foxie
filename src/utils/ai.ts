// Lightweight LLM wrapper for the browser (Vite).
export type LLMResponse = { text: string; data?: any };

const provider = (import.meta.env.VITE_LLM_PROVIDER || 'tambo') as string;
const proxyUrl = (import.meta.env.VITE_LLM_PROXY_URL || '/ask') as string;

const openaiKey = (import.meta.env.VITE_OPENAI_API_KEY || '') as string;
const openaiBaseUrl = (import.meta.env.VITE_LLM_BASE_URL || 'https://api.openai.com/v1') as string;

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
        context: options.context,
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

  if (provider === 'tambo') {
    try {
      const res = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, context: options.context }),
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

      const text =
        json?.choices?.[0]?.message?.content || json?.response || JSON.stringify(json);

      return { text, data: json };
    } catch (error) {
      console.error('LLM request failed:', error);
      return { text: `Echo: ${prompt}` };
    }
  }

  if (provider !== 'openai') {
    console.warn(`Unsupported LLM provider: ${provider}. Returning canned response.`);
    return { text: `Echo: ${prompt}` };
  }

  if (!openaiKey) {
    console.warn('LLM API key not set. Returning canned response.');
    return { text: `Echo: ${prompt}` };
  }

  try {
    const endpoint = `${openaiBaseUrl.replace(/\/$/, '')}/chat/completions`;
    
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
        Authorization: `Bearer ${openaiKey}`,
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
