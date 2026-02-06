import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import FoxieAvatarSVG from './FoxieAvatarSVG';

/**
 * FoxieAvatar - The ultimate reactive fox avatar
 * Reacts to everything: voice, mouse, time, activities
 */
const FoxieAvatar = ({ 
  mood = 'happy',
  isAwake = true,
  isListening = false,
  lastCommand = null,
  needs = { hunger: 80, thirst: 80, sleep: 80, happiness: 80 },
  onInteraction,
  userActivity = null
}) => {
  // Position and animation state
  const [position, setPosition] = useState({ x: 80, y: 70 }); // Default bottom-rightish
  const [targetPosition, setTargetPosition] = useState({ x: 80, y: 70 });
  const [currentAnimation, setCurrentAnimation] = useState('idle');
  const [thought, setThought] = useState(null);
  const [isFollowingMouse, setIsFollowingMouse] = useState(false);
  
  // Mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Refs
  const thoughtTimeoutRef = useRef(null);
  const wanderIntervalRef = useRef(null);

  /**
   * React to voice commands
   */
  useEffect(() => {
    if (!lastCommand) return;

    const reactions = {
      WAKE: () => {
        setCurrentAnimation('alert');
        setThought('*perks up* I\'m listening! 🦊');
      },
      SLEEP: () => {
        setCurrentAnimation('sleeping');
        setThought('*yawns* Good night... 💤');
      },
      PLAY: () => {
        setCurrentAnimation('playful');
        setThought('Yay! Let\'s play! 🎮');
      },
      DANCE: () => {
        setCurrentAnimation('dancing');
        setThought('*dances around* 🎵');
      },
      SIT: () => {
        setCurrentAnimation('sitting');
        setThought('*sits obediently* 🐾');
      },
      JUMP: () => {
        setCurrentAnimation('jumping');
        setThought('Wheee! ⬆️');
      },
      SPIN: () => {
        setCurrentAnimation('spinning');
        setThought('*spins around* 🌀');
      },
      FEED: () => {
        setCurrentAnimation('eating');
        setThought('*nom nom nom* 🍖');
      },
      DRINK: () => {
        setCurrentAnimation('drinking');
        setThought('*lap lap lap* 💧');
      },
      PRAISE: () => {
        setCurrentAnimation('happy');
        setThought('*happy wiggles* Thank you! 💕');
      },
      LOVE: () => {
        setCurrentAnimation('love');
        setThought('I love you too! 💖');
      },
      FOCUS: () => {
        setCurrentAnimation('focus');
        setThought('*concentrating* Let\'s work! 🎯');
      },
      BREAK: () => {
        setCurrentAnimation('relaxed');
        setThought('Break time! ☕');
      },
      COME: () => {
        setCurrentAnimation('running');
        setThought('Coming! 🦊');
        setTargetPosition({ x: 50, y: 50 }); // Center screen
      },
      STAY: () => {
        setCurrentAnimation('alert');
        setThought('*staying still* ⏸️');
      },
      BARK: () => {
        setCurrentAnimation('bark');
        setThought('Yip yip yip! 🔊');
      },
      ROLL: () => {
        setCurrentAnimation('rolling');
        setThought('*rolls over* 🔄');
      },
      HIGHFIVE: () => {
        setCurrentAnimation('highfive');
        setThought('High five! ✋🦊');
      },
      SHAKE: () => {
        setCurrentAnimation('shake');
        setThought('*offers paw* 🤝');
      },
      CHAT: () => {
        setCurrentAnimation('curious');
        setThought('Hmm, interesting! 💭');
      },
    };

    const reaction = reactions[lastCommand.type];
    if (reaction) {
      reaction();
      
      // Clear thought after delay
      if (thoughtTimeoutRef.current) clearTimeout(thoughtTimeoutRef.current);
      thoughtTimeoutRef.current = setTimeout(() => {
        setThought(null);
        setCurrentAnimation('idle');
      }, 3000);
    }
  }, [lastCommand]);

  /**
   * Autonomous wandering
   * Only wander if awake and idle
   */
  useEffect(() => {
    if (!isAwake || currentAnimation !== 'idle') return;

    wanderIntervalRef.current = setInterval(() => {
      // 30% chance to move every 10 seconds
      if (Math.random() > 0.7) {
        // Keep within bounds (10% to 90%)
        const newX = Math.max(10, Math.min(90, position.x + (Math.random() - 0.5) * 20));
        const newY = Math.max(20, Math.min(80, position.y + (Math.random() - 0.5) * 15));
        
        setTargetPosition({ x: newX, y: newY });
        setCurrentAnimation('walking');
        
        setTimeout(() => {
          setCurrentAnimation('idle');
        }, 2000); // Walk for 2 seconds
      }
    }, 10000);

    return () => {
      if (wanderIntervalRef.current) clearInterval(wanderIntervalRef.current);
    };
  }, [isAwake, currentAnimation, position]);

  /**
   * Smooth movement animation
   */
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const dx = targetPosition.x - position.x;
      const dy = targetPosition.y - position.y;
      
      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        setPosition(prev => ({
          x: prev.x + dx * 0.05,
          y: prev.y + dy * 0.05,
        }));
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [targetPosition, position]);

  /**
   * Animation Styles
   */
  const getAnimationStyles = () => {
    const base = {
      position: 'fixed',
      left: `${position.x}%`,
      top: `${position.y}%`,
      zIndex: 1000,
      width: '150px',
      height: '150px',
      x: '-50%',
      y: '-50%',
      cursor: 'pointer',
    };

    if (!isAwake) {
      return { ...base, scale: 0.8, opacity: 0.8, y: '-40%' }; // Sleeping visually distinct
    }

    const stateTransforms = {
      idle: { scale: 1 },
      walking: { y: ['-50%', '-55%', '-50%'], transition: { repeat: Infinity, duration: 0.5 } },
      jumping: { y: ['-50%', '-80%', '-50%'] },
      playful: { rotate: [0, 5, -5, 0], transition: { repeat: Infinity } },
      spinning: { rotate: 360 },
      alert: { scale: 1.1 },
    };

    return { ...base, ...stateTransforms[currentAnimation] };
  };

  return (
    <motion.div
      className={`foxie-avatar-container ${currentAnimation}`}
      initial={{ scale: 0, opacity: 0 }} /* Pop up animation */
      animate={getAnimationStyles()}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 15 }}
      onTap={() => setThought(isAwake ? 'Pet me more! 🥰' : 'Zzz... 😴')}
    >
      <FoxieAvatarSVG 
        mood={currentAnimation === 'idle' ? mood : currentAnimation} 
        isListening={isListening}
        isAwake={isAwake}
      />

      {/* Thought Bubble */}
      <AnimatePresence>
        {thought && (
          <motion.div
            className="thought-bubble"
            style={{ 
                position: 'absolute', 
                bottom: '100%', 
                left: '50%', 
                translateX: '-50%',
                marginBottom: '10px',
                background: 'white',
                padding: '8px 12px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                whiteSpace: 'nowrap',
                zIndex: 1001,
                fontSize: '14px',
                color: '#333'
            }}
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 10 }}
          >
            {thought}
            <div style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                marginLeft: '-6px',
                borderWidth: '6px',
                borderStyle: 'solid',
                borderColor: 'white transparent transparent transparent'
            }} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FoxieAvatar;
