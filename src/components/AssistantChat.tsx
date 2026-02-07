import React, { useState, useEffect, useRef } from 'react';
import { callLLM } from '../utils/ai';
import { emitFoxieWake, isFoxieWakeOnlyPhrase, isFoxieWakePhrase } from '../utils/foxieWake';

export default function AssistantChat() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState('');
  const loadingRef = useRef(false);

  const send = async (text: string) => {
    if (!text) return;

    if (isFoxieWakeOnlyPhrase(text)) {
      emitFoxieWake({ source: 'text', text });
      setMessages(prev => [
        ...prev,
        { role: 'user', text },
        { role: 'assistant', text: "I'm here. What can I do?" },
      ]);
      setInput('');
      return;
    }

    if (isFoxieWakePhrase(text)) {
      emitFoxieWake({ source: 'text', text });
    }

    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    loadingRef.current = true;
    const res = await callLLM(text);
    loadingRef.current = false;
    setMessages(prev => [...prev, { role: 'assistant', text: res.text }]);
  };

  useEffect(() => {
    // welcome message
    setMessages([{ role: 'assistant', text: 'Hi — I\'m Foxie. How can I help?' }]);
  }, []);

  return (
    <div className="assistant-chat">
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role}`}>
            <div className="bubble">{m.text}</div>
          </div>
        ))}
      </div>
      <div className="composer">
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Say something to Foxie..." />
        <button onClick={() => send(input)}>Send</button>
      </div>
    </div>
  );
}
