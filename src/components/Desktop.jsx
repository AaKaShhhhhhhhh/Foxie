import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Taskbar from './Taskbar';
import ErrorBoundary from './ErrorBoundary';
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
import Calculator from './apps/Calculator';
import Weather from './apps/Weather';
import Browser from './apps/Browser';
import Settings from './apps/Settings';
import ProductivityDashboard from './ProductivityDashboard';
import PreviewWindow from './PreviewWindow';
import DraggableIcon from './DraggableIcon';
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
  const [voiceActive, setVoiceActive] = useState(false); // New state for voice toggle
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceVisualizer, setVoiceVisualizer] = useState(Array(12).fill(0));
  const [lastFoxieCommand, setLastFoxieCommand] = useState(null);
  const [pomodoroState, setPomodoroState] = useState({ isRunning: false, timeLeft: 0, sessionType: 'work' });
  const foxieSleepTimerRef = useRef(null);
  const windowsRef = useRef(windows); // Track latest windows for closures

  // Keep windowsRef in sync
  useEffect(() => {
    windowsRef.current = windows;
  }, [windows]);

  // Preview Window state (AI-controlled)
  const [previewWindow, setPreviewWindow] = useState({
    isOpen: false,
    title: 'Preview',
    mode: 'markdown',
    markdown: '',
    url: '',
  });

  // Handler to update preview window from AI or voice commands
  const updatePreviewWindow = useCallback((updates) => {
    setPreviewWindow(prev => ({ ...prev, ...updates }));
  }, []);

  const closePreviewWindow = useCallback(() => {
    setPreviewWindow(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Desktop icons persistence
  const ICON_STORAGE_KEY = 'foxie_desktop_icons';
  const defaultIcons = [
    { id: 'assistant', name: 'Foxie Assistant', icon: '🦊', x: 20, y: 68 },
    { id: 'calculator', name: 'Calculator', icon: '🧮', x: 20, y: 168 },
    { id: 'notes', name: 'Notes', icon: '📝', x: 20, y: 268 },
    { id: 'weather', name: 'Weather', icon: '🌤️', x: 20, y: 368 },
    { id: 'browser', name: 'Browser', icon: '🌐', x: 120, y: 68 },
    { id: 'pomodoro', name: 'Pomodoro', icon: '🍅', x: 120, y: 168 },
    { id: 'tasks', name: 'Tasks', icon: '✅', x: 120, y: 268 },
    { id: 'dashboard', name: 'Dashboard', icon: '📊', x: 120, y: 368 },
    { id: 'settings', name: 'Settings', icon: '⚙️', x: 220, y: 68 },
  ];

  const [iconPositions, setIconPositions] = useState(() => {
    try {
      const saved = localStorage.getItem(ICON_STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultIcons;
    } catch (e) {
      return defaultIcons;
    }
  });

  const handleIconDragStop = useCallback((id, pos) => {
    setIconPositions(prev => {
      const next = prev.map(icon => icon.id === id ? { ...icon, ...pos } : icon);
      localStorage.setItem(ICON_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

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
        return <Pomodoro onNotify={addNotification} onTimerUpdate={setPomodoroState} />;
      case 'Task Manager':
        return <Tasks />;
      case 'Dashboard':
        return <ProductivityDashboard onOpenApp={openWindow} />;
      case 'Calculator':
        return <Calculator />;
      case 'Weather':
        return <Weather />;
      case 'Browser':
        return <Browser />;
      case 'Settings':
        return <Settings />;
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
    }, 300000); // 5 minutes persistence
  }, []);

  // Handle voice wake
  const handleFoxieWake = useCallback(() => {
    setFoxieAwake(true);
    setFoxieListening(true);
    setLastFoxieCommand({ type: 'WAKE' });
    scheduleFoxieSleep();
  }, [addNotification, scheduleFoxieSleep]);

  // Handle typed wake phrase
  const handleTaskbarCommandSubmit = useCallback(
    (text) => {
      if (isFoxieWakePhrase(text)) {
        handleFoxieWake(); // Just wake the avatar
      } else {
        addNotification("Try typing 'Hey Foxie' to wake me up! 🦊", 3000);
      }
    },
    [handleFoxieWake, addNotification]
  );

  // Handle voice command
  const handleFoxieCommand = useCallback((command) => {
    console.log('Desktop: handleFoxieCommand received:', command);
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
      case 'OPEN_APP':
        openWindow(command.app);
        addNotification(command.text, 2000);
        break;
      case 'CLOSE_APP':
        const currentWindows = windowsRef.current;
        const windowToClose = currentWindows.find(w => w.name === command.app);
        if (windowToClose) {
          closeWindow(windowToClose.id);
          addNotification(command.text, 2000);
        } else {
          addNotification(`I don't see ${command.app} open.`, 2000);
        }
        break;
      case 'CLOSE_ALL':
        const allWindows = windowsRef.current;
        if (allWindows.length > 0) {
          allWindows.forEach(w => closeWindow(w.id));
          addNotification('All apps closed! 🧹', 2000);
        } else {
          addNotification('No apps are open.', 2000);
        }
        break;
      case 'START_TIMER':
        // Immediate visual feedback + open app
        setPomodoroState(prev => ({ ...prev, isRunning: true, sessionType: 'work', timeLeft: 25 * 60 }));
        openWindow('Pomodoro');
        addNotification('⏱️ Starting Pomodoro Timer!', 2000);
        break;
      case 'CHAT':
        // Route long responses to PreviewWindow, short ones to notification
        const LONG_RESPONSE_THRESHOLD = 100; // characters
        const responseText = command.text || '';
        
        if (responseText.length > LONG_RESPONSE_THRESHOLD) {
          // Open PreviewWindow with the full response
          setPreviewWindow({
            isOpen: true,
            title: '🦊 Foxie Says',
            mode: 'markdown',
            markdown: responseText,
            url: '',
          });
          addNotification('📝 See details in window!', 3000);
        } else {
          addNotification(`🦊 ${responseText}`, 5000);
        }
        break;
      default:
        addNotification(command.text || "I'm not sure how to do that, but I'm learning! 🦊", 3000);
    }
  }, [addNotification, feed, giveWater, rest, play, praise, scheduleFoxieSleep, windows, openWindow, closeWindow]);

  const handleToggleVoice = useCallback(() => {
    const nextState = !voiceActive;
    setVoiceActive(nextState);

    if (nextState) {
      setFoxieAwake(true);
      setFoxieListening(true);
      scheduleFoxieSleep();
    } else {
      setFoxieListening(false);
      // We don't necessarily want to force sleep here, just stop listening
    }
  }, [voiceActive, scheduleFoxieSleep, addNotification]);

  const handleVoiceError = useCallback((msg) => {
    addNotification(`⚠️ ${msg}`, 4000);
  }, [addNotification]);

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
        {/* Desktop Background with Draggable Icons */}
        <div className="desktop-background">
          {iconPositions.map((app) => (
            <DraggableIcon
              key={app.id}
              id={app.id}
              name={app.name}
              icon={app.icon}
              initialPosition={{ x: app.x, y: app.y }}
              onDragStop={handleIconDragStop}
              onClick={() => openWindow(app.name)}
            />
          ))}
        </div>

        {/* Top Navigation Bar - Replaces Desktop Widgets */}
        <DesktopTopBar
          onOpenApp={openWindow}
          isVoiceActive={voiceActive}
          foxieAwake={foxieAwake}
          voiceTranscript={voiceTranscript}
          voiceVisualizer={voiceVisualizer}
        />

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

        {/* Foxie Avatar - only visible once awakened */}
        {foxieAwake && (
          <ErrorBoundary fallback={null}>
            <FoxieAvatar
              mood={foxieMood}
              isAwake={foxieAwake}
              isListening={foxieListening}
              lastCommand={lastFoxieCommand}
              needs={needs}
              pomodoroState={pomodoroState}
              onInteraction={scheduleFoxieSleep}
              onCommand={(cmdText) => {
                // Dynamically import parser
                import('../utils/foxieCommands').then(async ({ parseFoxieCommand }) => {
                  const command = await parseFoxieCommand(cmdText);
                  handleFoxieCommand(command);
                });
              }}
              userActivity={userActive ? 'active' : 'idle'}
            />
          </ErrorBoundary>
        )}

        {/* Voice Control - Logic Only (UI moved to Top Bar) */}
        <FoxieVoiceUI
          onWake={handleFoxieWake}
          onCommand={handleFoxieCommand}
          onTranscriptUpdate={setVoiceTranscript}
          onVisualizerUpdate={setVoiceVisualizer}
          onError={handleVoiceError}
          foxieState={foxieAwake ? 'awake' : 'sleeping'}
          visible={false} /* Hide the floating card */
          listening={voiceActive} /* Persistent listening if enabled */
        />

        {/* Tambo AI Suggestions - Hidden for cleaner UI unless requested */}
        {/* <TamboUI /> */}

        {/* Preview Window (AI-controlled) */}
        <PreviewWindow
          isOpen={previewWindow.isOpen}
          title={previewWindow.title}
          mode={previewWindow.mode}
          markdown={previewWindow.markdown}
          url={previewWindow.url}
          onClose={closePreviewWindow}
          onPositionChange={(pos) => setPreviewWindow(prev => ({ ...prev, ...pos }))}
        />

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
          isVoiceActive={voiceActive}
          onToggleVoice={handleToggleVoice}
        />
      </div>
    </AdaptiveUIProvider>
  );
};

export default Desktop;
