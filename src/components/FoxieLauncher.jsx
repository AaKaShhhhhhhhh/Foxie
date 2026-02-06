import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AssistantChat from './AssistantChat';

const STORAGE_KEY_VOICE_WAKE = 'foxie.voiceWakeEnabled';

function getSpeechRecognitionCtor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function normalizeTranscript(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export default function FoxieLauncher() {
  const [isOpen, setIsOpen] = useState(false);
  const [voiceSupported] = useState(() => Boolean(getSpeechRecognitionCtor()));
  const [voiceWakeEnabled, setVoiceWakeEnabled] = useState(() => {
    try {
      return window.localStorage.getItem(STORAGE_KEY_VOICE_WAKE) === '1';
    } catch {
      return false;
    }
  });
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');

  const recognitionRef = useRef(null);
  const voiceWakeEnabledRef = useRef(voiceWakeEnabled);

  const wakeWords = useMemo(
    () => ['hey foxie', 'hi foxie', 'hello foxie', 'ok foxie', 'okay foxie'],
    []
  );

  useEffect(() => {
    voiceWakeEnabledRef.current = voiceWakeEnabled;
    try {
      window.localStorage.setItem(STORAGE_KEY_VOICE_WAKE, voiceWakeEnabled ? '1' : '0');
    } catch {
      // ignore
    }
  }, [voiceWakeEnabled]);

  const startRecognition = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    try {
      recognition.start();
    } catch {
      // SpeechRecognition throws if already started, or if the browser blocks programmatic start.
    }
  }, []);

  const stopRecognition = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    try {
      recognition.stop();
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!voiceSupported) return;

    const SpeechRecognition = getSpeechRecognitionCtor();
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const idx = event.resultIndex;
      const raw = event?.results?.[idx]?.[0]?.transcript;
      const transcript = normalizeTranscript(raw);
      if (!transcript) return;

      setLastTranscript(transcript);

      const hasWakeWord = wakeWords.some((word) => transcript.includes(word));
      if (hasWakeWord) setIsOpen(true);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (voiceWakeEnabledRef.current) {
        // Give the browser a beat to settle before restarting.
        setTimeout(() => startRecognition(), 250);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current = null;
      try {
        recognition.onstart = null;
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.stop();
      } catch {
        // ignore
      }
    };
  }, [startRecognition, voiceSupported, wakeWords]);

  useEffect(() => {
    if (!voiceSupported) return;
    if (voiceWakeEnabled) startRecognition();
    else stopRecognition();
  }, [startRecognition, stopRecognition, voiceSupported, voiceWakeEnabled]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => {
      const el = document.querySelector('.foxie-panel input');
      if (el && typeof el.focus === 'function') el.focus();
    }, 0);

    return () => clearTimeout(t);
  }, [isOpen]);

  return (
    <div className="foxie-shell">
      {isOpen && <button className="foxie-overlay" type="button" aria-label="Close Foxie" onClick={() => setIsOpen(false)} />}

      <div
        className={`foxie-panel ${isOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
      >
        <div className="foxie-panel-header">
          <div className="foxie-panel-title">Foxie</div>
          <button className="foxie-panel-close" type="button" onClick={() => setIsOpen(false)} aria-label="Close">
            ×
          </button>
        </div>

        <div className="foxie-panel-meta">
          <div className="foxie-voice-row">
            <div className="foxie-voice-label">Voice wake</div>
            <div className="foxie-voice-actions">
              <button
                className="foxie-voice-toggle"
                type="button"
                onClick={() =>
                  setVoiceWakeEnabled((v) => {
                    const next = !v;
                    voiceWakeEnabledRef.current = next;
                    return next;
                  })
                }
                disabled={!voiceSupported}
              >
                {voiceSupported ? (voiceWakeEnabled ? 'On' : 'Off') : 'Unsupported'}
              </button>
              {voiceSupported && (
                <div className={`foxie-voice-status ${isListening ? 'listening' : ''}`}>
                  {isListening ? 'Listening for “Hey foxie”' : 'Not listening'}
                </div>
              )}
            </div>
          </div>

          {voiceSupported && lastTranscript && (
            <div className="foxie-last-transcript" title={lastTranscript}>
              Heard: {lastTranscript}
            </div>
          )}
        </div>

        <div className="foxie-panel-body">
          <AssistantChat />
        </div>
      </div>

      <button
        type="button"
        className={`foxie-fab ${isListening ? 'listening' : ''}`}
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? 'Close Foxie' : 'Open Foxie'}
        aria-expanded={isOpen}
      >
        <span className="foxie-fab-label">F</span>
      </button>
    </div>
  );
}
