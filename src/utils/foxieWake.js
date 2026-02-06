export const FOXIE_WAKE_EVENT = 'foxie:wake';

const WAKE_PHRASES = ['hey foxie', 'hi foxie', 'hello foxie', 'ok foxie', 'okay foxie'];

export function normalizeFoxieText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function isFoxieWakePhrase(text) {
  const normalized = normalizeFoxieText(text);
  if (!normalized) return false;
  return WAKE_PHRASES.some((phrase) => normalized.includes(phrase));
}

export function isFoxieWakeOnlyPhrase(text) {
  const normalized = normalizeFoxieText(text);
  if (!normalized) return false;
  return WAKE_PHRASES.includes(normalized);
}

export function emitFoxieWake(detail = {}) {
  if (typeof window === 'undefined') return;

  try {
    window.dispatchEvent(new CustomEvent(FOXIE_WAKE_EVENT, { detail }));
  } catch {
    // ignore
  }
}

export function onFoxieWake(handler) {
  if (typeof window === 'undefined') return () => {};
  if (typeof handler !== 'function') return () => {};

  const listener = (event) => {
    handler(event?.detail || {});
  };

  window.addEventListener(FOXIE_WAKE_EVENT, listener);
  return () => window.removeEventListener(FOXIE_WAKE_EVENT, listener);
}
