/**
 * Productivity Dashboard
 * Shows daily stats, streaks, achievements, and progress
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useBehaviorTracking } from '../hooks/useBehaviorTracking';
import { useAdaptiveUI } from './AdaptiveUIProvider';

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

function formatFocusMinutes(seconds) {
  return `${Math.floor(Math.max(0, seconds) / 60)}m`;
}

const ProductivityDashboard = ({ onOpenApp }) => {
  const { adaptiveUI, appState } = useAdaptiveUI();
  const { getDailyStats } = useBehaviorTracking({});
  const stats = useMemo(() => getDailyStats(), [getDailyStats]);

  const [now, setNow] = useState(() => new Date());
  const [quickNote, setQuickNote] = useState(() => safeReadLocalStorage(QUICK_NOTE_STORAGE_KEY) ?? '');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeWidget, setActiveWidget] = useState('activity');

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    safeWriteLocalStorage(QUICK_NOTE_STORAGE_KEY, quickNote);
  }, [quickNote]);

  const handleClearNote = useCallback(() => {
    setQuickNote('');
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleOpen = useCallback(
    (appName) => {
      if (!onOpenApp) return;
      onOpenApp(appName);
    },
    [onOpenApp]
  );

  const handleStart = useCallback(() => {
    if (!onOpenApp) return;

    const component = adaptiveUI?.component;
    const componentToAppName = {
      Pomodoro: 'Pomodoro',
      Notes: 'Notes',
      TaskManager: 'Task Manager',
    };

    const fallbackApp = 'Pomodoro';
    onOpenApp(componentToAppName[component] || fallbackApp);
  }, [adaptiveUI?.component, onOpenApp]);

  const timeText = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const dateText = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <motion.div
      className="dashboard-scene"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="dashboard-topbar">
        <div className="dashboard-brand-section">
          <button className="dashboard-sidebar-toggle" type="button" onClick={toggleSidebar}>
            ☰
          </button>
          <div className="dashboard-brand">Foxie</div>
        </div>
        <div className="dashboard-nav">
          <button className="nav-btn nav-btn-primary" type="button" onClick={() => handleOpen('Foxie Assistant')}>
            Assistant
          </button>
          <button className="nav-btn" type="button" onClick={() => handleOpen('Task Manager')}>
            Tasks
          </button>
          <button className="nav-btn" type="button" onClick={() => handleOpen('Notes')}>
            Notes
          </button>
          <button className="nav-btn" type="button" onClick={() => handleOpen('Pomodoro')}>
            Timer
          </button>
          <button className="nav-btn nav-btn-active" type="button">
            Dashboard
          </button>
        </div>
      </div>

      <div className="dashboard-layout">
        {/* Collapsible Sidebar */}
        <motion.div 
          className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}
          initial={false}
          animate={{ width: sidebarOpen ? 260 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          {sidebarOpen && (
            <div className="sidebar-content">
              <div className="sidebar-section">
                <button 
                  className={`sidebar-tab ${activeWidget === 'activity' ? 'active' : ''}`}
                  onClick={() => setActiveWidget('activity')}
                >
                  📊 Activity
                </button>
                <button 
                  className={`sidebar-tab ${activeWidget === 'notes' ? 'active' : ''}`}
                  onClick={() => setActiveWidget('notes')}
                >
                  📝 Notes
                </button>
                <button 
                  className={`sidebar-tab ${activeWidget === 'timer' ? 'active' : ''}`}
                  onClick={() => setActiveWidget('timer')}
                >
                  ⏱️ Timer
                </button>
                <button 
                  className={`sidebar-tab ${activeWidget === 'tasks' ? 'active' : ''}`}
                  onClick={() => setActiveWidget('tasks')}
                >
                  ✅ Tasks
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Main Content */}
        <div className="dashboard-main">
          <div className="dashboard-widgets">
            {/* Time Widget */}
            <div className="dash-widget time-widget">
              <div className="widget-header">
                <span className="widget-icon">🕐</span>
                <span className="widget-label">Time</span>
              </div>
              <div className="widget-content">
                <div className="time-display">{timeText}</div>
                <div className="date-display">{dateText}</div>
              </div>
            </div>

            {/* Activity Widget */}
            <div className="dash-widget activity-widget">
              <div className="widget-header">
                <span className="widget-icon">📊</span>
                <span className="widget-label">Activity</span>
              </div>
              <div className="widget-content">
                <div className="activity-metrics">
                  <div className="activity-item">
                    <span className="activity-label">Focus</span>
                    <span className="activity-value">{formatFocusMinutes(appState?.focusTime || 0)}</span>
                  </div>
                  <div className="activity-item">
                    <span className="activity-label">Windows</span>
                    <span className="activity-value">{appState?.windowsOpen ?? 0}</span>
                  </div>
                </div>
                <button className="action-btn" onClick={handleStart}>
                  Start Session
                </button>
              </div>
            </div>

            {/* Stats Widget */}
            <div className="dash-widget stats-widget">
              <div className="widget-header">
                <span className="widget-icon">📈</span>
                <span className="widget-label">Today</span>
              </div>
              <div className="widget-content">
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-label">Active</div>
                    <div className="stat-value">{formatFocusMinutes(stats.totalActiveTime || 0)}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Sessions</div>
                    <div className="stat-value">{stats.focusSessions ?? 0}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Tasks</div>
                    <div className="stat-value">{stats.taskCompleted ?? 0}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Note Widget */}
            <div className="dash-widget note-widget">
              <div className="widget-header">
                <span className="widget-icon">📝</span>
                <span className="widget-label">Quick Note</span>
                <button className="widget-action-btn" onClick={handleClearNote}>Clear</button>
              </div>
              <div className="widget-content">
                <textarea
                  className="note-input"
                  value={quickNote}
                  onChange={(e) => setQuickNote(e.target.value)}
                  placeholder="Jot down a quick note..."
                />
              </div>
            </div>

            {/* Tambo Insight Widget */}
            <div className="dash-widget insight-widget">
              <div className="widget-header">
                <span className="widget-icon">💡</span>
                <span className="widget-label">Tambo Insight</span>
              </div>
              <div className="widget-content">
                <div className="insight-text">{adaptiveUI?.suggestedAction || 'Ready to work!'}</div>
                <div className="insight-meta">{adaptiveUI?.intent || 'system.desktop'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductivityDashboard;
