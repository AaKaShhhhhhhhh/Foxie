import React, { useCallback, useEffect, useMemo, useState } from 'react';

const QUICK_NOTE_STORAGE_KEY = 'foxie.widgets.quickNote.v1';

function safeReadLocalStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeWriteLocalStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore environments where localStorage is unavailable (or full).
  }
}

function formatTimerTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

const DesktopSideWidgets = ({ onOpenApp, onNotify }) => {
  const [quickNote, setQuickNote] = useState(() => {
    const existing = safeReadLocalStorage(QUICK_NOTE_STORAGE_KEY);
    return existing ?? '';
  });

  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState('work');

  useEffect(() => {
    safeWriteLocalStorage(QUICK_NOTE_STORAGE_KEY, quickNote);
  }, [quickNote]);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          const nextType = sessionType === 'work' ? 'break' : 'work';
          const nextTime = nextType === 'work' ? 25 * 60 : 5 * 60;
          setSessionType(nextType);
          if (onNotify) {
            onNotify(
              `${sessionType.toUpperCase()} session complete. Time for ${nextType}.`
            );
          }
          return nextTime;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, onNotify, sessionType]);

  const shortcuts = useMemo(
    () => [
      { label: 'Assistant', app: 'Foxie Assistant' },
      { label: 'Notes', app: 'Notes' },
      { label: 'Pomodoro', app: 'Pomodoro' },
      { label: 'Tasks', app: 'Task Manager' },
      { label: 'Dashboard', app: 'Dashboard' },
    ],
    []
  );

  const handleToggleTimer = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const handleResetTimer = useCallback(() => {
    setIsRunning(false);
    setSessionType('work');
    setTimeLeft(25 * 60);
  }, []);

  const handleClearNote = useCallback(() => {
    setQuickNote('');
  }, []);

  const sessionLabel = sessionType === 'work' ? 'Work' : 'Break';

  return (
    <div className="desktop-side-widgets">
      <div className="widget-card widget-shortcuts">
        <div className="widget-title">Shortcuts</div>
        <div className="widget-shortcuts-grid">
          {shortcuts.map((shortcut) => (
            <button
              key={shortcut.app}
              className="widget-shortcut"
              type="button"
              onClick={() => onOpenApp(shortcut.app)}
            >
              {shortcut.label}
            </button>
          ))}
        </div>
      </div>

      <div className="widget-card widget-note">
        <div className="widget-header-row">
          <div className="widget-title">Quick note</div>
          <button
            className="widget-header-action"
            type="button"
            onClick={handleClearNote}
          >
            Clear
          </button>
        </div>
        <textarea
          className="widget-note-textarea"
          value={quickNote}
          onChange={(e) => setQuickNote(e.target.value)}
          placeholder="Write something you'll want to see later..."
        />
      </div>

      <div className="widget-card widget-pomodoro-mini">
        <div className="widget-header-row">
          <div className="widget-title">Pomodoro</div>
          <div className="widget-header-meta">{sessionLabel}</div>
        </div>
        <div className="widget-value widget-timer-value">
          {formatTimerTime(timeLeft)}
        </div>
        <div className="widget-button-row">
          <button
            className="widget-button widget-button-primary"
            type="button"
            onClick={handleToggleTimer}
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            className="widget-button widget-button-secondary"
            type="button"
            onClick={handleResetTimer}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesktopSideWidgets;
