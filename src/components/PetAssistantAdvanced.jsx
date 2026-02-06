import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePetEmotions } from '../hooks/useEmotions';
import { useBehaviorTracking } from '../hooks/useBehaviorTracking';
import { usePetSounds } from '../hooks/usePetSounds';
import { detectGesture, getHandPosition } from '../utils/gestureRecognition';

/**
 * Advanced PetAssistant with:
 * - Hand tracking via MediaPipe
 * - Gesture recognition (wave, thumbs up, proximity)
 * - Mood-based autonomy
 * - Sound effects
 * - Lottie animations
 */
const PetAssistantAdvanced = ({ userActive, windowsOpen, onSpeak }) => {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const handsRef = useRef(null);
  const rafRef = useRef(null);
  const previousLandmarks = useRef(null);

  // Pet state
  const [foxPosition, setFoxPosition] = useState({ x: 50, y: 50 });
  const [foxScale, setFoxScale] = useState(1);
  const [isWagging, setIsWagging] = useState(false);
  const [currentGesture, setCurrentGesture] = useState(null);
  const [handVisible, setHandVisible] = useState(false);
  const [autonomyMode, setAutonomyMode] = useState('idle');

  // Emotion system
  const { stats, mood, suggestion } = usePetEmotions({
    userActive,
    windowsOpen,
    focusSessionActive: false,
  });

  const { trackActivity } = useBehaviorTracking({});
  const { playMoodSound, playGestureSound, playNotificationSound } = usePetSounds();

  // Initialize MediaPipe Hands
  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        const { Hands, FilesetResolver } = await import('@mediapipe/tasks-vision');
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
        );

        const hands = new Hands({
          baseOptions: { modelAssetPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm/hand_landmarker.task' },
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
        console.log('MediaPipe Hand tracking not available:', error.message);
        setHandVisible(false);
      }
    };

    initMediaPipe();

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Hand detection loop
  const detectHands = useCallback(() => {
    if (!handsRef.current || !videoRef.current) {
      rafRef.current = requestAnimationFrame(detectHands);
      return;
    }

    try {
      const results = handsRef.current.detectForVideo(videoRef.current, performance.now());

      if (results.landmarks && results.landmarks.length > 0) {
        const hand = results.landmarks[0];
        const handedness = results.handedness ? results.handedness[0].categoryName : 'Right';

        setHandVisible(true);

        // Get hand center (middle finger base)
        const handCenter = hand[9];
        const normalizedX = (1 - handCenter.x) * 100; // Flip for camera mirroring
        const normalizedY = handCenter.y * 100;

        // Move fox toward hand with smooth animation
        setFoxPosition({
          x: Math.max(0, Math.min(100, normalizedX)),
          y: Math.max(0, Math.min(100, normalizedY)),
        });

        // Gesture detection
        const gesture = detectGestureFromLandmarks(hand, previousLandmarks?.current);
        if (gesture !== currentGesture) {
          setCurrentGesture(gesture);
          handleGesture(gesture);
        }

        // Store for next frame
        if (!previousLandmarks.current) {
          previousLandmarks.current = hand;
        } else {
          previousLandmarks.current = hand;
        }
      } else {
        setHandVisible(false);
        setAutonomyMode('wander');
      }
    } catch (error) {
      console.log('Hand detection error:', error.message);
    }

    rafRef.current = requestAnimationFrame(detectHands);
  }, [currentGesture]);

  /**
   * Gesture detection based on hand landmarks
   * Wave: hand moving left-right rapidly
   * Thumbs up: thumb extended upward
   * Proximity: hand close to camera (large scale)
   */
  const detectGestureFromLandmarks = (landmarks, previousLandmarks) => {
    return detectGesture(landmarks, previousLandmarks);
  };

  /**
   * Handle recognized gestures
   */
  const handleGesture = (gesture) => {
    switch (gesture) {
      case 'wave':
        playGestureSound('wave');
        setIsWagging(true);
        setFoxScale(1.1);
        if (onSpeak) onSpeak('*waves paw back excitedly*');
        trackActivity('pet_interaction', { type: 'wave' });
        setTimeout(() => {
          setIsWagging(false);
          setFoxScale(1);
        }, 500);
        break;

      case 'thumbsUp':
        playGestureSound('thumbsUp');
        setFoxScale(1.2);
        if (onSpeak) onSpeak('*jumps and spins around*');
        trackActivity('pet_interaction', { type: 'thumbsUp' });
        setTimeout(() => setFoxScale(1), 600);
        break;

      case 'proximity':
        playGestureSound('proximity');
        if (onSpeak) onSpeak('*sniffs curiously* 👃');
        trackActivity('pet_interaction', { type: 'proximity' });
        break;

      default:
        break;
    }
  };

  // Autonomy: random idle behaviors
  useEffect(() => {
    if (!handVisible && autonomyMode === 'wander') {
      const autonomyTimer = setInterval(() => {
        const behaviors = ['idle', 'wiggle', 'sit', 'scratch'];
        const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];

        // Random walk
        setFoxPosition(prev => ({
          x: Math.max(0, Math.min(100, prev.x + (Math.random() - 0.5) * 20)),
          y: Math.max(0, Math.min(100, prev.y + (Math.random() - 0.5) * 10)),
        }));

        if (behavior === 'wiggle') {
          setIsWagging(true);
          setTimeout(() => setIsWagging(false), 300);
        }
      }, 3000);

      return () => clearInterval(autonomyTimer);
    }
  }, [handVisible, autonomyMode]);

  // Mood-based reactions
  useEffect(() => {
    const moodReactions = {
      happy: ['*tail wagging happily* 💕', 'Feeling great!', '*does a little spin*'],
      excited: ['*bounces excitedly* 🎉', 'Woohoo!', '*happy jumping*'],
      angry: ['*growls* 😠', '*paces back and forth*', 'Hmph!'],
      sad: ['*lies down sadly* 😢', 'I miss you...', '*sighs*'],
      bored: ['*yawns* 😑', 'When will you play?', '*stares blankly*'],
      sleepy: ['*eyes close slowly* 😴', 'Zzzzz...', '*curls up*'],
      thinking: ['*tilts head* 🤔', 'Hmm, interesting...', '*thinks deeply*'],
      neutral: ['*sits peacefully*', 'Just hanging out', '*looks around*'],
    };

    const reactions = moodReactions[mood] || moodReactions.neutral;
    const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];

    // Play mood sound occasionally
    if (Math.random() > 0.7) {
      playMoodSound(mood);
    }

    const moodTimer = setTimeout(() => {
      if (onSpeak && Math.random() > 0.7) {
        onSpeak(randomReaction);
      }
    }, 8000);

    return () => clearTimeout(moodTimer);
  }, [mood, onSpeak, playMoodSound]);

  /**
   * Mood to CSS animation mapping
   */
  const getMoodAnimation = () => {
    const animations = {
      happy: { scale: 1, rotate: 0 },
      excited: { scale: 1.15, rotate: 5 },
      angry: { scale: 1, rotate: -5 },
      sad: { scale: 0.9, rotate: 0 },
      bored: { scale: 0.95, rotate: 0 },
      sleepy: { scale: 0.85, rotate: -10 },
      thinking: { scale: 1, rotate: 0 },
      neutral: { scale: 1, rotate: 0 },
    };

    return animations[mood] || animations.neutral;
  };

  const moodAnimation = getMoodAnimation();

  // Emoji map for moods
  const moodEmoji = {
    happy: '😊',
    excited: '🤩',
    angry: '😠',
    sad: '😢',
    bored: '😑',
    sleepy: '😴',
    thinking: '🤔',
    neutral: '🙂',
  };

  return (
    <div className="pet-assistant-advanced">
      {/* Hidden video feed for hand tracking */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        playsInline
        muted
      />

      {/* Canvas for MediaPipe visualization (optional) */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Hand detection indicator */}
      <AnimatePresence>
        {handVisible && (
          <motion.div
            className="hand-indicator"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
          >
            ✋ Tracking
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fox Avatar */}
      <motion.div
        className={`fox-container mood-${mood}`}
        style={{
          left: `${foxPosition.x}%`,
          top: `${foxPosition.y}%`,
          scale: foxScale * (moodAnimation.scale || 1),
          rotate: moodAnimation.rotate || 0,
        }}
        animate={{
          left: `${foxPosition.x}%`,
          top: `${foxPosition.y}%`,
          scale: foxScale * (moodAnimation.scale || 1),
          rotate: isWagging ? [0, 5, -5, 5, 0] : moodAnimation.rotate || 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 100,
          damping: 20,
          rotate: { duration: 0.5 },
        }}
      >
        <div className="fox-body">
          <span className="fox-emoji">{moodEmoji[mood] || '🙂'}</span>
          
          {/* Tail */}
          <motion.div
            className="fox-tail"
            animate={isWagging ? { rotate: [0, 30, -30, 30, 0] } : { rotate: 0 }}
            transition={{ duration: 0.4 }}
          >
            🪶
          </motion.div>
        </div>

        {/* Thought bubble for mood */}
        <motion.div
          className="thought-bubble"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          {suggestion}
        </motion.div>
      </motion.div>

      {/* Interaction prompt */}
      <AnimatePresence>
        {!handVisible && autonomyMode === 'wander' && (
          <motion.div
            className="prompt-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gesture feedback */}
      <AnimatePresence>
        {currentGesture && (
          <motion.div
            className={`gesture-feedback gesture-${currentGesture}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
          >
            {currentGesture === 'wave' && '👋'}
            {currentGesture === 'thumbsUp' && '👍'}
            {currentGesture === 'proximity' && '👃'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Panel - Shows on hover */}
      <motion.div
        className="stats-panel-advanced"
        initial={{ opacity: 0, x: -20 }}
        whileHover={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="stat-row">
          <span className="stat-label">Energy</span>
          <div className="stat-bar">
            <div className="stat-fill" style={{ width: `${stats.energy}%`, backgroundColor: '#FFD700' }}></div>
          </div>
          <span className="stat-value">{Math.round(stats.energy)}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Happiness</span>
          <div className="stat-bar">
            <div className="stat-fill" style={{ width: `${stats.happiness}%`, backgroundColor: '#FF69B4' }}></div>
          </div>
          <span className="stat-value">{Math.round(stats.happiness)}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Focus</span>
          <div className="stat-bar">
            <div className="stat-fill" style={{ width: `${stats.focus}%`, backgroundColor: '#00BFFF' }}></div>
          </div>
          <span className="stat-value">{Math.round(stats.focus)}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Stress</span>
          <div className="stat-bar">
            <div className="stat-fill" style={{ width: `${stats.stress}%`, backgroundColor: '#FF6347' }}></div>
          </div>
          <span className="stat-value">{Math.round(stats.stress)}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Trust</span>
          <div className="stat-bar">
            <div className="stat-fill" style={{ width: `${stats.trust}%`, backgroundColor: '#32CD32' }}></div>
          </div>
          <span className="stat-value">{Math.round(stats.trust)}</span>
        </div>
      </motion.div>
    </div>
  );
};

export default PetAssistantAdvanced;
