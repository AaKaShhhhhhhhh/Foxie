import { useEffect, useRef } from 'react';
import { Howl, Howler } from 'howler';

/**
 * usePetSounds - Manages all pet sound effects
 * Uses Howler.js for audio management
 * 
 * Mood sounds: happy, excited, angry, sad, bored, sleepy, thinking
 * Gesture sounds: wave, thumbsUp, proximity
 * Event sounds: taskComplete, focusStart, focusBreak
 */
export const usePetSounds = () => {
  const soundsRef = useRef({});
  const volumeRef = useRef(0.5);

  // Initialize sounds on mount
  useEffect(() => {
    // Create base sound URLs using data URIs or external resources
    // For demo: using simple beep tones (can be replaced with actual audio files)
    
    soundsRef.current = {
      happy: new Howl({
        src: ['data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=='],
        volume: 0.3,
      }),
      excited: new Howl({
        src: ['data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=='],
        volume: 0.4,
      }),
      sad: new Howl({
        src: ['data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=='],
        volume: 0.2,
      }),
      sleepy: new Howl({
        src: ['data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=='],
        volume: 0.2,
      }),
    };

    return () => {
      // Cleanup sounds
      Object.values(soundsRef.current).forEach(sound => {
        if (sound) sound.unload();
      });
    };
  }, []);

  /**
   * Play mood-based sound
   */
  const playMoodSound = (mood) => {
    const sound = soundsRef.current[mood];
    if (sound && volumeRef.current > 0) {
      sound.volume(volumeRef.current);
      sound.play();
    }
  };

  /**
   * Play gesture reaction sound
   */
  const playGestureSound = (gesture) => {
    const sounds = {
      wave: () => playTone(440, 100),      // A4 note
      thumbsUp: () => playTone(550, 150),  // C#5 note
      proximity: () => playTone(330, 80),  // E4 note
    };

    if (sounds[gesture]) {
      sounds[gesture]();
    }
  };

  /**
   * Play notification sound
   */
  const playNotificationSound = () => {
    playTone(880, 100); // A5 note
  };

  /**
   * Play task completion sound
   */
  const playTaskCompleteSound = () => {
    // Play a quick ascending tone sequence
    playTone(440, 100);
    setTimeout(() => playTone(550, 100), 150);
    setTimeout(() => playTone(660, 150), 300);
  };

  /**
   * Play focus start sound
   */
  const playFocusStartSound = () => {
    playTone(523, 200); // C5 note
  };

  /**
   * Play focus break sound
   */
  const playFocusBreakSound = () => {
    playTone(659, 100);  // E5 note
    setTimeout(() => playTone(659, 100), 150);
  };

  /**
   * Helper to play tone using Web Audio API
   */
  const playTone = (frequency, duration) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(volumeRef.current * 0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.log('Audio playback not available:', error.message);
    }
  };

  /**
   * Set volume (0-1)
   */
  const setVolume = (vol) => {
    volumeRef.current = Math.max(0, Math.min(1, vol));
    Howler.volume(volumeRef.current);
  };

  /**
   * Toggle mute
   */
  const toggleMute = () => {
    volumeRef.current = volumeRef.current > 0 ? 0 : 0.5;
    Howler.volume(volumeRef.current);
  };

  return {
    playMoodSound,
    playGestureSound,
    playNotificationSound,
    playTaskCompleteSound,
    playFocusStartSound,
    playFocusBreakSound,
    setVolume,
    toggleMute,
    isMuted: volumeRef.current === 0,
  };
};

export default usePetSounds;
