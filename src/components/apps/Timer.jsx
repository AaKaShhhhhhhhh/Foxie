import React, { useState, useEffect } from 'react';

const Timer = ({ onNotify, onTimerUpdate }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState('work'); // 'work' or 'break'

  // Sync state with parent
  useEffect(() => {
    if (onTimerUpdate) {
      onTimerUpdate({ isRunning, timeLeft, sessionType });
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
