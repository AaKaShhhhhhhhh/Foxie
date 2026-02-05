/**
 * Enhanced Pet Assistant Component
 * - Emotional stats system
 * - Multiple animations per mood
 * - Speech bubbles
 * - Sound effects
 * - Interactive responses
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePetEmotions } from '../hooks/useEmotions';
import { useBehaviorTracking } from '../hooks/useBehaviorTracking';

const PetAssistant = ({ userActive, windowsOpen, onSpeak }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showSpeech, setShowSpeech] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [dragging, setDragging] = useState(false);
  const [petPosition, setPetPosition] = useState({ x: 20, y: 400 });
  const [idleTimer, setIdleTimer] = useState(0);
  const petRef = useRef(null);

  // Behavior state
  const behavior = {
    userActive,
    windowsOpen,
    focusSessionActive: false,
    focusTime: 0,
    taskCompleted: false,
    onBreak: false,
  };

  // Pet emotions
  const { stats, mood, health, suggestion } = usePetEmotions(behavior);
  const { trackActivity } = useBehaviorTracking(behavior);

  // Mood emojis with more variety
  const moodDisplay = {
    happy: '😊',
    excited: '🤩',
    angry: '😠',
    sad: '😢',
    bored: '😑',
    sleepy: '😴',
    thinking: '🤔',
    neutral: '🙂',
  };

  // Mood-based reactions
  const moodReactions = {
    happy: ['I\'m having a great day!', 'Keep up the good work!', 'You make me happy! 💕'],
    excited: ['Wow, you\'re on fire! 🔥', 'This is amazing!', 'I believe in you!'],
    angry: ['Something\'s wrong...', 'Uh oh!', 'Are you okay?'],
    sad: ['I miss your attention...', 'Cheer up!', 'Let\'s talk?'],
    bored: ['Anything interesting?', 'Getting bored...', 'Entertain me? 😜'],
    sleepy: ['Sooo tired...', 'Need a nap...', 'Zzzzzzz...'],
    thinking: ['Hmm, focusing...', 'Deep thoughts...', 'Analyzing...'],
    neutral: ['Here I am!', 'What\'s up?', 'Ready to help!'],
  };

  // Random speech bubble
  const getRandomReaction = () => {
    const reactions = moodReactions[mood] || moodReactions.neutral;
    return reactions[Math.floor(Math.random() * reactions.length)];
  };

  // Pet speaks periodically
  useEffect(() => {
    const timer = setInterval(() => {
      if (Math.random() > 0.7) {
        const text = getRandomReaction();
        setSpeechText(text);
        setShowSpeech(true);
        onSpeak?.(text);

        setTimeout(() => setShowSpeech(false), 3000);
      }
    }, 8000);

    return () => clearInterval(timer);
  }, [mood, onSpeak]);

  // Track idle time
  useEffect(() => {
    if (!userActive) {
      setIdleTimer((prev) => prev + 1);
    } else {
      setIdleTimer(0);
    }
  }, [userActive]);

  // Mouse follow effect (subtle)
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Dragging handler
  const handleMouseDown = (e) => {
    setDragging(true);
    e.preventDefault();
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e) => {
      setPetPosition({
        x: Math.min(window.innerWidth - 100, Math.max(0, e.clientX - 40)),
        y: Math.min(window.innerHeight - 100, Math.max(0, e.clientY - 40)),
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  // Click pet to interact
  const handlePetClick = () => {
    const text = getRandomReaction();
    setSpeechText(text);
    setShowSpeech(true);
    trackActivity('pet_interaction', { mood, stats });
  };

  // Stats display
  const StatBar = ({ label, value, color = '#667eea' }) => (
    <div className="stat-bar-container">
      <span className="stat-label">{label}</span>
      <div className="stat-bar">
        <div
          className="stat-fill"
          style={{
            width: `${value}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <span className="stat-value">{Math.round(value)}</span>
    </div>
  );

  return (
    <>
      {/* Pet Assistant */}
      <motion.div
        ref={petRef}
        className="pet-assistant-enhanced"
        style={{
          left: `${petPosition.x}px`,
          top: `${petPosition.y}px`,
        }}
        animate={{
          y: idleTimer > 5 ? [0, -5, 0] : 0,
        }}
        transition={{ duration: 3, repeat: idleTimer > 5 ? Infinity : 0 }}
        onMouseDown={handleMouseDown}
      >
        {/* Speech Bubble */}
        <AnimatePresence>
          {showSpeech && (
            <motion.div
              className="speech-bubble"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: -80 }}
              exit={{ opacity: 0, y: -100 }}
              transition={{ duration: 0.3 }}
            >
              {speechText}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pet Body */}
        <motion.div
          className="pet-body-enhanced"
          animate={{
            scale: mood === 'excited' ? [1, 1.1, 1] : 1,
            rotate: dragging ? 0 : Math.sin(Date.now() / 1000) * 2,
          }}
          transition={{ duration: 0.5 }}
          onClick={handlePetClick}
        >
          {/* Animated Pet */}
          <div className={`pet-character mood-${mood}`}>
            <span className="pet-emoji">{moodDisplay[mood]}</span>
          </div>

          {/* Health Indicator */}
          <div className={`health-indicator health-${health}`} />
        </motion.div>

        {/* Pet Info */}
        <motion.div className="pet-info-enhanced">
          <p className="pet-name">Foxie</p>
          <p className="pet-mood">{mood.toUpperCase()}</p>
          <p className="pet-health">Health: {health}</p>
        </motion.div>

        {/* Stats Panel (toggle with hover) */}
        <motion.div
          className="stats-panel"
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="stats-header">Pet Stats</div>

          <StatBar
            label="Energy"
            value={stats.energy}
            color={stats.energy > 60 ? '#4CAF50' : '#FFC107'}
          />
          <StatBar
            label="Happiness"
            value={stats.happiness}
            color={stats.happiness > 60 ? '#E91E63' : '#FF9800'}
          />
          <StatBar
            label="Focus"
            value={stats.focus}
            color={stats.focus > 60 ? '#2196F3' : '#9C27B0'}
          />
          <StatBar
            label="Stress"
            value={stats.stress}
            color={stats.stress > 60 ? '#F44336' : '#4CAF50'}
          />
          <StatBar
            label="Trust"
            value={stats.trust}
            color={stats.trust > 60 ? '#FF5722' : '#795548'}
          />

          {/* Suggestion */}
          <div className="pet-suggestion">{suggestion}</div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default PetAssistant;
