/**
 * Productivity Dashboard
 * Shows daily stats, streaks, achievements, and progress
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useBehaviorTracking } from '../hooks/useBehaviorTracking';
import { useAdaptiveUI } from './AdaptiveUIProvider';

const QUICK_NOTE_STORAGE_KEY = 'foxie.widgets.quickNote.v1';
const MotionDiv = motion.div;

const WIDGET_IDS = {
  TIME: 'time',
  ACTIVITY: 'activity',
  TODAY: 'today',
  NOTE: 'note',
  INSIGHT: 'insight',
};

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
  const [widgetsMenuOpen, setWidgetsMenuOpen] = useState(false);
  const [activeWidget, setActiveWidget] = useState(WIDGET_IDS.ACTIVITY);
  const widgetRefs = useRef({});
  const widgetsMenuRef = useRef(null);
  const widgetsButtonRef = useRef(null);
  const widgetsMenuPanelRef = useRef(null);

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

  const openWidgetsMenu = useCallback(() => {
    setWidgetsMenuOpen(true);
  }, []);

  const closeWidgetsMenu = useCallback((options = {}) => {
    setWidgetsMenuOpen(false);

    if (options.returnFocus) {
      widgetsButtonRef.current?.focus();
    }
  }, []);

  const focusWidget = useCallback((widgetId) => {
    if (widgetId === activeWidget) return;
    setActiveWidget(widgetId);

    const node = widgetRefs.current[widgetId];
    if (!node || typeof node.scrollIntoView !== 'function') return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    node.scrollIntoView(
      prefersReducedMotion
        ? { block: 'start' }
        : { behavior: 'smooth', block: 'start' }
    );
  }, [activeWidget]);

  const handleWidgetsMenuKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeWidgetsMenu({ returnFocus: true });
        return;
      }

      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      if (!widgetsMenuPanelRef.current) return;

      const items = Array.from(
        widgetsMenuPanelRef.current.querySelectorAll('button.dashboard-menu-item')
      );
      if (items.length === 0) return;

      const activeIndex = items.indexOf(document.activeElement);
      const direction = event.key === 'ArrowDown' ? 1 : -1;

      const nextIndex =
        activeIndex === -1
          ? 0
          : (activeIndex + direction + items.length) % items.length;

      items[nextIndex]?.focus();
      event.preventDefault();
    },
    [closeWidgetsMenu]
  );

  useEffect(() => {
    if (!widgetsMenuOpen) return;

    const firstItem = widgetsMenuPanelRef.current?.querySelector(
      'button.dashboard-menu-item'
    );
    firstItem?.focus();
  }, [widgetsMenuOpen]);

  useEffect(() => {
    if (!widgetsMenuOpen) return;

    const handlePointerDown = (event) => {
      if (!widgetsMenuRef.current) return;
      if (widgetsMenuRef.current.contains(event.target)) return;
      closeWidgetsMenu();
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [closeWidgetsMenu, widgetsMenuOpen]);

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
      Timer: 'Timer',
      Notes: 'Notes',
      TaskManager: 'Task Manager',
    };

    const fallbackApp = 'Timer';
    onOpenApp(componentToAppName[component] || fallbackApp);
  }, [adaptiveUI?.component, onOpenApp]);

  const timeText = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const dateText = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <MotionDiv
      className="dashboard-scene"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="dashboard-topbar">
        <div className="dashboard-brand-section">
          <button className="dashboard-sidebar-toggle" type="button" onClick={toggleSidebar}>
            Menu
          </button>
          <div className="dashboard-brand">Foxie</div>
        </div>
        <div className="dashboard-nav">
          <button className="nav-btn nav-btn-primary" type="button" onClick={() => handleOpen('Foxie Assistant')}>
            Assistant
          </button>
          <div className="dashboard-dropdown" ref={widgetsMenuRef}>
            <button
              ref={widgetsButtonRef}
              className={`nav-btn ${widgetsMenuOpen ? 'nav-btn-active' : ''}`}
              type="button"
              onClick={widgetsMenuOpen ? closeWidgetsMenu : openWidgetsMenu}
              aria-haspopup="menu"
              aria-expanded={widgetsMenuOpen}
            >
              Widgets
            </button>
            {widgetsMenuOpen && (
              <div
                className="dashboard-menu"
                role="menu"
                ref={widgetsMenuPanelRef}
                onKeyDown={handleWidgetsMenuKeyDown}
              >
                <button
                  className="dashboard-menu-item"
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    focusWidget(WIDGET_IDS.ACTIVITY);
                    closeWidgetsMenu({ returnFocus: true });
                  }}
                >
                  Activity
                </button>
                <button
                  className="dashboard-menu-item"
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    closeWidgetsMenu({ returnFocus: true });
                    handleOpen('Notes');
                  }}
                >
                  Notes
                </button>
                <button
                  className="dashboard-menu-item"
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    closeWidgetsMenu({ returnFocus: true });
                    handleOpen('Timer');
                  }}
                >
                  Timer
                </button>
                <button
                  className="dashboard-menu-item"
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    closeWidgetsMenu({ returnFocus: true });
                    handleOpen('Task Manager');
                  }}
                >
                  Tasks
                </button>
              </div>
            )}
          </div>
          <button className="nav-btn nav-btn-active" type="button">
            Dashboard
          </button>
        </div>
      </div>

      <div className="dashboard-layout">
        {/* Collapsible Sidebar */}
        <MotionDiv
          className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}
          initial={false}
          animate={{ width: sidebarOpen ? 260 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          {sidebarOpen && (
            <div className="sidebar-content">
              <div className="sidebar-section">
                <button
                  className={`sidebar-tab ${activeWidget === WIDGET_IDS.TIME ? 'active' : ''}`}
                  type="button"
                  aria-pressed={activeWidget === WIDGET_IDS.TIME}
                  onClick={() => focusWidget(WIDGET_IDS.TIME)}
                >
                  Time
                </button>
                <button
                  className={`sidebar-tab ${activeWidget === WIDGET_IDS.ACTIVITY ? 'active' : ''}`}
                  type="button"
                  aria-pressed={activeWidget === WIDGET_IDS.ACTIVITY}
                  onClick={() => focusWidget(WIDGET_IDS.ACTIVITY)}
                >
                  Activity
                </button>
                <button
                  className={`sidebar-tab ${activeWidget === WIDGET_IDS.NOTE ? 'active' : ''}`}
                  type="button"
                  aria-pressed={activeWidget === WIDGET_IDS.NOTE}
                  onClick={() => focusWidget(WIDGET_IDS.NOTE)}
                >
                  Quick note
                </button>
                <button
                  className={`sidebar-tab ${activeWidget === WIDGET_IDS.TODAY ? 'active' : ''}`}
                  type="button"
                  aria-pressed={activeWidget === WIDGET_IDS.TODAY}
                  onClick={() => focusWidget(WIDGET_IDS.TODAY)}
                >
                  Today
                </button>
                <button
                  className={`sidebar-tab ${activeWidget === WIDGET_IDS.INSIGHT ? 'active' : ''}`}
                  type="button"
                  aria-pressed={activeWidget === WIDGET_IDS.INSIGHT}
                  onClick={() => focusWidget(WIDGET_IDS.INSIGHT)}
                >
                  Insight
                </button>
              </div>
            </div>
          )}
        </MotionDiv>

        {/* Main Content */}
        <div className="dashboard-main">
          <div className="dashboard-widgets">
            {/* Time Widget */}
            <div
              className={`dash-widget time-widget ${activeWidget === WIDGET_IDS.TIME ? 'focused' : ''}`}
              ref={(node) => {
                widgetRefs.current[WIDGET_IDS.TIME] = node;
              }}
            >
              <div className="widget-header">
                <span className="widget-label">Time</span>
              </div>
              <div className="widget-content">
                <div className="time-display">{timeText}</div>
                <div className="date-display">{dateText}</div>
              </div>
            </div>

            {/* Activity Widget */}
            <div
              className={`dash-widget activity-widget ${activeWidget === WIDGET_IDS.ACTIVITY ? 'focused' : ''}`}
              ref={(node) => {
                widgetRefs.current[WIDGET_IDS.ACTIVITY] = node;
              }}
            >
              <div className="widget-header">
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
            <div
              className={`dash-widget stats-widget ${activeWidget === WIDGET_IDS.TODAY ? 'focused' : ''}`}
              ref={(node) => {
                widgetRefs.current[WIDGET_IDS.TODAY] = node;
              }}
            >
              <div className="widget-header">
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
            <div
              className={`dash-widget note-widget ${activeWidget === WIDGET_IDS.NOTE ? 'focused' : ''}`}
              ref={(node) => {
                widgetRefs.current[WIDGET_IDS.NOTE] = node;
              }}
            >
              <div className="widget-header">
                <span className="widget-label">Quick Note</span>
                <button className="widget-action-btn" type="button" onClick={handleClearNote}>Clear</button>
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
            <div
              className={`dash-widget insight-widget ${activeWidget === WIDGET_IDS.INSIGHT ? 'focused' : ''}`}
              ref={(node) => {
                widgetRefs.current[WIDGET_IDS.INSIGHT] = node;
              }}
            >
              <div className="widget-header">
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
    </MotionDiv>
  );
};

export default ProductivityDashboard;
