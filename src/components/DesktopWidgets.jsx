import React, { useEffect, useMemo, useState } from 'react';

function formatClockTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatClockDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatFocusTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

const DesktopWidgets = ({ focusTime, windowsOpen, onOpenAssistant }) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const focusLabel = useMemo(() => formatFocusTime(focusTime), [focusTime]);

  return (
    <div className="desktop-widgets">
      <div className="widget-card widget-clock">
        <div className="widget-title">Time</div>
        <div className="widget-value">{formatClockTime(now)}</div>
        <div className="widget-subtitle">{formatClockDate(now)}</div>
      </div>

      <div className="widget-card widget-focus">
        <div className="widget-title">Activity</div>
        <div className="widget-metrics">
          <div className="widget-metric">
            <span className="metric-label">Focus</span>
            <span className="metric-value">{focusLabel}</span>
          </div>
          <div className="widget-metric">
            <span className="metric-label">Windows</span>
            <span className="metric-value">{windowsOpen}</span>
          </div>
        </div>

        <button
          className="widget-action"
          type="button"
          onClick={onOpenAssistant}
        >
          Open Foxie
        </button>
      </div>
    </div>
  );
};

export default DesktopWidgets;
