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
  onCommand, // Added prop for chat
  userActivity = null,
  pomodoroState = { isRunning: false, timeLeft: 0, sessionType: 'work' }
}) => {
  // Position and animation state
  const [position, setPosition] = useState({ x: 80, y: 70 }); // Default bottom-rightish
  const [targetPosition, setTargetPosition] = useState({ x: 80, y: 70 });
  const [currentAnimation, setCurrentAnimation] = useState('idle');
  const [thought, setThought] = useState(null);
  const [isFollowingMouse, setIsFollowingMouse] = useState(false);
  
  // Pomodoro Mode Derived State
  const isPomodoroMode = pomodoroState?.isRunning;

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
      GREETING: () => {
        setCurrentAnimation('happy');
        setThought('Hi there! 👋 I\'m ready to help!');
      },
      STATUS: () => {
         setCurrentAnimation('love');
         setThought(`I'm feeling ${mood}! Thanks for asking! 🦊`);
      },
      CHAT: () => {
        setCurrentAnimation('curious');
        setThought('Hmm, interesting! 💭');
      },
      OPEN_APP: () => {
         // "Float" up briefly
         setTargetPosition({ ...position, y: 10 }); 
         setCurrentAnimation('jumping');
         setThought(`Opening ${lastCommand.app || 'app'}! 📱`);
         
         // Return after 2s
         setTimeout(() => {
             setTargetPosition({ x: 80, y: 70 });
             setCurrentAnimation('idle');
         }, 2000);
      }
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
    if (!isAwake || currentAnimation !== 'idle' || isPomodoroMode) return;

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
   * Pomodoro Mode Logic
   */
  useEffect(() => {
    if (isPomodoroMode) {
      // Move to side and look like a clock
      setTargetPosition({ x: 92, y: 50 });
      setCurrentAnimation('pomodoro');
      
      // Initial encouragement
      setThought(
        pomodoroState.sessionType === 'work' 
          ? "Focus time! I'll keep watch. ⏱️" 
          : "Relax! Take a deep breath. ☕"
      );
      
      // Clear thought after 5s
      const timeout = setTimeout(() => setThought(null), 5000);
      return () => clearTimeout(timeout);
    } else if (currentAnimation === 'pomodoro') {
      // Reset when stopping
      setCurrentAnimation('idle');
      setTargetPosition({ x: 80, y: 70 });
    }
  }, [isPomodoroMode, pomodoroState.sessionType]);

  // Periodic Pomodoro Checks (every 5 mins approx, or based on time left)
  useEffect(() => {
    if (!isPomodoroMode) return;

    // Check periodically on specific time markers roughly
    const minsLeft = Math.floor(pomodoroState.timeLeft / 60);
    const secsLeft = pomodoroState.timeLeft % 60;
    
    // Only react on exact minute boundaries to avoid spam, and only sometimes
    if (secsLeft === 0 && minsLeft > 0 && minsLeft % 5 === 0) {
       setThought(`You're doing great! ${minsLeft}m to go! 🦊`);
       setTimeout(() => setThought(null), 4000);
    }
  }, [pomodoroState.timeLeft, isPomodoroMode]);

  /**
   * Animation Variants
   */
  const avatarVariants = {
    idle: { 
      scale: 1, 
      y: 0, 
      rotate: 0,
      transition: { type: 'spring', stiffness: 300, damping: 20 }
    },
    walking: { 
      y: [0, -10, 0],
      x: [0, 5, 0],
      transition: { repeat: Infinity, duration: 0.6 }
    },
    jumping: { 
      y: [0, 20, -100, 0], // Squish, Jump, Land
      scaleY: [1, 0.7, 1.3, 1], // Stretch in air
      transition: { duration: 0.8, times: [0, 0.2, 0.5, 1] }
    },
    playful: { 
      rotate: [0, 10, -10, 0],
      scale: [1, 1.1, 1],
      transition: { repeat: Infinity, duration: 0.8 }
    },
    spinning: { 
      rotate: 360,
      scale: [1, 0.8, 1],
      transition: { duration: 0.6 }
    },
    alert: { 
      scale: 1.15,
      y: -10,
      transition: { type: 'spring', stiffness: 500 }
    },
    bark: {
      scale: [1, 1.2, 1],
      rotate: [0, -10, 0],
      transition: { duration: 0.2, repeat: 2 }
    },
    rolling: {
      rotate: [0, 180, 360],
      x: [0, 50, 0],
      transition: { duration: 1 }
    },
    love: {
      scale: [1, 1.2, 1],
      transition: { repeat: Infinity, duration: 1.5 }
    },
    eating: {
      y: [0, 5, 0],
      scaleX: [1, 1.1, 1],
      transition: { repeat: Infinity, duration: 0.3 }
    },
    sleeping: {
      scale: 0.8,
      opacity: 0.8,
      y: 10,
      transition: { duration: 1 }
    }
  };

  const getAnimationStyles = () => {
    return {
      position: 'fixed',
      left: `${position.x}%`,
      top: `${position.y}%`,
      zIndex: 10001,
      width: '150px',
      height: '150px',
      x: '-50%',
      y: '-50%',
      cursor: 'pointer',
      opacity: 1,
    };
  };

  /* Interactive State */
  const [chatMode, setChatMode] = useState(false);
  const [chatInput, setChatInput] = useState('');

  /* Handle Drag Interaction */
  const handleDragEnd = (event, info) => {
    // Just trigger interaction to keep awake
    if (onInteraction) onInteraction();
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setThought('Thinking... 💭');
    if (onInteraction) onInteraction();

    // Parse command locally first for smart handling
    import('../utils/foxieCommands').then(({ parseFoxieCommand }) => {
      setTimeout(() => {
        if (onCommand) onCommand(chatInput);
        setChatInput('');
        setChatMode(false);
      }, 1000);
    });
  };

  /* Drag Constraints */
  const constraintsRef = useRef(null);

  return (
    <>
      {/* Constraints Container - Full Screen Invisible */}
      <div
        ref={constraintsRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 10000
        }}
      />

      <motion.div
        className={`foxie-avatar-container ${currentAnimation}`}
        style={getAnimationStyles()}
        variants={avatarVariants}
        animate={currentAnimation}
        initial="idle"
        exit={{ scale: 0, opacity: 0 }}
        drag
        dragMomentum={false}
        dragElastic={0.2}
        dragConstraints={constraintsRef}
        onDragEnd={handleDragEnd}
        onTap={() => {
          if (!chatMode) {
            setChatMode(true);
            setThought("What do we need? 🦊");
            if (onInteraction) onInteraction();
          }
        }}
      >
        <FoxieAvatarSVG
          mood={isPomodoroMode ? 'pomodoro' : (currentAnimation === 'idle' ? mood : currentAnimation)}
          isListening={isListening}
          isAwake={isAwake}
        />

        {/* Thought Bubble / Chat Input */}
        <AnimatePresence>
          {(thought || chatMode) && (
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
                minWidth: '120px',
                width: 'auto',
                maxWidth: '280px',
                zIndex: 1001,
                overflow: 'hidden'
              }}
              initial={{ opacity: 0, scale: 0.5, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 10 }}
              // Stop drag propagation on the bubble so we can interact with input
              onPointerDown={(e) => e.stopPropagation()}
            >
              {chatMode ? (
                <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: '4px' }}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Tell Foxie..."
                    autoFocus
                    style={{
                      border: '1px solid #eee',
                      borderRadius: '4px',
                      padding: '4px',
                      fontSize: '12px',
                      outline: 'none',
                      width: '100%'
                    }}
                    onBlur={() => setTimeout(() => setChatMode(false), 200)} // Close on blur delay
                  />
                </form>
              ) : (
                <span style={{ fontSize: '14px', color: '#333', whiteSpace: 'pre-wrap', display: 'block', textAlign: 'center' }}>{thought}</span>
              )}

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
    </>
  );
};

export default FoxieAvatar;
