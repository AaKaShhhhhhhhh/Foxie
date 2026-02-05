/**
 * Behavioral Tracking System
 * Tracks user activity patterns and generates insights
 */

import React from 'react';

const STORAGE_KEY = 'foxie-behavior-log';

export function getBehaviorLog() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return { sessions: [], startOfDay: new Date() };
  const data = JSON.parse(stored);
  // Reset daily log if it's a new day
  if (!isSameDay(new Date(data.startOfDay), new Date())) {
    return { sessions: [], startOfDay: new Date() };
  }
  return data;
}

function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function saveBehaviorLog(log) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
}

export function addSessionToLog(session) {
  const log = getBehaviorLog();
  log.sessions.push({
    ...session,
    timestamp: new Date().toISOString(),
  });
  saveBehaviorLog(log);
}

/**
 * Calculate daily statistics
 */
export function calculateDailyStats(log) {
  const sessions = log.sessions;

  const totalActiveTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const focusSessions = sessions.filter((s) => s.type === 'focus').length;
  const taskCompleted = sessions.filter((s) => s.type === 'task_complete').length;
  const breaksTaken = sessions.filter((s) => s.type === 'break').length;

  return {
    totalActiveTime, // in seconds
    focusSessions,
    taskCompleted,
    breaksTaken,
    averageSessionLength:
      sessions.length > 0 ? totalActiveTime / sessions.length : 0,
  };
}

/**
 * Custom hook for tracking behavior
 */
export function useBehaviorTracking(state) {
  const [log, setLog] = React.useState(() => getBehaviorLog());

  const trackActivity = React.useCallback((activityType, data = {}) => {
    addSessionToLog({
      type: activityType,
      ...data,
    });
    setLog(getBehaviorLog());
  }, []);

  const getDailyStats = React.useCallback(() => {
    return calculateDailyStats(log);
  }, [log]);

  return {
    log,
    trackActivity,
    getDailyStats,
    sessions: log.sessions,
  };
}

export default {
  getBehaviorLog,
  saveBehaviorLog,
  addSessionToLog,
  calculateDailyStats,
  useBehaviorTracking,
};
