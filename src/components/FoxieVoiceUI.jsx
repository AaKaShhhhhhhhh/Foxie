import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * FoxieVoiceUI - Sleek, tech-savvy voice control interface
 * Real microphone permissions and voice activation
 */
const FoxieVoiceUI = ({ 
  onWake, 
  onCommand, 
  onMoodChange,
  foxieState = 'idle' 
}) => {
  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [isAwake, setIsAwake] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState(null);
  const [visualizerBars, setVisualizerBars] = useState(Array(12).fill(0));
  const [voiceSupported, setVoiceSupported] = useState(true);
  
  // Refs
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const awakeTimeoutRef = useRef(null);
  const streamRef = useRef(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
    }
  }, []);

  /**
   * Request microphone permission and setup audio visualizer
   */
  const requestMicPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      setHasPermission(true);
      setPermissionDenied(false);
      
      // Setup audio context for visualizer
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 32;
      
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setPermissionDenied(true);
      setHasPermission(false);
      return false;
    }
  }, []);

  /**
   * Audio visualizer animation
   */
  const updateVisualizer = useCallback(() => {
    if (!analyserRef.current || !isListening) {
      setVisualizerBars(Array(12).fill(0));
      return;
    }

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Map to 12 bars
    const bars = [];
    for (let i = 0; i < 12; i++) {
      const index = Math.floor(i * dataArray.length / 12);
      bars.push(dataArray[index] / 255);
    }
    
    setVisualizerBars(bars);
    animationFrameRef.current = requestAnimationFrame(updateVisualizer);
  }, [isListening]);

  /**
   * Initialize Speech Recognition
   */
  const initSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3;

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.toLowerCase().trim();
      setCurrentTranscript(transcript);

      // Wake word detection
      const wakeWords = ['hey foxie', 'hi foxie', 'hello foxie', 'hey foxy', 'hi foxy', 'ok foxie'];
      const hasWakeWord = wakeWords.some(word => transcript.includes(word));

      if (!isAwake && hasWakeWord) {
        setIsAwake(true);
        setLastCommand({ type: 'WAKE', text: 'Foxie is listening!' });
        if (onWake) onWake();
        
        // Clear existing timeout
        if (awakeTimeoutRef.current) {
          clearTimeout(awakeTimeoutRef.current);
        }
        
        // Auto-sleep after 30 seconds
        awakeTimeoutRef.current = setTimeout(() => {
          setIsAwake(false);
          setLastCommand({ type: 'SLEEP', text: 'Foxie went to sleep' });
        }, 30000);
      }

      // Process commands when awake
      if (isAwake && event.results[current].isFinal) {
        const command = parseCommand(transcript);
        if (command) {
          setLastCommand(command);
          if (onCommand) onCommand(command, transcript);
          
          // Reset awake timeout
          if (awakeTimeoutRef.current) {
            clearTimeout(awakeTimeoutRef.current);
          }
          awakeTimeoutRef.current = setTimeout(() => {
            setIsAwake(false);
          }, 30000);
        }
      }
    };

    recognition.onerror = (event) => {
      console.log('Speech error:', event.error);
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        // Auto restart
        setTimeout(() => {
          if (isListening && recognitionRef.current) {
            try { recognitionRef.current.start(); } catch (e) {}
          }
        }, 500);
      }
    };

    recognition.onend = () => {
      if (isListening && recognitionRef.current) {
        try { recognitionRef.current.start(); } catch (e) {}
      }
    };

    return recognition;
  }, [isAwake, isListening, onWake, onCommand]);

  /**
   * Parse voice command
   */
  const parseCommand = (transcript) => {
    const commands = [
      { keywords: ['sleep', 'go to sleep', 'nap'], type: 'SLEEP', text: '😴 Going to sleep...' },
      { keywords: ['play', 'let\'s play', 'wanna play'], type: 'PLAY', text: '🎮 Let\'s play!' },
      { keywords: ['dance', 'show me a dance'], type: 'DANCE', text: '💃 Dancing!' },
      { keywords: ['sit', 'sit down'], type: 'SIT', text: '🐕 Sitting down' },
      { keywords: ['jump', 'hop'], type: 'JUMP', text: '⬆️ Jumping!' },
      { keywords: ['spin', 'turn around'], type: 'SPIN', text: '🌀 Spinning!' },
      { keywords: ['how are you', 'how do you feel', 'status'], type: 'STATUS', text: '📊 Checking status...' },
      { keywords: ['eat', 'feed', 'hungry', 'food'], type: 'FEED', text: '🍖 Yummy food!' },
      { keywords: ['drink', 'water', 'thirsty'], type: 'DRINK', text: '💧 Drinking water' },
      { keywords: ['good boy', 'good girl', 'good fox', 'good job'], type: 'PRAISE', text: '🥰 Thank you!' },
      { keywords: ['i love you', 'love you'], type: 'LOVE', text: '💕 I love you too!' },
      { keywords: ['focus', 'concentrate', 'work mode'], type: 'FOCUS', text: '🎯 Focus mode!' },
      { keywords: ['break', 'rest', 'relax'], type: 'BREAK', text: '☕ Taking a break' },
      { keywords: ['come here', 'come'], type: 'COME', text: '🏃 Coming!' },
      { keywords: ['stay', 'wait'], type: 'STAY', text: '⏸️ Staying...' },
      { keywords: ['bark', 'speak'], type: 'BARK', text: '🔊 Yip yip!' },
      { keywords: ['roll over', 'roll'], type: 'ROLL', text: '🔄 Rolling over!' },
      { keywords: ['high five', 'hi five'], type: 'HIGHFIVE', text: '✋ High five!' },
      { keywords: ['shake', 'paw'], type: 'SHAKE', text: '🐾 Shake!' },
    ];

    for (const cmd of commands) {
      if (cmd.keywords.some(kw => transcript.includes(kw))) {
        return { type: cmd.type, text: cmd.text };
      }
    }

    // Generic chat
    if (transcript.length > 10) {
      return { type: 'CHAT', text: transcript };
    }

    return null;
  };

  /**
   * Start listening
   */
  const startListening = useCallback(async () => {
    if (!voiceSupported) return;

    // Request permission if needed
    if (!hasPermission) {
      const granted = await requestMicPermission();
      if (!granted) return;
    }

    // Initialize recognition
    if (!recognitionRef.current) {
      recognitionRef.current = initSpeechRecognition();
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        updateVisualizer();
      } catch (e) {
        console.log('Already listening');
      }
    }
  }, [voiceSupported, hasPermission, requestMicPermission, initSpeechRecognition, updateVisualizer]);

  /**
   * Stop listening
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsListening(false);
    setVisualizerBars(Array(12).fill(0));
  }, []);

  /**
   * Manual wake
   */
  const manualWake = useCallback(() => {
    setIsAwake(true);
    setLastCommand({ type: 'WAKE', text: 'Foxie is listening!' });
    if (onWake) onWake();
    
    if (awakeTimeoutRef.current) {
      clearTimeout(awakeTimeoutRef.current);
    }
    awakeTimeoutRef.current = setTimeout(() => {
      setIsAwake(false);
    }, 30000);
  }, [onWake]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (awakeTimeoutRef.current) {
        clearTimeout(awakeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <motion.div 
      className="foxie-voice-ui"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      {/* Main Voice Control Card */}
      <div className={`voice-control-card ${isAwake ? 'awake' : ''} ${isListening ? 'listening' : ''}`}>
        {/* Header */}
        <div className="voice-header">
          <div className="voice-title">
            <span className="voice-icon">{isAwake ? '🦊' : '🎙️'}</span>
            <span className="voice-text">
              {!voiceSupported ? 'Voice Not Supported' :
               permissionDenied ? 'Microphone Blocked' :
               isAwake ? 'Foxie is Listening!' :
               isListening ? 'Say "Hey Foxie"' : 
               'Voice Control'}
            </span>
          </div>
          <div className={`status-dot ${isListening ? 'active' : ''} ${isAwake ? 'awake' : ''}`} />
        </div>

        {/* Audio Visualizer */}
        <div className="audio-visualizer">
          {visualizerBars.map((height, i) => (
            <motion.div
              key={i}
              className="visualizer-bar"
              animate={{ 
                height: isListening ? `${Math.max(4, height * 40)}px` : '4px',
                backgroundColor: isAwake ? '#ff6b6b' : '#4ecdc4'
              }}
              transition={{ duration: 0.05 }}
            />
          ))}
        </div>

        {/* Transcript Display */}
        <AnimatePresence mode="wait">
          {currentTranscript && isListening && (
            <motion.div
              className="transcript-display"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <span className="transcript-text">"{currentTranscript}"</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Last Command */}
        <AnimatePresence mode="wait">
          {lastCommand && (
            <motion.div
              className="last-command-display"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              key={lastCommand.text}
            >
              <span className="command-badge">{lastCommand.type}</span>
              <span className="command-text">{lastCommand.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Control Buttons */}
        <div className="voice-controls-buttons">
          {!voiceSupported ? (
            <div className="unsupported-message">
              Your browser doesn't support voice recognition. Try Chrome or Edge.
            </div>
          ) : permissionDenied ? (
            <button className="permission-btn" onClick={requestMicPermission}>
              🔓 Grant Microphone Access
            </button>
          ) : (
            <>
              <motion.button
                className={`mic-btn ${isListening ? 'active' : ''}`}
                onClick={isListening ? stopListening : startListening}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isListening ? (
                  <>
                    <span className="mic-icon">🎤</span>
                    <span>Stop Listening</span>
                  </>
                ) : (
                  <>
                    <span className="mic-icon">🎙️</span>
                    <span>Start Listening</span>
                  </>
                )}
              </motion.button>
              
              {isListening && !isAwake && (
                <motion.button
                  className="wake-btn"
                  onClick={manualWake}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <span>🦊 Wake Foxie</span>
                </motion.button>
              )}
            </>
          )}
        </div>

        {/* Quick Commands */}
        {isAwake && (
          <motion.div 
            className="quick-commands"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="quick-commands-title">Quick Commands:</div>
            <div className="quick-commands-grid">
              {['play', 'dance', 'sit', 'jump', 'spin', 'feed', 'drink', 'love'].map(cmd => (
                <motion.button
                  key={cmd}
                  className="quick-cmd-btn"
                  onClick={() => {
                    const command = parseCommand(cmd);
                    if (command) {
                      setLastCommand(command);
                      if (onCommand) onCommand(command, cmd);
                    }
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {cmd}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Help Text */}
        <div className="voice-help">
          {isListening && !isAwake && (
            <p>💡 Say <strong>"Hey Foxie"</strong> to wake up your pet!</p>
          )}
          {isAwake && (
            <p>✨ Foxie is awake! Try: "play", "dance", "sit", "jump", "I love you"</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FoxieVoiceUI;
