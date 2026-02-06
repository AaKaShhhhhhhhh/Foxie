import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Taskbar from './Taskbar';
import StartMenu from './StartMenu';
import Window from './Window';
import PetAssistantUltimate from './PetAssistantUltimate';
import FoxieVoiceUI from './FoxieVoiceUI';
import FoxieAvatar from './FoxieAvatar';
import Notifications from './Notifications';
import { AdaptiveUIProvider } from './AdaptiveUIProvider';
import TamboUI from './TamboUI';
import AssistantChat from './AssistantChat';
import DesktopTopBar from './DesktopTopBar';
import Notes from './apps/Notes';
import Pomodoro from './apps/Pomodoro';
import Tasks from './apps/Tasks';
import ProductivityDashboard from './ProductivityDashboard';
import { useLifeSimulation } from '../hooks/useLifeSimulation';
import { isFoxieWakePhrase, onFoxieWake } from '../utils/foxieWake';

const APP_WINDOW_CONFIG = {
  Dashboard: { noPadding: true },
};

const Desktop = () => {
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [windows, setWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [userActive, setUserActive] = useState(true);
  const [inactivityTimer, setInactivityTimer] = useState(null);
  const [focusTime, setFocusTime] = useState(0);
  const [lastAppOpened, setLastAppOpened] = useState(null);
  
  // Foxie state
  const [foxieAwake, setFoxieAwake] = useState(false);
  const [foxieListening, setFoxieListening] = useState(false);
  const [lastFoxieCommand, setLastFoxieCommand] = useState(null);
  const foxieSleepTimerRef = useRef(null);

  // Life simulation
  const {
    needs,
    feed,
    giveWater,
    rest,
    play,
    praise,
    getMood,
  } = useLifeSimulation();

  const foxieMood = useMemo(() => getMood(), [getMood]);

  // Track user activity
  useEffect(() => {
    const handleActivity = () => {
      setUserActive(true);
      if (inactivityTimer) clearTimeout(inactivityTimer);

      // Set inactivity after 30 seconds
      const timer = setTimeout(() => {
        setUserActive(false);
      }, 30000);
      setInactivityTimer(timer);
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [inactivityTimer]);

  // Open an app window
  const openWindow = useCallback((appName) => {
    const id = Date.now();

    setWindows((prev) => {
      const widgetInsetTop = 60; // Adjusted for Top Bar
      const widgetInsetSide = 24;
      const taskbarHeight = 56;
      const windowMinWidth = 400;
      const windowMinHeight = 300;

      const safeLeft = widgetInsetSide;
      const safeRight = widgetInsetSide;
      const safeTop = widgetInsetTop;
      const safeBottom = taskbarHeight + 24;

      const availableWidth = Math.max(
        0,
        window.innerWidth - safeLeft - safeRight - windowMinWidth
      );
      const availableHeight = Math.max(
        0,
        window.innerHeight - safeTop - safeBottom - windowMinHeight
      );

      const cascadeOffset = 24 * prev.length;
      const x = safeLeft + (cascadeOffset % Math.max(1, availableWidth));
      const y = safeTop + (cascadeOffset % Math.max(1, availableHeight));

      const position = { x, y };
      const config = APP_WINDOW_CONFIG[appName] ?? {};
      return [...prev, { id, name: appName, isMinimized: false, position, noPadding: Boolean(config.noPadding) }];
    });

    setActiveWindowId(id);
    setStartMenuOpen(false);
    setLastAppOpened(appName);
    setFocusTime(0); // Reset focus time when opening new app
  }, []);

  // Close a window
  const closeWindow = useCallback((id) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  // Toggle window minimization
  const toggleMinimize = useCallback((id) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: !w.isMinimized } : w))
    );
  }, []);

  // Bring window to front
  const bringToFront = useCallback((id) => {
    setActiveWindowId(id);
  }, []);

  // Add notification
  const addNotification = useCallback((message, duration = 3000) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, duration);
  }, []);

  // Render app based on name
  const renderAppContent = (appName) => {
    switch (appName) {
      case 'Foxie Assistant':
        return <AssistantChat />;
      case 'Notes':
        return <Notes />;
      case 'Pomodoro':
        return <Pomodoro onNotify={addNotification} />;
      case 'Task Manager':
        return <Tasks />;
      case 'Dashboard':
        return <ProductivityDashboard onOpenApp={openWindow} />;
      default:
        return <div className="app-placeholder">App: {appName}</div>;
    }
  };

  // Track focus time
  useEffect(() => {
    if (!userActive || windows.length === 0) return;

    const interval = setInterval(() => {
      setFocusTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [userActive, windows.length]);

  const scheduleFoxieSleep = useCallback(() => {
    if (foxieSleepTimerRef.current) {
      clearTimeout(foxieSleepTimerRef.current);
    }

    foxieSleepTimerRef.current = setTimeout(() => {
      setFoxieListening(false);
      setFoxieAwake(false);
    }, 30000);
  }, []);

  // Handle voice wake
  const handleFoxieWake = useCallback(() => {
    setFoxieAwake(true);
    setFoxieListening(true);
    setLastFoxieCommand({ type: 'WAKE' });
    addNotification('Foxie is listening!', 2000);
    scheduleFoxieSleep();
  }, [addNotification, scheduleFoxieSleep]);

  // Handle typed wake phrase
  const handleTaskbarCommandSubmit = useCallback(
    (text) => {
      if (!isFoxieWakePhrase(text)) return;
      handleFoxieWake();
      openWindow('Foxie Assistant');
    },
    [handleFoxieWake, openWindow]
  );

  // Handle voice command
  const handleFoxieCommand = useCallback((command) => {
    setLastFoxieCommand(command);
    scheduleFoxieSleep();
    
    // Execute life simulation commands
    switch (command.type) {
      case 'FEED':
        feed('premium');
        addNotification('🍖 Feeding Foxie!', 2000);
        break;
      case 'DRINK':
        giveWater();
        addNotification('💧 Giving water to Foxie!', 2000);
        break;
      case 'SLEEP':
        rest(5000);
        addNotification('😴 Foxie is sleeping...', 2000);
        break;
      case 'PLAY':
        play('fetch');
        addNotification('🎮 Playing with Foxie!', 2000);
        break;
      case 'PRAISE':
      case 'LOVE':
        praise();
        addNotification('💕 Foxie feels loved!', 2000);
        break;
      default:
        addNotification(command.text, 2000);
    }
  }, [addNotification, feed, giveWater, rest, play, praise, scheduleFoxieSleep]);

  useEffect(() => {
    return () => {
      if (foxieSleepTimerRef.current) {
        clearTimeout(foxieSleepTimerRef.current);
      }
    };
  }, []);

  // Wake Foxie from anywhere (typed "hey foxie", etc.)
  useEffect(() => onFoxieWake(() => handleFoxieWake()), [handleFoxieWake]);

  // App state for Tambo analysis
  const appState = useMemo(
    () => ({
      userActive,
      windowsOpen: windows.length,
      lastAppOpened,
      focusTime,
      lastActivity: userActive ? 'recent' : 'idle',
    }),
    [userActive, windows.length, lastAppOpened, focusTime]
  );

  return (
    <AdaptiveUIProvider appState={appState}>
    <div className="desktop">
      {/* Desktop Background */}
      <div className="desktop-background"></div>

      {/* Top Navigation Bar - Replaces Desktop Widgets */}
      <DesktopTopBar onOpenApp={openWindow} />

      {/* Desktop HUD - Only for Notifications now (Invisible container) */}
      <div className="desktop-hud" style={{ pointerEvents: 'none' }}>
        <Notifications notifications={notifications} />
      </div>

      {/* Windows */}
      <div className="windows-container">
        {windows
          .filter((w) => !w.isMinimized)
          .map((window) => (
            <Window
              key={window.id}
              id={window.id}
              title={window.name}
              position={window.position}
              noPadding={window.noPadding}
              onClose={() => closeWindow(window.id)}
              onMinimize={() => toggleMinimize(window.id)}
              onFocus={() => bringToFront(window.id)}
              isActive={activeWindowId === window.id}
            >
              {renderAppContent(window.name)}
            </Window>
          ))}
      </div>

      {/* Ultimate Pet Assistant with Full Autonomy */}
      <PetAssistantUltimate
        userActive={userActive}
        windowsOpen={windows.length}
        onSpeak={(message) => addNotification(message, 2000)}
      />

      {/* Foxie Avatar - only visible once awakened */}
      {foxieAwake && (
        <FoxieAvatar
          mood={foxieMood}
          isAwake={foxieAwake}
          isListening={foxieListening}
          lastCommand={lastFoxieCommand}
          needs={needs}
          userActivity={userActive ? 'active' : 'idle'}
        />
      )}

      {/* Voice Control UI */}
      <FoxieVoiceUI
        onWake={handleFoxieWake}
        onCommand={handleFoxieCommand}
        foxieState={foxieAwake ? 'awake' : 'sleeping'}
      />

      {/* Tambo AI Suggestions */}
      <TamboUI />

      {/* Start Menu */}
      {startMenuOpen && (
        <StartMenu
          onOpenApp={openWindow}
          onClose={() => setStartMenuOpen(false)}
        />
      )}

      {/* Taskbar */}
      <Taskbar
        startMenuOpen={startMenuOpen}
        onStartClick={() => setStartMenuOpen(!startMenuOpen)}
        onCommandSubmit={handleTaskbarCommandSubmit}
        windows={windows}
        activeWindowId={activeWindowId}
        onActivateWindow={bringToFront}
        onToggleMinimize={toggleMinimize}
        windowCount={windows.length}
        minimizedCount={windows.filter((w) => w.isMinimized).length}
      />
    </div>
    </AdaptiveUIProvider>
  );
};

export default Desktop;
