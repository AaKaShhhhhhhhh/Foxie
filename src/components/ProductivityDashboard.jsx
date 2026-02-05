/**
 * Productivity Dashboard
 * Shows daily stats, streaks, achievements, and progress
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useBehaviorTracking } from '../hooks/useBehaviorTracking';

const ProductivityDashboard = () => {
  const { getDailyStats, sessions } = useBehaviorTracking({});
  const stats = useMemo(() => getDailyStats(), [getDailyStats]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const StatCard = ({ icon, label, value, color = '#667eea' }) => (
    <motion.div
      className="stat-card"
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="stat-card-icon" style={{ color }}>
        {icon}
      </div>
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value" style={{ color }}>
        {value}
      </div>
    </motion.div>
  );

  return (
    <motion.div
      className="productivity-dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="dashboard-header">
        <h2>📊 Today's Progress</h2>
        <span className="date-display">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          icon="⏱️"
          label="Active Time"
          value={formatTime(stats.totalActiveTime)}
          color="#4CAF50"
        />
        <StatCard
          icon="🎯"
          label="Focus Sessions"
          value={stats.focusSessions}
          color="#2196F3"
        />
        <StatCard
          icon="✓"
          label="Tasks Done"
          value={stats.taskCompleted}
          color="#FF9800"
        />
        <StatCard
          icon="☕"
          label="Breaks"
          value={stats.breaksTaken}
          color="#E91E63"
        />
      </div>

      {/* Goal Progress */}
      <div className="goal-section">
        <h3>🎯 Daily Goals</h3>
        <div className="goal-item">
          <div className="goal-label">
            <span>Focus Sessions (Goal: 4)</span>
            <span className="goal-progress">{stats.focusSessions}/4</span>
          </div>
          <div className="goal-bar">
            <motion.div
              className="goal-fill"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (stats.focusSessions / 4) * 100)}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>

        <div className="goal-item">
          <div className="goal-label">
            <span>Active Time (Goal: 4h)</span>
            <span className="goal-progress">
              {formatTime(stats.totalActiveTime)}/4h
            </span>
          </div>
          <div className="goal-bar">
            <motion.div
              className="goal-fill"
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, (stats.totalActiveTime / 14400) * 100)}%`,
              }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>

        <div className="goal-item">
          <div className="goal-label">
            <span>Tasks Completed (Goal: 5)</span>
            <span className="goal-progress">{stats.taskCompleted}/5</span>
          </div>
          <div className="goal-bar">
            <motion.div
              className="goal-fill"
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, (stats.taskCompleted / 5) * 100)}%`,
              }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="quick-stat">
          <span className="quick-stat-label">Avg Session</span>
          <span className="quick-stat-value">
            {formatTime(stats.averageSessionLength)}
          </span>
        </div>
        <div className="quick-stat">
          <span className="quick-stat-label">Best Time</span>
          <span className="quick-stat-value">Morning</span>
        </div>
        <div className="quick-stat">
          <span className="quick-stat-label">Streak</span>
          <span className="quick-stat-value">🔥 5 days</span>
        </div>
      </div>

      {/* Motivational Message */}
      <motion.div
        className="motivation-message"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {stats.focusSessions >= 4 ? (
          <p>🎉 Excellent progress today! You're crushing your goals!</p>
        ) : stats.taskCompleted >= 3 ? (
          <p>💪 Great work! Keep the momentum going!</p>
        ) : (
          <p>🚀 You\'re doing great! One more session to go!</p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ProductivityDashboard;
