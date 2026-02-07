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
import ProductivityDashboard from './ProductivityDashboard';
import FoxieSideChat from './FoxieSideChat'; // New component
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
  const [chatHistory, setChatHistory] = useState([]); // New state for chat history
  const [pomodoroState, setPomodoroState] = useState({ isRunning: false, timeLeft: 0, sessionType: 'work' });
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
        return <Pomodoro onNotify={addNotification} onTimerUpdate={setPomodoroState} />;
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
    }, 300000); // 5 minutes persistence
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

    // Verify command.text exists before adding
    if (command.text) {
      setChatHistory(prev => [...prev, { text: command.text, sender: 'user', timestamp: Date.now() }]);
    }

    // Execute life simulation commands
    switch (command.type) {
      case 'FEED':
        feed('premium');
        addNotification('🍖 Feeding Foxie!', 2000);
        setChatHistory(prev => [...prev, { text: "Yum! Thanks for the food! 🍖", sender: 'foxie', timestamp: Date.now() }]);
        break;
      case 'DRINK':
        giveWater();
        addNotification('💧 Giving water to Foxie!', 2000);
        setChatHistory(prev => [...prev, { text: "Slurp! Refreshing! 💧", sender: 'foxie', timestamp: Date.now() }]);
        break;
      case 'SLEEP':
        rest(5000);
        addNotification('😴 Foxie is sleeping...', 2000);
        setChatHistory(prev => [...prev, { text: "Goodnight... 😴", sender: 'foxie', timestamp: Date.now() }]);
        break;
      case 'PLAY':
        play('fetch');
        addNotification('🎮 Playing with Foxie!', 2000);
        setChatHistory(prev => [...prev, { text: "This is fun! 🎮", sender: 'foxie', timestamp: Date.now() }]);
        break;
      case 'PRAISE':
      case 'LOVE':
        praise();
        addNotification('💕 Foxie feels loved!', 2000);
        setChatHistory(prev => [...prev, { text: "I love you too! 💕", sender: 'foxie', timestamp: Date.now() }]);
        break;
      case 'OPEN_APP':
        openWindow(command.app);
        addNotification(command.text, 2000);
        setChatHistory(prev => [...prev, { text: `Opening ${command.app}...`, sender: 'foxie', timestamp: Date.now() }]);
        break;
      case 'START_TIMER':
        // Immediate visual feedback + open app
        setPomodoroState(prev => ({ ...prev, isRunning: true, sessionType: 'work', timeLeft: 25 * 60 }));
        openWindow('Pomodoro');
        addNotification('⏱️ Starting Pomodoro Timer!', 2000);
        setChatHistory(prev => [...prev, { text: "Timer started! Focus time! ⏱️", sender: 'foxie', timestamp: Date.now() }]);
        break;
      case 'CHAT':
        addNotification(`🦊 ${command.text}`, 5000);
        // If the command text from user was just the prompt, we might want a response.
        // But usually 'CHAT' type implies a response FROM Foxie logic if we had a backend.
        // For now, let's just echo a generic response if it wasn't a specific command.
        // Actually, command.text usually contains the USER'S parsed text or a response?
        // Let's assume command.text here is the response or action description.
        // Wait, parseFoxieCommand returns { type, text }. 
        // If type is CHAT, text is likely the user's input.
        // We need a response generator. For now, pseudo-response:
        setChatHistory(prev => [...prev, { text: "I hear you! 🦊", sender: 'foxie', timestamp: Date.now() }]);
        break;
      default:
        addNotification(command.text || "I'm not sure how to do that, but I'm learning! 🦊", 3000);
        setChatHistory(prev => [...prev, { text: "I'm not sure how to do that yet. 🦊", sender: 'foxie', timestamp: Date.now() }]);
    }
  }, [addNotification, feed, giveWater, rest, play, praise, scheduleFoxieSleep]);

  const handleVoiceError = useCallback((msg) => {
    addNotification(`⚠️ ${msg}`, 4000);
  }, [addNotification]);

  // Voice handlers (extracted for reuse)
  const handleStartVoice = useCallback(() => {
    setVoiceActive(true);
    setFoxieAwake(true);
    setFoxieListening(true);
  }, []);

  const handleStopVoice = useCallback(() => {
    setFoxieListening(false);
    // Don't set foxieAwake(false) immediately so the user can see/hear the response
    setVoiceActive(false);
  }, []);

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
        <DesktopTopBar
          onOpenApp={openWindow}
          isVoiceActive={voiceActive}
          foxieAwake={foxieAwake}
          voiceTranscript={voiceTranscript}
          voiceVisualizer={voiceVisualizer}
          onStartVoice={handleStartVoice}
          onStopVoice={handleStopVoice}
        />

        <div className="desktop-hud" style={{ pointerEvents: 'none' }}>
          <div style={{
            pointerEvents: 'auto',
            height: 'calc(100% - 100px)', // Subtracting top bar and taskbar height roughly
            width: '350px',
            position: 'absolute',
            right: 0,
            top: '50px', // Below top bar
            zIndex: 1000,
            boxShadow: '-5px 0 15px rgba(0,0,0,0.1)'
          }}>
            <FoxieSideChat
              chatHistory={chatHistory}
              onCommandSubmit={(text) => {
                // Parse and execute
                import('../utils/foxieCommands').then(async ({ parseFoxieCommand }) => {
                  const command = await parseFoxieCommand(text);
                  // Add USER message here if not handled by handleFoxieCommand (which adds based on result)
                  // Actually handleFoxieCommand adds it based on the passed object.
                  // We should add the USER text immediately for better UX
                  // override handleFoxieCommand to NOT add user text? Or just add it there.
                  // I added it in handleFoxieCommand.
                  handleFoxieCommand({ ...command, text: text });
                });
              }}
              onStartVoice={handleStartVoice}
              onStopVoice={handleStopVoice}
              isListening={foxieListening}
              isAwake={foxieAwake}
            />
          </div>
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
              onStartVoice={handleStartVoice}
              onStopVoice={handleStopVoice}
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
