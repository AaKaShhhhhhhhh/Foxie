import React, { useState, useEffect, useCallback } from 'react';
import Taskbar from './Taskbar';
import StartMenu from './StartMenu';
import Window from './Window';
import PetAssistantUltimate from './PetAssistantUltimate';
import FoxieVoiceUI from './FoxieVoiceUI';
import FoxieAvatar from './FoxieAvatar';
import Notifications from './Notifications';
import TamboIntegration from './TamboIntegration';
import Notes from './apps/Notes';
import Pomodoro from './apps/Pomodoro';
import Tasks from './apps/Tasks';
import ProductivityDashboard from './ProductivityDashboard';
import { useLifeSimulation } from '../hooks/useLifeSimulation';

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
  const [foxieMood, setFoxieMood] = useState('happy');

  // Life simulation
  const {
    needs,
    lifeStage,
    feed,
    giveWater,
    rest,
    play,
    praise,
    getMood,
  } = useLifeSimulation();

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
  const openWindow = (appName) => {
    const newWindow = {
      id: Date.now(),
      name: appName,
      isMinimized: false,
      position: { x: 100 + windows.length * 20, y: 100 + windows.length * 20 },
    };
    setWindows([...windows, newWindow]);
    setActiveWindowId(newWindow.id);
    setStartMenuOpen(false);
    setLastAppOpened(appName);
    setFocusTime(0); // Reset focus time when opening new app
  };

  // Close a window
  const closeWindow = (id) => {
    setWindows(windows.filter((w) => w.id !== id));
  };

  // Toggle window minimization
  const toggleMinimize = (id) => {
    setWindows(
      windows.map((w) =>
        w.id === id ? { ...w, isMinimized: !w.isMinimized } : w
      )
    );
  };

  // Bring window to front
  const bringToFront = (id) => {
    setActiveWindowId(id);
  };

  // Add notification
  const addNotification = (message, duration = 3000) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, duration);
  };

  // Render app based on name
  const renderAppContent = (appName) => {
    switch (appName) {
      case 'Notes':
        return <Notes />;
      case 'Pomodoro':
        return <Pomodoro onNotify={addNotification} />;
      case 'Task Manager':
        return <Tasks />;
      case 'Dashboard':
        return <ProductivityDashboard />;
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

  // Handle voice wake
  const handleFoxieWake = useCallback(() => {
    setFoxieAwake(true);
    setFoxieListening(true);
    addNotification('🦊 Foxie is listening!', 2000);
  }, []);

  // Handle voice command
  const handleFoxieCommand = useCallback((command, transcript) => {
    setLastFoxieCommand(command);
    
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
  }, [feed, giveWater, rest, play, praise]);

  // Update mood based on needs
  useEffect(() => {
    setFoxieMood(getMood());
  }, [needs, getMood]);

  // App state for Tambo analysis
  const appState = {
    userActive,
    windowsOpen: windows.length,
    lastAppOpened,
    focusTime,
    lastActivity: userActive ? 'recent' : 'idle',
  };

  return (
    <div className="desktop">
      {/* Desktop Background */}
      <div className="desktop-background"></div>

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

      {/* Foxie Avatar - Reactive */}
      <FoxieAvatar
        mood={foxieMood}
        isAwake={foxieAwake}
        isListening={foxieListening}
        lastCommand={lastFoxieCommand}
        needs={needs}
        userActivity={userActive ? 'active' : 'idle'}
      />

      {/* Voice Control UI */}
      <FoxieVoiceUI
        onWake={handleFoxieWake}
        onCommand={handleFoxieCommand}
        foxieState={foxieAwake ? 'awake' : 'sleeping'}
      />

      {/* Tambo AI Suggestions */}
      <TamboIntegration appState={appState} />

      {/* Notifications */}
      <Notifications notifications={notifications} />

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
        windowCount={windows.length}
        minimizedCount={windows.filter((w) => w.isMinimized).length}
      />
    </div>
  );
};

export default Desktop;

