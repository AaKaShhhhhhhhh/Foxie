import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DesktopTopBar = (props) => {
  const { onOpenApp } = props;
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const menuItems = [
    { label: 'Dashboard', app: 'Dashboard', icon: '📊' },
    { label: 'Assistant', app: 'Foxie Assistant', icon: '🦊' },
    { label: 'Notes', app: 'Notes', icon: '📝' },
    { label: 'Pomodoro', app: 'Pomodoro', icon: '🍅' },
    { label: 'Tasks', app: 'Task Manager', icon: '✓' },
  ];

  return (
    <motion.div
      className="desktop-top-bar"
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="top-bar-left">
        <div className="brand-logo">
          <span className="brand-icon">🦊</span>
          <span className="brand-text">Foxie</span>
        </div>

        <div className="top-nav-divider" />

        <nav className="top-nav-menu">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className="top-nav-item"
              onClick={() => onOpenApp(item.app)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="top-bar-center">
        <AnimatePresence mode="wait">
          {props.foxieAwake && (
            <motion.div
              className="voice-status-indicator"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="top-visualizer">
                {props.voiceVisualizer?.map((height, i) => (
                  <div
                    key={i}
                    className="top-viz-bar"
                    style={{ height: `${Math.max(2, height * 16)}px` }}
                  />
                ))}
              </div>
              <span className="voice-transcript-top">
                {props.voiceTranscript || "Listening..."}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="top-bar-right">

        <div className="system-status">
          <div className="status-item">
            <span className={`status-dot ${props.isVoiceActive ? 'voice-enabled' : 'online'}`}></span>
            <span className="status-text">{props.isVoiceActive ? 'Voice System Ready' : 'System Active'}</span>
          </div>
        </div>

        <div className="top-nav-divider" />

        <div className="top-clock">
          <span className="clock-time">
            {time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </span>
          <span className="clock-date">
            {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default DesktopTopBar;
