import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const PetAssistant = ({ userActive, windowsOpen, onSpeak }) => {
  const [mood, setMood] = useState('happy');
  const [isAnimating, setIsAnimating] = useState(false);

  // Determine mood based on user activity and windows open
  useEffect(() => {
    let newMood = 'happy';

    if (!userActive) {
      newMood = 'bored';
    } else if (windowsOpen > 2) {
      newMood = 'excited';
    } else if (windowsOpen === 0) {
      newMood = 'tired';
    }

    if (Math.random() > 0.7) {
      newMood = 'excited';
    }

    setMood(newMood);
  }, [userActive, windowsOpen]);

  // Pet speaks occasionally
  useEffect(() => {
    const messages = {
      happy: "I'm ready to help! 😊",
      bored: "Feeling a bit lonely... 😔",
      excited: "Wow, you're productive! 🎉",
      tired: "Rest time? 😴",
      angry: "Something's wrong! ⚠️",
    };

    const timer = setTimeout(() => {
      if (Math.random() > 0.6) {
        onSpeak(messages[mood]);
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [mood, onSpeak]);

  const moodEmoji = {
    happy: '😊',
    bored: '😔',
    excited: '🎉',
    tired: '😴',
    angry: '⚠️',
  };

  return (
    <motion.div
      className={`pet-assistant mood-${mood}`}
      animate={{
        y: isAnimating ? -10 : 0,
        scale: isAnimating ? 1.05 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 10 }}
    >
      <div className="pet-container">
        <div className="pet-body">
          <span className="pet-emoji">{moodEmoji[mood]}</span>
        </div>
        <div className="pet-info">
          <p className="pet-name">Foxie</p>
          <p className="pet-mood">{mood.toUpperCase()}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default PetAssistant;
