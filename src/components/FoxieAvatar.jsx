import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

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
  const [position, setPosition] = useState({ x: 70, y: 30 });
  const [targetPosition, setTargetPosition] = useState({ x: 70, y: 30 });
  const [currentAnimation, setCurrentAnimation] = useState('idle');
  const [expression, setExpression] = useState('😊');
  const [thought, setThought] = useState(null);
  const [isFollowingMouse, setIsFollowingMouse] = useState(false);
  const [blinkState, setBlink] = useState(false);
  const [tailWag, setTailWag] = useState(false);
  const [earTwitch, setEarTwitch] = useState(false);
  
  // Mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Refs
  const animationTimeoutRef = useRef(null);
  const wanderIntervalRef = useRef(null);
  const thoughtTimeoutRef = useRef(null);

  /**
   * Expression mapping based on mood and state
   */
  const getExpression = useCallback(() => {
    if (!isAwake) return '😴';
    if (currentAnimation === 'eating') return '😋';
    if (currentAnimation === 'drinking') return '😊';
    if (currentAnimation === 'dancing') return '🤩';
    if (currentAnimation === 'jumping') return '😆';
    if (currentAnimation === 'love') return '🥰';
    if (currentAnimation === 'bark') return '😮';
    
    // Mood-based expressions
    const moodExpressions = {
      ecstatic: '🤩',
      happy: '😊',
      content: '😌',
      curious: '🤔',
      playful: '😸',
      tired: '😪',
      sad: '😢',
      hungry: '🥺',
      thirsty: '😫',
      sleepy: '😴',
      excited: '🤗',
      alert: '👀',
    };
    
    return moodExpressions[mood] || '🐱';
  }, [mood, isAwake, currentAnimation]);

  /**
   * React to voice commands
   */
  useEffect(() => {
    if (!lastCommand) return;

    const reactions = {
      WAKE: () => {
        setCurrentAnimation('alert');
        setExpression('👀');
        setThought('*perks up* I\'m listening! 🦊');
        setEarTwitch(true);
        setTimeout(() => setEarTwitch(false), 500);
      },
      SLEEP: () => {
        setCurrentAnimation('sleeping');
        setExpression('😴');
        setThought('*yawns* Good night... 💤');
      },
      PLAY: () => {
        setCurrentAnimation('playful');
        setExpression('🤩');
        setThought('Yay! Let\'s play! 🎮');
        setTailWag(true);
      },
      DANCE: () => {
        setCurrentAnimation('dancing');
        setExpression('💃');
        setThought('*dances around* 🎵');
        setTailWag(true);
      },
      SIT: () => {
        setCurrentAnimation('sitting');
        setExpression('🐕');
        setThought('*sits obediently* 🐾');
      },
      JUMP: () => {
        setCurrentAnimation('jumping');
        setExpression('😆');
        setThought('Wheee! ⬆️');
      },
      SPIN: () => {
        setCurrentAnimation('spinning');
        setExpression('😵');
        setThought('*spins around* 🌀');
      },
      FEED: () => {
        setCurrentAnimation('eating');
        setExpression('😋');
        setThought('*nom nom nom* 🍖');
      },
      DRINK: () => {
        setCurrentAnimation('drinking');
        setExpression('😊');
        setThought('*lap lap lap* 💧');
      },
      PRAISE: () => {
        setCurrentAnimation('happy');
        setExpression('🥰');
        setThought('*happy wiggles* Thank you! 💕');
        setTailWag(true);
      },
      LOVE: () => {
        setCurrentAnimation('love');
        setExpression('😍');
        setThought('I love you too! 💖💖💖');
        setTailWag(true);
      },
      FOCUS: () => {
        setCurrentAnimation('focus');
        setExpression('🧐');
        setThought('*concentrating* Let\'s work! 🎯');
      },
      BREAK: () => {
        setCurrentAnimation('relaxed');
        setExpression('😌');
        setThought('Break time! ☕');
      },
      COME: () => {
        setCurrentAnimation('running');
        setExpression('🏃');
        setThought('Coming! 🦊');
        // Move towards center
        setTargetPosition({ x: 50, y: 50 });
      },
      STAY: () => {
        setCurrentAnimation('alert');
        setExpression('🐕');
        setThought('*staying still* ⏸️');
      },
      BARK: () => {
        setCurrentAnimation('bark');
        setExpression('😮');
        setThought('Yip yip yip! 🔊');
      },
      ROLL: () => {
        setCurrentAnimation('rolling');
        setExpression('🙃');
        setThought('*rolls over* 🔄');
      },
      HIGHFIVE: () => {
        setCurrentAnimation('highfive');
        setExpression('✋');
        setThought('High five! ✋🦊');
      },
      SHAKE: () => {
        setCurrentAnimation('shake');
        setExpression('🐾');
        setThought('*offers paw* 🤝');
      },
      CHAT: () => {
        setCurrentAnimation('curious');
        setExpression('🤔');
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
        setTailWag(false);
        setCurrentAnimation('idle');
      }, 3000);
    }
  }, [lastCommand]);

  /**
   * Mouse tracking for eye follow
   */
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      
      // Occasionally follow mouse if curious
      if (Math.random() > 0.98 && isAwake && currentAnimation === 'idle') {
        setIsFollowingMouse(true);
        setExpression('👀');
        setThought('*watching curiously*');
        
        setTimeout(() => {
          setIsFollowingMouse(false);
          setThought(null);
        }, 2000);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY, isAwake, currentAnimation]);

  /**
   * Blinking animation
   */
  useEffect(() => {
    if (!isAwake) return;
    
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, [isAwake]);

  /**
   * Random idle behaviors
   */
  useEffect(() => {
    if (!isAwake || currentAnimation !== 'idle') return;

    const idleBehaviors = () => {
      const behaviors = [
        () => { setEarTwitch(true); setTimeout(() => setEarTwitch(false), 300); },
        () => { setTailWag(true); setTimeout(() => setTailWag(false), 1000); },
        () => { setThought('*sniffs the air* 👃'); setTimeout(() => setThought(null), 2000); },
        () => { setExpression('🤔'); setTimeout(() => setExpression(getExpression()), 1500); },
        () => { setThought('*yawns* 😮‍💨'); setTimeout(() => setThought(null), 1500); },
      ];
      
      const randomBehavior = behaviors[Math.floor(Math.random() * behaviors.length)];
      randomBehavior();
    };

    const interval = setInterval(idleBehaviors, 5000 + Math.random() * 5000);
    return () => clearInterval(interval);
  }, [isAwake, currentAnimation, getExpression]);

  /**
   * Autonomous wandering
   */
  useEffect(() => {
    if (!isAwake || currentAnimation !== 'idle') return;

    wanderIntervalRef.current = setInterval(() => {
      if (Math.random() > 0.6) {
        const newX = Math.max(10, Math.min(90, position.x + (Math.random() - 0.5) * 30));
        const newY = Math.max(10, Math.min(80, position.y + (Math.random() - 0.5) * 20));
        setTargetPosition({ x: newX, y: newY });
        setCurrentAnimation('walking');
        
        setTimeout(() => {
          setCurrentAnimation('idle');
        }, 2000);
      }
    }, 8000);

    return () => {
      if (wanderIntervalRef.current) clearInterval(wanderIntervalRef.current);
    };
  }, [isAwake, currentAnimation, position]);

  /**
   * Smooth position movement
   */
  useEffect(() => {
    const moveToTarget = () => {
      setPosition(prev => ({
        x: prev.x + (targetPosition.x - prev.x) * 0.05,
        y: prev.y + (targetPosition.y - prev.y) * 0.05,
      }));
    };

    const interval = setInterval(moveToTarget, 50);
    return () => clearInterval(interval);
  }, [targetPosition]);

  /**
   * React to needs changes
   */
  useEffect(() => {
    if (needs.hunger < 20) {
      setThought('*stomach growls* I\'m hungry! 🍖');
      setExpression('🥺');
    } else if (needs.thirst < 20) {
      setThought('*pants* I need water! 💧');
      setExpression('😫');
    } else if (needs.sleep < 20) {
      setThought('*yawns* So sleepy... 😴');
      setExpression('😪');
    }
  }, [needs]);

  /**
   * Get animation styles
   */
  const getAnimationStyles = () => {
    const animations = {
      idle: { scale: 1, rotate: 0, y: 0 },
      sleeping: { scale: 0.9, rotate: 0, y: 5 },
      playful: { scale: 1.1, rotate: [0, 5, -5, 5, 0], y: 0 },
      dancing: { scale: 1.15, rotate: [0, 10, -10, 10, -10, 0], y: [-5, 0, -5] },
      sitting: { scale: 0.95, rotate: 0, y: 10 },
      jumping: { scale: 1.2, rotate: 0, y: [-30, 0] },
      spinning: { scale: 1, rotate: 360, y: 0 },
      eating: { scale: 1.05, rotate: [0, 2, -2, 2, 0], y: 3 },
      drinking: { scale: 1, rotate: 0, y: 5 },
      walking: { scale: 1, rotate: [0, 2, -2, 0], y: 0 },
      running: { scale: 1.05, rotate: [0, 3, -3, 0], y: [-2, 0] },
      alert: { scale: 1.1, rotate: 0, y: -5 },
      love: { scale: 1.2, rotate: 0, y: [-5, 0, -5] },
      happy: { scale: 1.1, rotate: 0, y: [-3, 0] },
      curious: { scale: 1.05, rotate: 5, y: 0 },
      focus: { scale: 0.95, rotate: 0, y: 0 },
      relaxed: { scale: 1, rotate: 0, y: 2 },
      bark: { scale: 1.15, rotate: 0, y: -5 },
      rolling: { scale: 1, rotate: [0, 180, 360], y: 0 },
      highfive: { scale: 1.1, rotate: -15, y: -10 },
      shake: { scale: 1.05, rotate: 10, y: 0 },
    };

    return animations[currentAnimation] || animations.idle;
  };

  return (
    <motion.div
      className={`foxie-avatar ${currentAnimation} ${isAwake ? 'awake' : 'sleeping'}`}
      style={{
        position: 'fixed',
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
      }}
      animate={getAnimationStyles()}
      transition={{
        type: 'spring',
        stiffness: 120,
        damping: 15,
        rotate: { duration: currentAnimation === 'spinning' ? 0.5 : 0.3 },
      }}
    >
      {/* Fox Body */}
      <div className="fox-body-container">
        {/* Ears */}
        <motion.div 
          className="fox-ears"
          animate={{ 
            rotateZ: earTwitch ? [0, 15, -15, 0] : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="ear left">🦊</div>
        </motion.div>

        {/* Main Face/Body */}
        <motion.div 
          className="fox-face"
          animate={{
            scale: blinkState ? [1, 0.95, 1] : 1,
          }}
        >
          <span className="expression">{expression}</span>
          
          {/* Eyes overlay for blinking */}
          <AnimatePresence>
            {blinkState && (
              <motion.div
                className="blink-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                😑
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Tail */}
        <motion.div 
          className="fox-tail"
          animate={{
            rotate: tailWag ? [0, 30, -30, 30, -30, 0] : 0,
          }}
          transition={{ duration: 0.5, repeat: tailWag ? Infinity : 0 }}
        >
          <span>🦊</span>
        </motion.div>
      </div>

      {/* Thought Bubble */}
      <AnimatePresence>
        {thought && (
          <motion.div
            className="thought-bubble"
            initial={{ opacity: 0, y: 20, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
          >
            <div className="thought-content">{thought}</div>
            <div className="thought-tail" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Listening Indicator */}
      <AnimatePresence>
        {isListening && isAwake && (
          <motion.div
            className="listening-indicator"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            <span className="pulse-ring" />
            <span className="mic-icon">🎤</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Needs Warning */}
      <AnimatePresence>
        {(needs.hunger < 30 || needs.thirst < 30 || needs.sleep < 30) && (
          <motion.div
            className="needs-warning"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            {needs.hunger < 30 && '🍖'}
            {needs.thirst < 30 && '💧'}
            {needs.sleep < 30 && '😴'}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FoxieAvatar;
