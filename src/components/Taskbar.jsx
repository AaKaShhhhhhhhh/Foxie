import React, { useState, useEffect } from 'react';

const Taskbar = ({ startMenuOpen, onStartClick, windowCount, minimizedCount }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

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

      {/* App Buttons Placeholder */}
      <div className="taskbar-apps"></div>

      {/* System Tray */}
      <div className="system-tray">
        {windowCount > 0 && (
          <span className="window-indicator">
            {windowCount} window{windowCount !== 1 ? 's' : ''}
          </span>
        )}
        <span className="taskbar-clock">{formatTime(time)}</span>
      </div>
    </div>
  );
};

export default Taskbar;
