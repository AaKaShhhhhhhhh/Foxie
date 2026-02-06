import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePetEmotions } from '../hooks/useEmotions';
import { useBehaviorTracking } from '../hooks/useBehaviorTracking';
import { usePetSounds } from '../hooks/usePetSounds';
import { useFoxPersonality } from '../hooks/useFoxPersonality';
import { useFoxAutonomy } from '../hooks/useFoxAutonomy';
import { useVoiceActivation } from '../hooks/useVoiceActivation';
import { useLifeSimulation } from '../hooks/useLifeSimulation';

const MotionDiv = motion.div;

/**
 * PetAssistantUltimate - The ultimate AI fox with personality, autonomy, and mind of its own
 * 
 * Features:
 * - Lottie-ready fox avatar (currently using emoji fallback)
 * - Full autonomy with wandering and idle behaviors
 * - Personality-driven mood system
 * - Hand gesture recognition and reactions
 * - Sound effects synchronized with behaviors
 * - Charlie LLM integration for reasoning
 * - Adaptive UI via Tambo
 */
const PetAssistantUltimate = ({ userActive, windowsOpen, onSpeak, onNotification }) => {
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const handsRef = useRef(null);
  const charlieQueryRef = useRef(null);

  // Hand tracking state - must be declared before hooks that use it
  const [handVisible] = useState(false);
  const [currentGesture] = useState(null);
  const [foxScale, setFoxScale] = useState(1);

  // Emotion and behavior state
  const { stats, suggestion } = usePetEmotions({
    userActive,
    windowsOpen,
    focusSessionActive: false,
  });

  const { trackActivity } = useBehaviorTracking({});
  const { playMoodSound, playGestureSound, playNotificationSound } = usePetSounds();
  const { 
    mood: foxMood, 
    personality, 
    currentBehavior, 
    transitionBehavior 
  } = useFoxPersonality(stats);
  const { position, idleBehavior, isWalking } = useFoxAutonomy(
    handVisible,
    foxMood
  );

  // Voice activation system
  const {
    isListening: isVoiceListening,
    isAwake: isVoiceAwake,
    lastCommand: voiceCommand,
    voiceSupported,
    startListening,
    stopListening,
    wakeUp: voiceWake,
  } = useVoiceActivation(
    () => {
      // On wake callback
      playGestureSound('wave');
      setFoxScale(1.2);
      if (onSpeak) onSpeak('*perks up ears* I\'m listening! 👂');
      setTimeout(() => setFoxScale(1), 600);
    },
    (command, transcript) => {
      // On command callback
      handleVoiceCommand(command, transcript);
    }
  );

  // Life simulation system
  const {
    needs,
    feed,
    giveWater,
    rest,
    play,
    praise,
    getUrgentNeed,
    getMood: getLifeMood,
  } = useLifeSimulation();

  // Hand detection loop
  const detectHands = useCallback(() => {
    if (!handsRef.current || !videoRef.current) return;
  }, []);

  // Initialize MediaPipe Hands
  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        const { Hands, FilesetResolver } = await import('@mediapipe/tasks-vision');
        await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
        );

        const hands = new Hands({
          baseOptions: { 
            modelAssetPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm/hand_landmarker.task' 
          },
          runningMode: 'VIDEO',
          numHands: 1,
        });

        handsRef.current = hands;

        // Request camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
        });

        mediaStreamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            detectHands();
          };
        }
      } catch (error) {
        console.log('Hand tracking unavailable:', error.message);
      }
    };

    initMediaPipe();

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [detectHands]);

  /**
   * Voice command handler
   */
  const handleVoiceCommand = useCallback((command, transcript) => {
    if (!command) return;

    let response;

    switch (command.type) {
      case 'SLEEP':
        response = rest(10000);
        transitionBehavior('sleeping');
        break;

      case 'PLAY':
        response = play('fetch');
        transitionBehavior('playful');
        break;

      case 'DANCE':
        transitionBehavior('playful');
        setFoxScale(1.3);
        response = { message: '*dances around excitedly!* 💃' };
        setTimeout(() => setFoxScale(1), 1000);
        break;

      case 'SIT':
        transitionBehavior('sitting');
        response = { message: '*sits down obediently* 🐾' };
        break;

      case 'JUMP':
        transitionBehavior('jumping');
        response = { message: '*jumps high in the air!* ⬆️' };
        break;

      case 'SPIN':
        setFoxScale(1.2);
        response = { message: '*spins around in circles!* 🌀' };
        setTimeout(() => setFoxScale(1), 800);
        break;

      case 'STATUS': {
        const urgentNeed = getUrgentNeed();
        if (urgentNeed) {
          response = { message: `I need ${urgentNeed.need}! (${urgentNeed.value}%)` };
        } else {
          response = { message: `I'm feeling ${getLifeMood()}! 😊` };
        }
        break;
      }

      case 'FEED':
        response = feed('premium');
        break;

      case 'DRINK':
        response = giveWater();
        break;

      case 'PRAISE':
        response = praise();
        setFoxScale(1.15);
        setTimeout(() => setFoxScale(1), 500);
        break;

      case 'LOVE':
        response = praise();
        transitionBehavior('affectionate');
        if (onSpeak) onSpeak('*snuggles close* I love you too! 💕');
        return;

      case 'FOCUS_MODE':
        transitionBehavior('concentrated');
        response = { message: '*sits quietly and focuses with you* 🎯' };
        break;

      case 'BREAK_MODE':
        transitionBehavior('playful');
        response = { message: '*stretches* Time for a break! ☕' };
        break;

      case 'CHAT': {
        // Generic conversation response
        const chatResponses = [
          'I\'m listening! 🐾',
          'Tell me more! 👂',
          'That\'s interesting! 🤔',
          '*tilts head curiously*',
          'I understand! 💭',
        ];
        response = { message: chatResponses[Math.floor(Math.random() * chatResponses.length)] };
        break;
      }

      default:
        response = { message: '*looks confused* 🤨' };
    }

    if (response && response.message && onSpeak) {
      onSpeak(response.message);
    }

    playGestureSound('wave');
    trackActivity('voice_command', { command: command.type, transcript });
  }, [feed, giveWater, rest, play, praise, transitionBehavior, onSpeak, getUrgentNeed, getLifeMood, playGestureSound, trackActivity]);

  /**
   *  return;
    }

    try {
      const results = handsRef.current.detectForVideo(videoRef.current, performance.now());

      if (results.landmarks && results.landmarks.length > 0) {
        const hand = results.landmarks[0];

        setHandVisible(true);

        // Get hand center (middle finger base)
        const handCenter = hand[9];
        const normalizedX = (1 - handCenter.x) * 100;
        const normalizedY = handCenter.y * 100;

        setHandPosition({ x: normalizedX, y: normalizedY });
        setTargetPosition({ x: normalizedX, y: normalizedY });

        // Gesture detection
        const gesture = detectGesture(hand, previousLandmarks?.current);
        if (gesture !== currentGesture) {
          setCurrentGesture(gesture);
          handleGesture(gesture);
        }

        previousLandmarks.current = hand;
      } else {
        setHandVisible(false);
      }
    } catch (error) {
      console.log('Hand detection error:', error.message);
    }

    rafRef.current = requestAnimationFrame(detectHands);
  }, [currentGesture]);

  /**
   * Gesture handler with mood-based reactions
   */

  /**
   * Life simulation urgent needs alert
   */
  useEffect(() => {
    const urgentNeed = getUrgentNeed();
    if (urgentNeed && urgentNeed.urgency === 'critical') {
      const messages = {
        hunger: '*stomach growls* I\'m really hungry! 🍖',
        thirst: '*pants* I need water! 💧',
        sleep: '*yawns deeply* I\'m so tired... 😴',
        hygiene: '*scratches* I need a bath! 🛁',
      };
      
      if (onSpeak && Math.random() > 0.7) {
        onSpeak(messages[urgentNeed.need] || 'I need help!');
      }
    }
  }, [needs, getUrgentNeed, onSpeak]);

  /**
   * Auto-start voice listening on mount
   */
  useEffect(() => {
    if (voiceSupported && !isVoiceListening) {
      // Auto-start listening after 2 seconds
      const timer = setTimeout(() => {
        startListening();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [voiceSupported, isVoiceListening, startListening]);
  /**
   * Charlie LLM feedback hook
   * Occasionally asks Charlie for reasoning about fox behavior
   */
  useEffect(() => {
    const queryCharlie = async () => {
      if (charlieQueryRef.current) return; // Prevent multiple queries

      try {
        charlieQueryRef.current = true;

        // Placeholder for Charlie API call
        // const response = await charlieAPI.query(prompt);
        // setLastCharlieFeedback(response);

        // Fallback: local reasoning
        if (!userActive && personality.sociability > 0.7) {
          if (onSpeak) onSpeak('*notices you seem distracted... comes closer* 🐾');
          transitionBehavior('affectionate');
        }

        charlieQueryRef.current = false;
      } catch (error) {
        console.log('Charlie query error:', error.message);
        charlieQueryRef.current = false;
      }
    };

    // Query Charlie every 30 seconds during low activity
    if (!userActive) {
      const timer = setInterval(queryCharlie, 30000);
      return () => clearInterval(timer);
    }
  }, [userActive, foxMood, personality, onSpeak, transitionBehavior]);

  /**
   * Notification handler - fox startles
   */
  const handleNotification = useCallback(() => {
    playNotificationSound();
    transitionBehavior('startled');
    setFoxScale(1.1);
    if (onSpeak) onSpeak('*jumps back, startled!* 😲');
    setTimeout(() => setFoxScale(1), 500);
  }, [transitionBehavior, onSpeak, playNotificationSound]);

  // Expose notification handler
  useEffect(() => {
    if (onNotification) {
      onNotification(handleNotification);
    }
  }, [handleNotification, onNotification]);

  /**
   * Mood-based sound effects
   */
  useEffect(() => {
    if (Math.random() > 0.95) {
      playMoodSound(foxMood);
    }
  }, [foxMood, playMoodSound]);

  /**
   * Behavior animation mapping
   */
  const getBehaviorAnimation = () => {
    const animations = {
      idle: { scale: 1, rotate: 0, y: 0 },
      sniffing: { scale: 1.05, rotate: 0, y: 0 },
      walking: { scale: 1, rotate: 0, y: 0 },
      jumping: { scale: 1.15, rotate: 0, y: -20 },
      playful: { scale: 1.1, rotate: [0, 5, -5, 5, 0], y: 0 },
      sitting: { scale: 0.95, rotate: 0, y: 10 },
      sleeping: { scale: 0.85, rotate: 0, y: 0 },
      tail_wag: { scale: 1, rotate: 0, y: 0 },
      scratching: { scale: 1, rotate: 0, y: 0 },
      startled: { scale: 1.2, rotate: 0, y: -15 },
      running: { scale: 1.05, rotate: 0, y: 0 },
      concentrated: { scale: 0.95, rotate: 0, y: 0 },
      affectionate: { scale: 1.05, rotate: 0, y: 0 },
    };

    return animations[currentBehavior] || animations.idle;
  };

  const behaviorAnimation = getBehaviorAnimation();

  /**
   * Mood to emoji mapping
   */
  const moodEmoji = {
    happy: '😊',
    curious: '🐱',
    playful: '🤩',
    startled: '😲',
    tired: '😴',
    concentrated: '🤔',
    bored: '😑',
    affectionate: '🥰',
  };

  /**
   * Idle behavior visualization
   */
  const getIdleBehaviorEmoji = () => {
    if (!idleBehavior) return null;
    const emojis = {
      tail_wag: '↔️',
      scratching: '🖐️',
      head_tilt: '🤨',
      yawn: '😮‍💨',
      blink: '👁️',
    };
    return emojis[idleBehavior.type] || null;
  };

  return (
    <div className="pet-assistant-ultimate">
      {/* Hidden video for hand tracking */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        playsInline
        muted
      />

      {/* Hand tracking indicator */}
      <AnimatePresence>
        {handVisible && (
          <MotionDiv
            className="hand-indicator"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            ✋ Connected
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* Fox Avatar */}
      <motion.div
        className={`fox-avatar mood-${foxMood} behavior-${currentBehavior}`}
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
        }}
        animate={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          scale: (foxScale * (behaviorAnimation.scale || 1)),
          rotate: behaviorAnimation.rotate || 0,
          y: behaviorAnimation.y || 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 80,
          damping: 15,
          rotate: { duration: 0.4 },
        }}
      >
        {/* Fox body */}
        <div className="fox-body">
          <span className="fox-emoji">{moodEmoji[foxMood] || '🐱'}</span>
          
          {/* Idle behavior indicator */}
          <AnimatePresence>
            {idleBehavior && (
              <motion.div
                className="behavior-indicator"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
              >
                {getIdleBehaviorEmoji()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Speech thought bubble */}
        <motion.div
          className="thought-bubble"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
        >
          {suggestion}
        </motion.div>

        {/* Personality indicator (subtle) */}
        <div className="personality-aura">
          <div className="aura-ring" style={{
            borderColor: `rgba(${personality.playfulness * 255}, ${personality.curiosity * 255}, ${personality.sociability * 255}, 0.3)`
          }} />
        </div>
      </motion.div>

      {/* Gesture feedback overlay */}
      <AnimatePresence>
        {currentGesture && (
          <motion.div
            className={`gesture-feedback gesture-${currentGesture}`}
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
          >
            {currentGesture === 'wave' && '👋'}
            {currentGesture === 'thumbsUp' && '👍'}
            {currentGesture === 'proximity' && '👃'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Personality widget (top-left corner) */}
      <motion.div
        className="personality-widget"
        whileHover={{ opacity: 1 }}
        initial={{ opacity: 0.5 }}
        transition={{ duration: 0.3 }}
      >
        <div className="personality-stat">
          <span className="label">🎭 Mood</span>
          <span className="value">{foxMood}</span>
        </div>
        <div className="personality-stat">
          <span className="label">🎮 Playful</span>
          <span className="value">{(personality.playfulness * 100).toFixed(0)}%</span>
        </div>
        <div className="personality-stat">
          <span className="label">🔎 Curious</span>
          <span className="value">{(personality.curiosity * 100).toFixed(0)}%</span>
        </div>
        <div className="personality-stat">
          <span className="label">😴 Tired</span>
          <span className="value">{(personality.tiredness * 100).toFixed(0)}%</span>
        </div>
      </motion.div>

      {/* Call-to-action */}
      <AnimatePresence>
        {!handVisible && !isWalking && currentBehavior === 'idle' && (
          <motion.div
            className="cta-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
          >
            
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats panel on hover */}
      <motion.div
        className="stats-panel-ultimate"
        initial={{ opacity: 0, x: -20 }}
        whileHover={{ opacity: 1, x: 0 }}
      >
        <div className="stat-row">
          <span>Energy</span>
          <div className="bar"><div className="fill" style={{ width: `${stats.energy}%` }} /></div>
        </div>
        <div className="stat-row">
          <span>Happiness</span>
          <div className="bar"><div className="fill" style={{ width: `${stats.happiness}%` }} /></div>
        </div>
        <div className="stat-row">
          <span>Focus</span>
          <div className="bar"><div className="fill" style={{ width: `${stats.focus}%` }} /></div>
        </div>
        <div className="stat-row">
          <span>Trust</span>
          <div className="bar"><div className="fill" style={{ width: `${stats.trust}%` }} /></div>
        </div>
        <div className="behavior-info">
          <strong>Current:</strong> {currentBehavior}
        </div>
      </motion.div>

      {/* Voice Controls */}
      {voiceSupported && (
        <motion.div
          className="voice-controls"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h4>🎤 Voice Control</h4>
          <div className="voice-status">
            <div className={`status-indicator ${isVoiceListening ? 'listening' : ''} ${isVoiceAwake ? 'awake' : ''}`} />
            <span>
              {isVoiceListening 
                ? (isVoiceAwake ? '🎙️ Awake & Listening' : '🔇 Waiting for "Hey Foxie"') 
                : '⏸️ Paused'}
            </span>
          </div>
          <div className="voice-actions">
            {!isVoiceListening ? (
              <button onClick={startListening} className="btn-primary">
                Start Listening
              </button>
            ) : (
              <>
                <button onClick={stopListening} className="btn-secondary">
                  Stop Listening
                </button>
                {!isVoiceAwake && (
                  <button onClick={voiceWake} className="btn-accent">
                    Wake Foxie
                  </button>
                )}
              </>
            )}
          </div>
          {voiceCommand && (
            <div className="last-command">
              Last: <span className="command-text">{voiceCommand.type}</span>
            </div>
          )}
          <div className="voice-help">
            <p><strong>Say:</strong> "Hey Foxie" to wake</p>
            <p><small>Commands: feed, drink, play, sleep, sit, jump, spin, dance, status</small></p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PetAssistantUltimate;
