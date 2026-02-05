import React, { useState, useEffect, useRef } from 'react';
import { callLLM } from '../utils/ai';

export default function AssistantChat() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState('');
  const loadingRef = useRef(false);

  const send = async (text: string) => {
    if (!text) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    loadingRef.current = true;
    const res = await callLLM(text, { model: 'gpt-4o-mini' });
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
