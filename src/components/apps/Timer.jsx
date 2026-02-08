import React, { useState, useEffect } from 'react';

const Timer = ({ onNotify, onTimerUpdate, commandState }) => {
  // Initialize from commandState if available, otherwise default to 25 minutes
  const [timeLeft, setTimeLeft] = useState(() => commandState?.timeLeft || 25 * 60);
  const [isRunning, setIsRunning] = useState(() => commandState?.isRunning || false);
  const [sessionType, setSessionType] = useState(() => commandState?.sessionType || 'work');
  const [lastCommandId, setLastCommandId] = useState(commandState?.commandId || null);

  // Sync from command - always update when commandId changes
  useEffect(() => {
    if (commandState?.commandId && commandState.commandId !== lastCommandId) {
      console.log('Timer: Syncing from commandState:', commandState);
      setLastCommandId(commandState.commandId);
      setIsRunning(commandState.isRunning ?? false);
      setSessionType(commandState.sessionType || 'work');
      setTimeLeft(commandState.timeLeft ?? 25 * 60);
    }
  }, [commandState, lastCommandId]);

  // Sync state with parent
  useEffect(() => {
    if (onTimerUpdate) {
      // Don't sync back immediately if we just received a command to avoid loops
      // But actually, passing commandId back isn't harmful, just redundant.
      // We can preserve commandId.
      onTimerUpdate({ isRunning, timeLeft, sessionType, commandId: lastCommandId });
    }
  }, [isRunning, timeLeft, sessionType, onTimerUpdate]);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let newTime = prev - 1;
        if (prev <= 1) {
          setIsRunning(false);
          const nextType = sessionType === 'work' ? 'break' : 'work';
          const nextTime = nextType === 'work' ? 25 * 60 : 5 * 60;
          setSessionType(nextType);
          setTimeLeft(nextTime);
          onNotify(
            `${sessionType.toUpperCase()} session complete! Time for ${nextType}!`
          );
          newTime = nextTime;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, sessionType, onNotify]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSessionType('work');
    setTimeLeft(25 * 60);
  };

  return (
    <div className="app-pomodoro">
      <h3>{sessionType === 'work' ? 'Work Timer' : 'Break'}</h3>
      <div className="timer-display">{formatTime(timeLeft)}</div>
      <div className="timer-controls">
        <button onClick={toggleTimer} className="btn-play-pause">
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button onClick={resetTimer} className="btn-reset">
          Reset
        </button>
      </div>
    </div>
  );
};

export default Timer;
