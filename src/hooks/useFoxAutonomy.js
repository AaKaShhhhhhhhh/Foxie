import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useFoxAutonomy - Manages autonomous wandering and idle behaviors
 * Fox wanders independently even without hand input
 * Includes random behaviors like tail wag, scratching, sitting
 */
export const useFoxAutonomy = (isHandVisible = false, mood = 'curious') => {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });
  const [idleBehavior, setIdleBehavior] = useState(null);
  const [isWalking, setIsWalking] = useState(false);
  const autonomyTimerRef = useRef(null);
  const behaviorTimerRef = useRef(null);

  // Smooth position interpolation (easing)
  useEffect(() => {
    const animationFrame = setInterval(() => {
      setPosition(prev => {
        const dx = targetPosition.x - prev.x;
        const dy = targetPosition.y - prev.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 1) return prev;

        // Spring physics for smooth movement
        const easing = 0.15;
        return {
          x: prev.x + dx * easing,
          y: prev.y + dy * easing,
        };
      });
    }, 50);

    return () => clearInterval(animationFrame);
  }, [targetPosition]);

  // Autonomous wandering loop
  useEffect(() => {
    if (isHandVisible) {
      setIsWalking(false);
      return;
    }

    const wander = () => {
      // Decide whether to move or stay
      if (Math.random() > 0.6) {
        // Move to a new location
        setIsWalking(true);
        const newX = Math.max(5, Math.min(95, Math.random() * 100));
        const newY = Math.max(5, Math.min(95, Math.random() * 100));
        setTargetPosition({ x: newX, y: newY });

        // Walk duration based on mood
        const walkDuration = mood === 'playful' ? 2000 : mood === 'tired' ? 4000 : 3000;
        setTimeout(() => setIsWalking(false), walkDuration);
      }

      // Schedule next wander (3-8 seconds)
      autonomyTimerRef.current = setTimeout(wander, 3000 + Math.random() * 5000);
    };

    autonomyTimerRef.current = setTimeout(wander, 1000);

    return () => {
      if (autonomyTimerRef.current) clearTimeout(autonomyTimerRef.current);
    };
  }, [isHandVisible, mood]);

  // Random idle behaviors (tail wag, scratch, sit)
  useEffect(() => {
    if (isWalking || isHandVisible) {
      setIdleBehavior(null);
      return;
    }

    const idleBehaviors = [
      { type: 'tail_wag', duration: 1000 },
      { type: 'scratching', duration: 1500 },
      { type: 'head_tilt', duration: 800 },
      { type: 'yawn', duration: 1200 },
      { type: 'blink', duration: 200 },
    ];

    const triggerBehavior = () => {
      if (Math.random() > 0.7) {
        const behavior = idleBehaviors[Math.floor(Math.random() * idleBehaviors.length)];
        setIdleBehavior(behavior);

        setTimeout(() => {
          setIdleBehavior(null);
        }, behavior.duration);
      }

      behaviorTimerRef.current = setTimeout(triggerBehavior, 4000 + Math.random() * 6000);
    };

    behaviorTimerRef.current = setTimeout(triggerBehavior, 2000);

    return () => {
      if (behaviorTimerRef.current) clearTimeout(behaviorTimerRef.current);
    };
  }, [isWalking, isHandVisible]);

  return {
    position,
    setTargetPosition,
    idleBehavior,
    isWalking,
  };
};

export default useFoxAutonomy;
