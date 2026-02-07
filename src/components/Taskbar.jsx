import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

const Taskbar = ({
  startMenuOpen,
  onStartClick,
  onCommandSubmit,
  windows = [],
  activeWindowId,
  onActivateWindow,
  onToggleMinimize,
  windowCount,
  minimizedCount,
  isVoiceActive,
  onToggleVoice,
}) => {
  const [commandText, setCommandText] = useState('');

  const visibleWindows = useMemo(
    () => windows.filter((w) => w && typeof w.id !== 'undefined'),
    [windows]
  );

  return (
    <div className="taskbar">
      {/* Start Button */}
      <button
        className={`start-button ${startMenuOpen ? 'active' : ''}`}
        onClick={onStartClick}
      >
        <span className="start-icon">⊞</span>
        <span className="start-text">Start</span>
      </button>

      {/* Search / command */}
      <div className="taskbar-search">
        <input
          className="taskbar-search-input"
          value={commandText}
          onChange={(e) => setCommandText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            const text = commandText;
            setCommandText('');
            if (onCommandSubmit) onCommandSubmit(text);
          }}
          placeholder="Type 'hey foxie'"
          aria-label="Taskbar command"
        />
        <button
          className={`taskbar-voice-toggle ${isVoiceActive ? 'active' : ''}`}
          onClick={onToggleVoice}
          title={isVoiceActive ? "Turn off Voice Listening" : "Turn on Voice Listening"}
        >
          {isVoiceActive ? '🎙️' : '🔇'}
          {isVoiceActive && (
            <motion.div
              className="taskbar-mic-pulse"
              animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          )}
        </button>
      </div>

      {/* App Buttons */}
      <div className="taskbar-apps">
        {visibleWindows.map((window) => (
          <button
            key={window.id}
            className={`taskbar-app-button ${activeWindowId === window.id ? 'active' : ''} ${window.isMinimized ? 'minimized' : ''}`}
            type="button"
            onClick={() => {
              if (window.isMinimized) {
                if (onToggleMinimize) onToggleMinimize(window.id);
                if (onActivateWindow) onActivateWindow(window.id);
                return;
              }

              if (activeWindowId === window.id) {
                if (onToggleMinimize) onToggleMinimize(window.id);
                return;
              }

              if (onActivateWindow) onActivateWindow(window.id);
            }}
            title={window.name}
          >
            <span className="taskbar-app-label">{window.name}</span>
          </button>
        ))}
      </div>

      {/* System Tray */}
      <div className="system-tray">
        {windowCount > 0 && (
          <span className="window-indicator">
            {windowCount} window{windowCount !== 1 ? 's' : ''}
          </span>
        )}
        {minimizedCount > 0 && (
          <span className="window-indicator">
            {minimizedCount} minimized
          </span>
        )}

      </div>
    </div>
  );
};

export default Taskbar;
