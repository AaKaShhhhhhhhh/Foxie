import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useVoiceActivation - "Hey Foxie" wake word detection
 * Uses Web Speech API for voice recognition
 * Listens for wake phrase and voice commands
 */
export const useVoiceActivation = (onWake, onCommand) => {
  const [isListening, setIsListening] = useState(false);
  const [isAwake, setIsAwake] = useState(false);
  const [lastCommand, setLastCommand] = useState(null);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef(null);
  const confidenceRef = useRef(0);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.log('Speech recognition not supported');
      setVoiceSupported(false);
      return;
    }

    setVoiceSupported(true);

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3;

    recognitionRef.current = recognition;

    // Handle speech results
    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.toLowerCase().trim();
      const confidence = event.results[current][0].confidence;

      confidenceRef.current = confidence;

      // Wake word detection: "hey foxie" or "hi foxie" or "hello foxie"
      if (!isAwake && (
        transcript.includes('hey foxie') || 
        transcript.includes('hi foxie') || 
        transcript.includes('hello foxie') ||
        transcript.includes('wake up foxie')
      )) {
        setIsAwake(true);
        setLastCommand('WAKE');
        if (onWake) onWake();
        
        // Auto-sleep after 30 seconds of no commands
        setTimeout(() => {
          setIsAwake(false);
        }, 30000);
      }

      // Commands when awake
      if (isAwake && event.results[current].isFinal) {
        const command = parseCommand(transcript);
        if (command) {
          setLastCommand(command);
          if (onCommand) onCommand(command, transcript);
        }
      }
    };

    recognition.onerror = (event) => {
      console.log('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        // Restart listening
        setTimeout(() => {
          if (isListening) {
            try {
              recognition.start();
            } catch (e) {
              console.log('Already listening');
            }
          }
        }, 1000);
      }
    };

    recognition.onend = () => {
      // Restart if still supposed to be listening
      if (isListening) {
        try {
          recognition.start();
        } catch (e) {
          console.log('Already listening');
        }
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isAwake, isListening, onWake, onCommand]);

  /**
   * Parse voice commands
   */
  const parseCommand = (transcript) => {
    // Sleep/wake
    if (transcript.includes('sleep') || transcript.includes('go to sleep')) {
      return { type: 'SLEEP', data: null };
    }
    
    // Play/Entertainment
    if (transcript.includes('play') || transcript.includes('let\'s play')) {
      return { type: 'PLAY', data: null };
    }
    
    // Dance
    if (transcript.includes('dance') || transcript.includes('show me a dance')) {
      return { type: 'DANCE', data: null };
    }
    
    // Tricks
    if (transcript.includes('sit')) {
      return { type: 'SIT', data: null };
    }
    if (transcript.includes('jump')) {
      return { type: 'JUMP', data: null };
    }
    if (transcript.includes('spin')) {
      return { type: 'SPIN', data: null };
    }
    
    // Mood commands
    if (transcript.includes('how are you') || transcript.includes('how do you feel')) {
      return { type: 'STATUS', data: null };
    }
    
    // Feeding (life simulation)
    if (transcript.includes('eat') || transcript.includes('feed') || transcript.includes('hungry')) {
      return { type: 'FEED', data: null };
    }
    if (transcript.includes('drink') || transcript.includes('water') || transcript.includes('thirsty')) {
      return { type: 'DRINK', data: null };
    }
    
    // Affection
    if (transcript.includes('good boy') || transcript.includes('good girl') || transcript.includes('good fox')) {
      return { type: 'PRAISE', data: null };
    }
    if (transcript.includes('i love you') || transcript.includes('love you')) {
      return { type: 'LOVE', data: null };
    }
    
    // Tasks
    if (transcript.includes('focus') || transcript.includes('concentrate')) {
      return { type: 'FOCUS_MODE', data: null };
    }
    if (transcript.includes('break') || transcript.includes('rest')) {
      return { type: 'BREAK_MODE', data: null };
    }
    
    // General conversation
    if (transcript.length > 5) {
      return { type: 'CHAT', data: transcript };
    }
    
    return null;
  };

  /**
   * Start listening for "hey foxie"
   */
  const startListening = useCallback(() => {
    if (!voiceSupported || !recognitionRef.current) return;
    
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.log('Already listening or error:', error);
    }
  }, [voiceSupported]);

  /**
   * Stop listening
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  /**
   * Manual wake (for button trigger)
   */
  const wakeUp = useCallback(() => {
    setIsAwake(true);
    if (onWake) onWake();
  }, [onWake]);

  /**
   * Manual sleep
   */
  const sleep = useCallback(() => {
    setIsAwake(false);
  }, []);

  return {
    isListening,
    isAwake,
    lastCommand,
    voiceSupported,
    confidence: confidenceRef.current,
    startListening,
    stopListening,
    wakeUp,
    sleep,
  };
};

export default useVoiceActivation;
