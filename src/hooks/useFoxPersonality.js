import { useState, useEffect, useCallback } from 'react';

/**
 * useFoxPersonality - State machine for fox mood and behavior
 * Manages personality traits, moods, and behavioral state
 */
export const useFoxPersonality = (emotionStats = {}) => {
  const [mood, setMood] = useState('curious');
  const [personality, setPersonality] = useState({
    playfulness: 0.7,      // 0-1: how playful is the fox?
    tiredness: 0.3,        // 0-1: how tired?
    curiosity: 0.8,        // 0-1: how curious?
    sociability: 0.6,      // 0-1: how social?
  });

  const [currentBehavior, setCurrentBehavior] = useState('idle');
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [moodChangeTime, setMoodChangeTime] = useState(Date.now());

  // Mood transition rules based on stats
  const calculateMood = useCallback(() => {
    const {
      energy = 50,
      happiness = 50,
      focus = 50,
      stress = 50,
      trust = 50,
    } = emotionStats;

    // Determine mood based on stats
    if (stress > 70) return 'startled';
    if (energy < 20) return 'tired';
    if (happiness > 80 && energy > 60) return 'playful';
    if (focus > 75) return 'concentrated';
    if (trust > 80 && happiness > 60) return 'affectionate';
    if (energy < 40 && happiness < 40) return 'bored';
    
    return 'curious';
  }, [emotionStats]);

  // Update mood every 5 seconds
  useEffect(() => {
    const moodTimer = setInterval(() => {
      setMood(calculateMood());
      setMoodChangeTime(Date.now());
    }, 5000);

    return () => clearInterval(moodTimer);
  }, [calculateMood]);

  // Personality drift (fox evolves based on interaction)
  useEffect(() => {
    const personalityTimer = setInterval(() => {
      setPersonality(prev => ({
        playfulness: Math.max(0, Math.min(1, prev.playfulness + (Math.random() - 0.5) * 0.1)),
        tiredness: Math.max(0, Math.min(1, prev.tiredness + (Math.random() - 0.5) * 0.1)),
        curiosity: Math.max(0, Math.min(1, prev.curiosity + (Math.random() - 0.5) * 0.1)),
        sociability: Math.max(0, Math.min(1, prev.sociability + (Math.random() - 0.5) * 0.1)),
      }));
    }, 10000);

    return () => clearInterval(personalityTimer);
  }, []);

  // Behavior state machine
  const transitionBehavior = useCallback((trigger) => {
    const behaviorMap = {
      // Idle → any active state
      idle: ['sniffing', 'walking', 'playful', 'tail_wag'],
      
      // Active states
      sniffing: personality.curiosity > 0.7 ? ['walking', 'idle'] : ['idle'],
      walking: personality.playfulness > 0.7 ? ['playful', 'jumping'] : ['idle'],
      jumping: personality.tiredness > 0.6 ? ['idle'] : ['walking'],
      playful: personality.tiredness > 0.5 ? ['idle', 'sitting'] : ['jumping'],
      
      // Rest states
      sitting: personality.tiredness > 0.7 ? ['sleeping'] : ['idle', 'sniffing'],
      sleeping: personality.tiredness > 0.2 ? ['sleeping'] : ['idle', 'tail_wag'],
      
      // Interaction responses
      tail_wag: ['idle', 'playful'],
      scratching: ['idle', 'sitting'],
      startled: ['idle', 'running'],
      running: ['idle', 'playful'],
    };

    const nextBehaviors = behaviorMap[currentBehavior] || ['idle'];
    const nextBehavior = trigger || nextBehaviors[Math.floor(Math.random() * nextBehaviors.length)];
    
    setCurrentBehavior(nextBehavior);
  }, [currentBehavior, personality]);

  return {
    mood,
    personality,
    currentBehavior,
    isAutoMode,
    moodChangeTime,
    setMood,
    setCurrentBehavior,
    setIsAutoMode,
    transitionBehavior,
    calculateMood,
  };
};

export default useFoxPersonality;
