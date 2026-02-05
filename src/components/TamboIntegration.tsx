import React, { useEffect, useState } from 'react';
import { lookupByIntent } from '../tambo/registry';
import { callLLM } from '../utils/ai';

type Suggestion = { intent: string; label: string; actions?: string[] };

export default function TamboIntegration({ appState }: { appState: any }) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    // Example: ask LLM to infer intent from appState
    let mounted = true;
    (async () => {
      const prompt = `Given this state: ${JSON.stringify(appState)}, suggest up to 3 user intents and short labels.`;
      const res = await callLLM(prompt, { model: 'gpt-4o-mini' });
      if (!mounted) return;
      // naive parse: split lines
      const lines = res.text.split('\n').slice(0, 3);
      const suggs = lines.map((l, i) => ({ intent: `inferred.intent.${i}`, label: l.slice(0, 60) }));
      setSuggestions(suggs);
    })();

    return () => { mounted = false; };
  }, [appState]);

  return (
    <div className="tambo-integration">
      <h4>Tambo Suggestions</h4>
      <ul>
        {suggestions.map((s, i) => (
          <li key={i}>
            <strong>{s.label}</strong>
            <div className="quick-actions">
              {(lookupByIntent(s.intent)?.quickActions || ['open']).map(a => (
                <button key={a} onClick={() => console.log('action', a)}>{a}</button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
