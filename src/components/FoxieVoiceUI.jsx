import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseFoxieCommand } from '../utils/foxieCommands';

/**
 * FoxieVoiceUI - Sleek, tech-savvy voice control interface
 * Real microphone permissions and voice activation
 */
const FoxieVoiceUI = ({
  onWake,
  onCommand,
  onTranscriptUpdate,
  onVisualizerUpdate,
  onError,
  onMoodChange,
  foxieState = 'idle',
  listening = false, // Controlled by Desktop top bar
  visible = false // Controlled by awake state
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

  // Stability refs for Patch 1 & 2
  const processingFinalRef = useRef(false);
  const lastFinalTranscriptRef = useRef("");
  const lastFinalAtRef = useRef(0);
  const lastRestartAtRef = useRef(0);

  const FINAL_DEDUPE_MS = 1500;
  const RESTART_COOLDOWN_MS = 800;

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
    if (onVisualizerUpdate) onVisualizerUpdate(bars);
    animationFrameRef.current = requestAnimationFrame(updateVisualizer);
  }, [isListening, onVisualizerUpdate]);

  // Refs for closures
  const isListeningRef = useRef(false);
  const isAwakeRef = useRef(false);

  // Keep refs in sync
  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);
  useEffect(() => { isAwakeRef.current = isAwake; }, [isAwake]);

  // Sync with parent foxieState (for Push-to-Talk)
  useEffect(() => {
    if (foxieState === 'awake' && !isAwake) {
      console.log('FoxieVoiceUI: Waking up from prop sync');
      setIsAwake(true);
      isAwakeRef.current = true;
    } else if (foxieState !== 'awake' && isAwake) {
      console.log('FoxieVoiceUI: Sleeping from prop sync');
      setIsAwake(false);
      isAwakeRef.current = false;
    }
  }, [foxieState, isAwake]);

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
    recognition.maxAlternatives = 1; // Simplify

    recognition.onresult = async (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.toLowerCase().trim();
      const isFinal = event.results[current].isFinal;

      console.log(`FoxieVoiceUI: Heard [${isFinal ? 'FINAL' : 'INTERIM'}]:`, transcript);
      setCurrentTranscript(transcript);
      if (onTranscriptUpdate) onTranscriptUpdate(transcript);

      // Wake word detection
      const wakeWords = ['hey foxie', 'hi foxie', 'hello foxie', 'hey foxy', 'hi foxy', 'ok foxie', 'okay foxie'];
      const hasWakeWord = wakeWords.some(word => transcript.includes(word));

      let effectiveAwake = isAwakeRef.current;

      if (!isAwakeRef.current && hasWakeWord) {
        console.log('FoxieVoiceUI: WAKING UP!');
        setIsAwake(true);
        isAwakeRef.current = true; // Sync immediately for local logic
        effectiveAwake = true;

        setLastCommand({ type: 'WAKE', text: 'Foxie is listening!' });
        if (onWake) onWake();

        if (awakeTimeoutRef.current) clearTimeout(awakeTimeoutRef.current);
        awakeTimeoutRef.current = setTimeout(() => {
          setIsAwake(false);
          isAwakeRef.current = false;
        }, 30000);
      }

      // Process commands
      if (effectiveAwake && isFinal) {
        // Strip wake word
        let cleanTranscript = transcript;
        wakeWords.forEach(word => {
          if (cleanTranscript.startsWith(word)) {
            cleanTranscript = cleanTranscript.replace(word, '').trim();
          }
          if (cleanTranscript.startsWith(word)) {
            cleanTranscript = cleanTranscript.replace(word, '').trim();
          }
        });

        const normalized = (cleanTranscript || transcript).replace(/\s+/g, " ").trim();
        if (!normalized) return;

        // 1) drop duplicates (same final repeated)
        const now = Date.now();
        if (
          normalized === lastFinalTranscriptRef.current &&
          now - lastFinalAtRef.current < FINAL_DEDUPE_MS
        ) {
          console.log("FoxieVoiceUI: dropping duplicate FINAL:", normalized);
          return;
        }
        lastFinalTranscriptRef.current = normalized;
        lastFinalAtRef.current = now;

        // 2) prevent overlapping async parse/send
        if (processingFinalRef.current) {
          console.log("FoxieVoiceUI: ignoring FINAL while processing previous command");
          return;
        }

        processingFinalRef.current = true;
        try {
          console.log("FoxieVoiceUI: Parsing command from:", normalized);
          const command = await parseFoxieCommand(normalized);

          if (command && command.type !== "WAKE") {
            console.log("FoxieVoiceUI: Command recognized:", command.type);
            setLastCommand(command);
            onCommand?.(command, normalized);

            if (awakeTimeoutRef.current) clearTimeout(awakeTimeoutRef.current);
            awakeTimeoutRef.current = setTimeout(() => {
              setIsAwake(false);
              isAwakeRef.current = false;
            }, 30000);
          }
        } finally {
          processingFinalRef.current = false;
        }
      }
    };

    recognition.onerror = (event) => {
      console.log('FoxieVoiceUI: Speech error:', event.error);
      if (event.error === 'network') {
        if (onError) onError('Voice error: Check internet connection');
      }
      // Retry errors (Removed no-speech to stop aggressive spam)
      const retryErrors = ['network', 'audio-capture'];
      if (retryErrors.includes(event.error)) {
        setTimeout(() => {
          if (isListeningRef.current && recognitionRef.current) {
            try { recognitionRef.current.start(); } catch (e) { }
          }
        }, 1000);
      }
    };

    recognition.onend = () => {
      console.log('FoxieVoiceUI: Recognition ended. Restarting?', isListeningRef.current);
      if (!isListeningRef.current || !recognitionRef.current) return;

      const now = Date.now();
      if (now - lastRestartAtRef.current < RESTART_COOLDOWN_MS) return;
      lastRestartAtRef.current = now;

      setTimeout(() => {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.log('FoxieVoiceUI: Restart failed:', e);
        }
      }, 250);
    };

    return recognition;
  }, [onWake, onCommand, onError]);



  /**
   * Start listening
   */
  const startListening = useCallback(async () => {
    console.log('FoxieVoiceUI: startListening called. Supported:', voiceSupported, 'Permission:', hasPermission);
    if (!voiceSupported) return;

    // Request permission if needed
    if (!hasPermission) {
      console.log('FoxieVoiceUI: Requesting permission...');
      const granted = await requestMicPermission();
      console.log('FoxieVoiceUI: Permission granted?', granted);
      if (!granted) return;
    }

    // Initialize recognition
    if (!recognitionRef.current) {
      console.log('FoxieVoiceUI: Initializing speech recognition...');
      recognitionRef.current = initSpeechRecognition();
    }

    if (recognitionRef.current) {
      try {
        console.log('FoxieVoiceUI: Starting recognition instance');
        recognitionRef.current.start();
        setIsListening(true);
        updateVisualizer();
      } catch (e) {
        console.log('Already listening or error:', e);
      }
    }
  }, [voiceSupported, hasPermission, requestMicPermission, initSpeechRecognition, updateVisualizer]);

  /**
   * Stop listening
   */
  /**
   * Stop listening
   */
  const stopListening = useCallback(() => {
    isListeningRef.current = false; // Immediate update to prevent onEnd restart
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
    isAwakeRef.current = true;
    setLastCommand({ type: 'WAKE', text: 'Foxie is listening!' });
    if (onWake) onWake();

    if (awakeTimeoutRef.current) {
      clearTimeout(awakeTimeoutRef.current);
    }
    awakeTimeoutRef.current = setTimeout(() => {
      setIsAwake(false);
      isAwakeRef.current = false;
    }, 30000);
  }, [onWake]);

  // Sync listening state with parent
  useEffect(() => {
    if (listening && !isListening) {
      console.log('FoxieVoiceUI: Starting listening via prop sync');
      startListening();
    } else if (!listening && isListening) {
      console.log('FoxieVoiceUI: Stopping listening via prop sync');
      stopListening();
    }
  }, [listening, isListening, startListening, stopListening]);

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
      style={{ pointerEvents: 'none' }} /* Pass through clicks to desktop */
    >
      {/* Main Voice Control Card - Only visible when awake/active */}
      <div
        className={`voice-control-card ${isAwake ? 'awake' : ''} ${isListening ? 'listening' : ''}`}
        style={{
          // Show if Awake (active interaction) OR explicit user interaction would go here.
          // Hide if just listening in background (isAwake=false)
          // NEW: If visible=false, FORCE hide (opacity 0)
          opacity: (visible && isAwake) ? 1 : 0,
          pointerEvents: (visible && isAwake) ? 'auto' : 'none',
          transform: (visible && isAwake) ? 'scale(1)' : 'scale(0.9)',
          transition: 'all 0.3s ease'
        }}
      >
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

        {/* Audio Visualizer - Keeping for logic but hidden by visible=false anyway */}
        <div className="audio-visualizer" style={{ display: 'none' }}>
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

        {/* Control Buttons - Hidden because visible={false} in Desktop.jsx */}
        <div className="voice-controls-buttons" style={{ display: 'none' }}>
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
              >
                {isListening ? '🎤 Stop' : '🎙️ Start'}
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FoxieVoiceUI;
