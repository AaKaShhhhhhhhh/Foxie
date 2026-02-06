import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FoxieAvatarSVG = ({ mood, isListening, isAwake }) => {
  // Eye shapes based on mood
  const getEyePath = () => {
    switch (mood) {
      case 'happy':
      case 'excited':
      case 'love':
        return {
          d: "M 35 55 Q 45 45 55 55", // curved up happy eye
          stroke: "#3d2b1f",
          fill: "none",
          strokeWidth: 4
        };
      case 'sleeping':
      case 'tired':
        return {
          d: "M 35 55 Q 45 60 55 55", // curved down sleeping eye
          stroke: "#3d2b1f",
          fill: "none",
          strokeWidth: 4
        };
      case 'scared':
      case 'startled':
        return {
          cx: 45, cy: 55, r: 8, // wide open circle
          fill: "#3d2b1f"
        };
      case 'angry':
        return {
          d: "M 35 50 L 55 60", // slanted angry
          stroke: "#3d2b1f",
          fill: "none",
          strokeWidth: 4
        };
      default: // normal/curious
        return {
          cx: 45, cy: 55, r: 5,
          fill: "#3d2b1f"
        };
    }
  };

  const leftEyeProps = getEyePath();
  // Mirror for right eye if it's a path; calculate offset if circle
  const rightEyeProps = mood === 'angry' 
    ? { d: "M 145 60 L 165 50", stroke: "#3d2b1f", fill: "none", strokeWidth: 4 }
    : (leftEyeProps.d 
        ? { ...leftEyeProps, d: leftEyeProps.d.replace(/(\d+)/g, (n) => String(200 - parseInt(n))) // Simple horizontal flip math approx for this scale
             .replace(/35/g, '145').replace(/45/g, '155').replace(/55/g, '165') } // Manual override if regex fails
        : { ...leftEyeProps, cx: 155 }
      );
      
  // Fix manual override flakiness by just defining generic shapes properly
  const RightEye = () => {
    if (mood === 'sleeping' || mood === 'tired') {
      return <path d="M 145 55 Q 155 60 165 55" stroke="#3d2b1f" strokeWidth="4" fill="none" strokeLinecap="round" />;
    }
    if (mood === 'happy' || mood === 'excited' || mood === 'love') {
      return <path d="M 145 55 Q 155 45 165 55" stroke="#3d2b1f" strokeWidth="4" fill="none" strokeLinecap="round" />;
    }
    if (mood === 'angry') {
      return <path d="M 145 60 L 165 50" stroke="#3d2b1f" strokeWidth="4" fill="none" strokeLinecap="round" />;
    }
    // Normal/Circle
    return <circle cx="155" cy="55" r={mood === 'startled' ? 8 : 5} fill="#3d2b1f" />;
  };

  const LeftEye = () => {
    if (mood === 'sleeping' || mood === 'tired') {
      return <path d="M 35 55 Q 45 60 55 55" stroke="#3d2b1f" strokeWidth="4" fill="none" strokeLinecap="round" />;
    }
    if (mood === 'happy' || mood === 'excited' || mood === 'love') {
      return <path d="M 35 55 Q 45 45 55 55" stroke="#3d2b1f" strokeWidth="4" fill="none" strokeLinecap="round" />;
    }
    if (mood === 'angry') {
      return <path d="M 35 50 L 55 60" stroke="#3d2b1f" strokeWidth="4" fill="none" strokeLinecap="round" />;
    }
    return <circle cx="45" cy="55" r={mood === 'startled' ? 8 : 5} fill="#3d2b1f" />;
  };

  const Mouth = () => {
    if (mood === 'happy' || mood === 'excited') {
      return <path d="M 85 85 Q 100 95 115 85" stroke="#3d2b1f" strokeWidth="3" fill="none" strokeLinecap="round" />;
    }
    if (mood === 'sad') {
      return <path d="M 85 90 Q 100 80 115 90" stroke="#3d2b1f" strokeWidth="3" fill="none" strokeLinecap="round" />;
    }
    if (mood === 'startled' || mood === 'curious') {
      return <circle cx="100" cy="90" r="5" fill="#3d2b1f" />;
    }
    // Default snout nose connection
    return <path d="M 90 85 Q 100 90 110 85" stroke="#3d2b1f" strokeWidth="2" fill="none" strokeLinecap="round" />;
  };

  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="foxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB923C" /> {/* Orange-400 */}
          <stop offset="100%" stopColor="#EA580C" /> {/* Orange-600 */}
        </linearGradient>
        <linearGradient id="earGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7c2d12" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Ears */}
      <motion.g animate={{ rotate: isListening ? [0, -5, 5, 0] : 0 }} transition={{ repeat: isListening ? Infinity : 0, duration: 2 }}>
        <path d="M 20 80 L 50 10 L 80 70" fill="url(#foxGradient)" stroke="#C2410C" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 35 60 L 50 25 L 65 60" fill="#fef3c7" /> {/* Inner Ear Left */}
      </motion.g>
      <motion.g animate={{ rotate: isListening ? [0, 5, -5, 0] : 0 }} transition={{ repeat: isListening ? Infinity : 0, duration: 2, delay: 0.1 }}>
        <path d="M 120 70 L 150 10 L 180 80" fill="url(#foxGradient)" stroke="#C2410C" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 135 60 L 150 25 L 165 60" fill="#fef3c7" /> {/* Inner Ear Right */}
      </motion.g>

      {/* Head Base */}
      <ellipse cx="100" cy="100" rx="90" ry="75" fill="url(#foxGradient)" stroke="#C2410C" strokeWidth="2" />

      {/* Cheeks/White Fur */}
      <path d="M 10 100 Q 10 150 50 170 Q 100 180 150 170 Q 190 150 190 100 Q 150 130 100 130 Q 50 130 10 100" fill="#FFF7ED" />

      {/* Eyes */}
      <motion.g animate={{ scaleY: isAwake ? 1 : 0.1 }} style={{ transformOrigin: '45px 55px' }}>
        <LeftEye />
      </motion.g>
      <motion.g animate={{ scaleY: isAwake ? 1 : 0.1 }} style={{ transformOrigin: '155px 55px' }}>
        <RightEye />
      </motion.g>

      {/* Nose */}
      <circle cx="100" cy="105" r="8" fill="#1f1f1f" />
      <ellipse cx="100" cy="103" rx="4" ry="2" fill="#525252" opacity="0.5" /> {/* Nose highlighting */}

      {/* Mouth */}
      <Mouth />

      {/* Blush (conditional) */}
      {(mood === 'happy' || mood === 'love') && (
        <>
          <ellipse cx="30" cy="110" rx="10" ry="6" fill="#fda4af" opacity="0.6" />
          <ellipse cx="170" cy="110" rx="10" ry="6" fill="#fda4af" opacity="0.6" />
        </>
      )}
      
      {/* Listening Glow Ring */}
      <AnimatePresence>
        {isListening && (
          <motion.circle 
            cx="100" cy="100" r="95" 
            fill="none" 
            stroke="#4ecdc4" 
            strokeWidth="3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: [0.5, 1, 0.5], scale: 1.05 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}
      </AnimatePresence>
    </svg>
  );
};

export default FoxieAvatarSVG;
