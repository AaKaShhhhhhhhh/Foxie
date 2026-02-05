/**
 * Emotional Intelligence System for Foxie
 * Manages pet stats that evolve based on user behavior
 * 
 * Stats:
 * - energy (0-100): How energetic the pet feels
 * - happiness (0-100): Overall contentment
 * - focus (0-100): Pet's focus level (mirrors user)
 * - stress (0-100): Pet's stress level
 * - trust (0-100): Pet's trust in user
 */

import React from 'react';

const INITIAL_STATS = {
  energy: 70,
  happiness: 80,
  focus: 50,
  stress: 20,
  trust: 75,
};

const STORAGE_KEY = 'foxie-pet-stats';

/**
 * Get current stats from localStorage or return defaults
 */
export function loadStats() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : { ...INITIAL_STATS };
}

/**
 * Save stats to localStorage
 */
function saveStats(stats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

/**
 * Determine mood from current stats
 * Mood drives animation selection
 */
export function calculateMood(stats) {
  const avgStat = (stats.energy + stats.happiness) / 2;
  const stressFactor = stats.stress / 100;

  if (stressFactor > 0.7) return 'angry';
  if (stats.energy < 20) return 'sleepy';
  if (stats.happiness < 30 && stats.focus < 30) return 'bored';
  if (stats.focus > 80) return 'thinking';
  if (avgStat > 80) return 'excited';
  if (avgStat > 60) return 'happy';
  if (avgStat < 40) return 'sad';

  return 'neutral';
}

/**
 * Update stats based on user behavior
 */
export function updateStatsFromBehavior(stats, behavior) {
  const newStats = { ...stats };

  // Behavior: user is active
  if (behavior.userActive) {
    newStats.energy = Math.min(100, newStats.energy + 2);
    newStats.happiness = Math.min(100, newStats.happiness + 1);
  } else {
    // User is idle
    newStats.energy = Math.max(0, newStats.energy - 1);
    newStats.happiness = Math.max(0, newStats.happiness - 0.5);
    newStats.stress = Math.min(100, newStats.stress + 1);
  }

  // Behavior: focus session active
  if (behavior.focusSessionActive) {
    newStats.focus = Math.min(100, newStats.focus + 2);
    newStats.stress = Math.max(0, newStats.stress - 1);
    newStats.happiness = Math.min(100, newStats.happiness + 0.5);
  } else if (behavior.focusTime > 60) {
    // Long focus without break
    newStats.stress = Math.min(100, newStats.stress + 0.5);
    newStats.energy = Math.max(0, newStats.energy - 0.5);
  }

  // Behavior: task completed
  if (behavior.taskCompleted) {
    newStats.happiness = Math.min(100, newStats.happiness + 10);
    newStats.trust = Math.min(100, newStats.trust + 5);
    newStats.stress = Math.max(0, newStats.stress - 5);
  }

  // Behavior: multiple windows open (productive)
  if (behavior.windowsOpen > 1) {
    newStats.focus = Math.min(100, newStats.focus + 1);
  }

  // Behavior: taking a break
  if (behavior.onBreak) {
    newStats.energy = Math.min(100, newStats.energy + 3);
    newStats.stress = Math.max(0, newStats.stress - 2);
  }

  // Natural decay (pet gets tired/stressed)
  newStats.energy = Math.max(0, newStats.energy - 0.1);
  newStats.focus = Math.max(0, newStats.focus - 0.05);

  // Cap all stats at 0-100
  Object.keys(newStats).forEach((key) => {
    newStats[key] = Math.max(0, Math.min(100, newStats[key]));
  });

  return newStats;
}

/**
 * Get health indicator based on stats
 */
export function getPetHealth(stats) {
  const health = (stats.happiness + stats.trust) / 2;
  if (health > 75) return 'excellent';
  if (health > 50) return 'good';
  if (health > 25) return 'fair';
  return 'poor';
}

/**
 * Get suggestion based on stats
 */
export function getSuggestionFromStats(stats) {
  if (stats.energy < 30) {
    return '😴 You both need a break! Take 5 minutes to rest.';
  }
  if (stats.stress > 70) {
    return '😟 Things are getting stressful. Try a breathing exercise?';
  }
  if (stats.focus > 80) {
    return '🎯 Great focus! Keep it up!';
  }
  if (stats.happiness < 40) {
    return '😢 We could both use some cheering up. Want to chat?';
  }
  return '✨ You\'re doing great! Keep going!';
}

/**
 * Custom hook for managing pet emotions
 */
export function usePetEmotions(behavior = {}) {
  const [stats, setStats] = React.useState(() => loadStats());
  const [mood, setMood] = React.useState(calculateMood(stats));
  const [health, setHealth] = React.useState(getPetHealth(stats));

  // Update stats periodically based on behavior
  React.useEffect(() => {
    const interval = setInterval(() => {
      setStats((prevStats) => {
        const newStats = updateStatsFromBehavior(prevStats, behavior);
        saveStats(newStats);
        setMood(calculateMood(newStats));
        setHealth(getPetHealth(newStats));
        return newStats;
      });
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [behavior]);

  return {
    stats,
    mood,
    health,
    setStat: (key, value) => {
      const newStats = { ...stats, [key]: value };
      setStats(newStats);
      saveStats(newStats);
      setMood(calculateMood(newStats));
      setHealth(getPetHealth(newStats));
    },
    suggestion: getSuggestionFromStats(stats),
  };
}

export default {
  INITIAL_STATS,
  loadStats,
  saveStats,
  calculateMood,
  updateStatsFromBehavior,
  getPetHealth,
  getSuggestionFromStats,
  usePetEmotions,
};
