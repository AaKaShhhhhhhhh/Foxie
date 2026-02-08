import React, { useState, useEffect, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
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
  onInteraction,
  onCommand, // Added prop for chat
  timerState = { isRunning: false, timeLeft: 0, sessionType: 'work' }
}) => {
  // Position and animation state
  const [position, setPosition] = useState({ x: 80, y: 70 }); // Default bottom-rightish
  const [targetPosition, setTargetPosition] = useState({ x: 80, y: 70 });
  const [currentAnimation, setCurrentAnimation] = useState('idle');
  const [thought, setThought] = useState(null);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });


  // Timer Mode Derived State
  const isTimerMode = timerState?.isRunning;

  // Refs
  const thoughtTimeoutRef = useRef(null);
  const wanderIntervalRef = useRef(null);
  const timerActiveRef = useRef(false);
  const hoverTimerRef = useRef(null);
  const shakeStartRef = useRef(null);

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
        if (lastCommand?.text) {
          const clipped =
            lastCommand.text.length > 200
              ? `${lastCommand.text.slice(0, 197)}...`
              : lastCommand.text;
          setThought(clipped);
        } else {
          setThought('Hmm, interesting! 💭');
        }
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

      // Clean thought from excessive emojis if it's a CHAT response
      if (lastCommand.type === 'CHAT' && typeof lastCommand.text === 'string') {
        const cleaned = lastCommand.text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, (match, offset, string) => {
          // Keep only first 2 emojis if they are grouped or something? Or just limit?
          // User asked to remove "unnecessary" emojis. Let's just strip most if they are excessive.
          return (offset < 2) ? match : '';
        });
        setThought(cleaned);
      }

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
    if (!isAwake || currentAnimation !== 'idle' || isTimerMode) return;

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
   * Eye tracking logic
   */
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Get avatar's center in pixels
      const avatarRect = {
        x: (window.innerWidth * position.x) / 100,
        y: (window.innerHeight * position.y) / 100,
      };

      const dx = e.clientX - avatarRect.x;
      const dy = e.clientY - avatarRect.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Max displacement (pupil radius - eye radius approx)
      const maxOffset = 5;

      if (distance > 0) {
        // Limit movement to maxOffset
        const scale = Math.min(maxOffset, distance * 0.05) / distance;
        setEyeOffset({
          x: dx * scale,
          y: dy * scale,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [position]);

  /**
   * Pomodoro Mode Logic
   */
  useEffect(() => {
    if (isTimerMode) {
      const isEnteringTimer = !timerActiveRef.current;
      timerActiveRef.current = true;

      const syncTimeout = setTimeout(() => {
        if (isEnteringTimer) {
          // Move to side and look like a clock
          setTargetPosition({ x: 92, y: 50 });
          setCurrentAnimation('timer');
        }

        // Initial encouragement
        setThought(
          timerState.sessionType === 'work'
            ? "Focus time! I'll keep watch. ⏱️"
            : "Relax! Take a deep breath. ☕"
        );
      }, 0);

      // Clear thought after 5s
      const clearThoughtTimeout = setTimeout(() => setThought(null), 5000);
      return () => {
        clearTimeout(syncTimeout);
        clearTimeout(clearThoughtTimeout);
      };
    } else if (timerActiveRef.current) {
      timerActiveRef.current = false;

      // Reset when stopping
      const resetTimeout = setTimeout(() => {
        setCurrentAnimation('idle');
        setTargetPosition({ x: 80, y: 70 });
      }, 0);

      return () => clearTimeout(resetTimeout);
    }
  }, [isTimerMode, timerState.sessionType]);

  // Periodic Timer Checks (every 5 mins approx, or based on time left)
  useEffect(() => {
    if (!isTimerMode) return;

    // Check periodically on specific time markers roughly
    const minsLeft = Math.floor(timerState.timeLeft / 60);
    const secsLeft = timerState.timeLeft % 60;

    let encouragementTimeout = null;
    let clearThoughtTimeout = null;

    // Only react on exact minute boundaries to avoid spam, and only sometimes
    if (secsLeft === 0 && minsLeft > 0 && minsLeft % 5 === 0) {
      encouragementTimeout = setTimeout(() => {
        setThought(`You're doing great! ${minsLeft}m to go! 🦊`);
      }, 0);
      clearThoughtTimeout = setTimeout(() => setThought(null), 4000);
    }

    return () => {
      if (encouragementTimeout) clearTimeout(encouragementTimeout);
      if (clearThoughtTimeout) clearTimeout(clearThoughtTimeout);
    };
  }, [timerState.timeLeft, isTimerMode]);

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
    },
    giggle: {
      scale: [1, 1.1, 1, 1.1, 1],
      rotate: [0, 5, -5, 5, 0],
      transition: { repeat: Infinity, duration: 0.3 }
    },
    dizzy: {
      rotate: [0, 360],
      x: [0, 10, -10, 10, 0],
      transition: { repeat: Infinity, duration: 2, ease: "linear" }
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
  const handleDrag = (event, info) => {
    // Detect shake (high velocity)
    const velocity = Math.sqrt(info.velocity.x ** 2 + info.velocity.y ** 2);

    if (velocity > 800) {
      if (!shakeStartRef.current) {
        shakeStartRef.current = Date.now();
      } else if (Date.now() - shakeStartRef.current > 1500) {
        // Sustained shake for 1.5s
        setCurrentAnimation('dizzy');
        setThought('Whoa... dizzy... 😵');

        // Stay dizzy for 2 seconds after shake stops
        if (thoughtTimeoutRef.current) clearTimeout(thoughtTimeoutRef.current);
        thoughtTimeoutRef.current = setTimeout(() => {
          setCurrentAnimation('idle');
          // Thought remains persistent now
        }, 2000);
      }
    } else {
      shakeStartRef.current = null;
    }
  };

  const handleDragEnd = () => {
    shakeStartRef.current = null;
    // Just trigger interaction to keep awake
    if (onInteraction) onInteraction();
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const cmdText = chatInput.trim();

    setThought('Thinking... 💭');
    if (onInteraction) onInteraction();

    // Send command to the handler after a short delay for UX.
    // Command parsing/dispatch happens upstream (in `onCommand`).
    setTimeout(() => {
      if (onCommand) onCommand(cmdText);
      setChatInput('');
      setChatMode(false);
    }, 1000);
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

      <Motion.div
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
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onMouseEnter={() => {
          if (currentAnimation === 'idle' && isAwake) {
            // Wait for 2 seconds of sustained hover before giggling
            hoverTimerRef.current = setTimeout(() => {
              setCurrentAnimation('giggle');
              setThought('*giggles* That tickles! 😆');
            }, 2000);
          }
        }}
        onMouseLeave={() => {
          if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
          if (currentAnimation === 'giggle') {
            setCurrentAnimation('idle');
          }
        }}
        onTap={() => {
          if (!chatMode) {
            setChatMode(true);
            setThought("What do we need? 🦊");
            if (onInteraction) onInteraction();
          }
        }}
      >
        <FoxieAvatarSVG
          mood={isTimerMode ? 'timer' : (currentAnimation === 'idle' ? mood : currentAnimation)}
          isListening={isListening}
          isAwake={isAwake}
          eyeOffset={eyeOffset}
        />

        {/* Thought Bubble / Chat Input */}
        <AnimatePresence>
          {(thought || chatMode) && (
            <Motion.div
              className="foxie-dialogue-bubble"
              initial={{ opacity: 0, scale: 0.5, y: 10, x: '-50%' }}
              animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, scale: 0.5, y: 10, x: '-50%' }}
              // Stop drag propagation on the bubble so we can interact with input
              onPointerDown={(e) => e.stopPropagation()}
            >
              {chatMode ? (
                <form className="foxie-dialogue-form" onSubmit={handleChatSubmit}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Tell Foxie..."
                    autoFocus
                    className="foxie-dialogue-input"
                    onBlur={() => setTimeout(() => setChatMode(false), 200)} // Close on blur delay
                  />
                </form>
              ) : (
                <>
                  <button
                    className="close-thought-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setThought(null);
                    }}
                    title="Close"
                  >
                    ×
                  </button>
                  <span className="foxie-dialogue-text">{thought}</span>
                </>
              )}
            </Motion.div>
          )}
        </AnimatePresence>
      </Motion.div>
    </>
  );
};

export default FoxieAvatar;
