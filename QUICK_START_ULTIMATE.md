# Quick Start: PetAssistantUltimate Implementation

**TL;DR**: The fox has a personality, wanders on its own, reacts to your hand, and thinks for itself.

---

## 🚀 Get Started in 30 Seconds

### 1. Component is Already Integrated

Open your app at `http://localhost:5173`:

```bash
cd e:\Foxie
npm run dev
```

The fox is already rendering in `Desktop.jsx`.

### 2. Show Your Hand to the Camera

1. Click "Allow" when browser asks for camera access
2. Wave at your camera
3. Fox waves back! 👋

### 3. Watch It Wander

1. Hide your hand from camera
2. Fox automatically starts exploring
3. Periodic tail wags and scratches
4. Every few seconds, new random movement

---

## 🎯 Understanding the Architecture

```
Desktop.jsx
    ↓
PetAssistantUltimate.jsx (main component)
    ├── usePetEmotions (5-stat system)
    ├── useBehaviorTracking (activity logs)
    ├── usePetSounds (audio)
    ├── useFoxPersonality (moods + behavior)
    └── useFoxAutonomy (wandering + idle)
```

### Data Flow

```
User Activity/Hand Input
    ↓
[Emotion Stats] ← [Behavior Tracking]
    ↓
[Mood Calculation]
    ↓
[Personality Traits] ← [Behavior State Machine]
    ↓
[Animation Selection] + [Sound Playback]
    ↓
Fox React on Screen 🦊
```

---

## 🧠 The Brain: useFoxPersonality

**What it does**: Determines fox mood and behavior

**Key concept**: Personality traits drive behavior

```javascript
// Personality traits (0-1 scale)
personality = {
  playfulness: 0.7,   // How playful?
  curiosity: 0.8,     // How curious?
  tiredness: 0.3,     // How tired?
  sociability: 0.6,   // How social?
}

// These traits change every 10 seconds
// They influence how fox behaves
```

**Mood calculation** (simplified):

```javascript
if (stress > 70) → startled
if (energy < 20) → tired
if (happiness > 80 && energy > 60) → playful
if (focus > 75) → concentrated
if (trust > 80 && happiness > 60) → affectionate
// ... more rules ...
else → curious (default)
```

**Behavior transitions** based on traits:

```javascript
const nextBehaviors = {
  idle: ['sniffing', 'walking', 'playful', 'tail_wag'],
  sniffing: curiosity > 0.7 ? ['walking'] : ['idle'],
  walking: playfulness > 0.7 ? ['playful', 'jumping'] : ['idle'],
  sleeping: tiredness > 0.2 ? ['sleeping'] : ['idle'],
}
```

---

## 🚶 The Legs: useFoxAutonomy

**What it does**: Makes fox wander and idle

**Wandering loop**:

```javascript
// Every 3-8 seconds
if (Math.random() > 0.6) {
  // 40% chance to stay, 60% chance to move
  const newX = Math.random() * 100;
  const newY = Math.random() * 100;
  setTargetPosition({ x: newX, y: newY });
  
  // Walk time varies by mood
  const duration = mood === 'playful' ? 2s : 3-4s;
  setTimeout(() => setIsWalking(false), duration);
}
```

**Idle behaviors** (tail wag, scratch, yawn):

```javascript
// Every 4-10 seconds
if (Math.random() > 0.7) {
  // 30% chance for idle behavior
  const behavior = ['tail_wag', 'scratching', 'yawn', 'blink'][random];
  setIdleBehavior({ type: behavior, duration: 800-1500 });
}
```

**Movement smoothing** (spring physics):

```javascript
// Every 50ms, interpolate toward target
position.x += (targetX - position.x) * 0.15; // Easing factor
position.y += (targetY - position.y) * 0.15;

// 0.15 = smooth but responsive
// 0.05 = very slow and floaty
// 0.30 = fast and twitchy
```

---

## 👁️ The Eyes: Hand Tracking

**How hand detection works**:

```javascript
// MediaPipe detects 21 hand landmarks
const hand = {
  0: wrist,
  4: thumb_tip,
  8: index_tip,
  12: middle_tip,
  // ... etc
}

// Get hand center (middle finger base)
const handCenter = hand[9];
const screenX = (1 - handCenter.x) * 100; // Flip for camera mirror
const screenY = handCenter.y * 100;

// Move fox to follow hand
setTargetPosition({ x: screenX, y: screenY });
```

**Gesture detection**:

```javascript
// Check hand landmarks for specific patterns

function isThumbsUp(landmarks) {
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  // If thumb is above index finger
  return thumbTip.y < indexTip.y - 0.05;
}

function isWaving(landmarks, previous) {
  const handCenter = landmarks[9];
  const prevCenter = previous[9];
  // If hand moving left-right more than up-down
  return Math.abs(handCenter.x - prevCenter.x) > Math.abs(handCenter.y - prevCenter.y);
}

function isProximity(landmarks) {
  const handScale = distance(landmark[0], landmark[12]);
  // If hand is large = close to camera
  return handScale > 0.25;
}
```

---

## 🔊 The Voice: usePetSounds

**Mood sounds** (10% chance when mood changes):

```javascript
// Web Audio API generates tones
const playTone = (frequency, duration) => {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.frequency.value = frequency; // Hz
  osc.type = 'sine';
  
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration/1000);
  
  osc.start();
  osc.stop(ctx.currentTime + duration/1000);
};

// Examples:
playTone(440, 100);  // A4 note, 100ms
playTone(550, 200);  // C#5 note, 200ms
```

**Frequencies**:
- 330 Hz = E4 (low)
- 440 Hz = A4 (mid)
- 550 Hz = C#5 (higher)
- 660 Hz = E5 (high)

---

## 🎨 The Look: CSS Animations

**Mood colors**:

```css
.fox-avatar.mood-playful .fox-body {
  background: linear-gradient(135deg, 
    rgba(255, 100, 100, 0.95),    /* Red */
    rgba(255, 150, 200, 0.95)     /* Pink */
  );
}
```

**Behavior animations**:

```css
.fox-avatar.behavior-jumping {
  animation: fox-jump 0.6s ease-in-out;
}

@keyframes fox-jump {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-30px); }  /* Jump 30px up */
}
```

---

## 🧪 Testing Quick Tips

### Test Mood Changes
```javascript
// Open DevTools Console
// Trigger low energy
localStorage.setItem('foxie-pet-stats', 
  JSON.stringify({ energy: 10, happiness: 50, ... })
);
// Fox should become "tired"
```

### Test Personality Widget
```javascript
// Top-left corner shows live personality
// Watch values change every 10 seconds
// Click to see full stats panel
```

### Test Autonomy
```javascript
// Disable hand tracking temporarily
// Hide from camera for 30+ seconds
// Watch fox wander randomly
// Should see tail wags and scratches
```

### Test Gestures
```javascript
// With hand visible:
// - Wave left-right → Fox waves back
// - Thumbs up → Fox jumps (1.3x scale)
// - Hand close → Fox sniffs
```

---

## 🔧 Common Customizations

### Change Wander Speed

File: `src/hooks/useFoxAutonomy.js`

```javascript
// Line ~30: Change wander interval
// OLD: 3000 + Math.random() * 5000 (3-8 seconds)
// NEW: 1000 + Math.random() * 2000 (1-3 seconds)
```

### Add New Idle Behavior

File: `src/hooks/useFoxAutonomy.js`

```javascript
const idleBehaviors = [
  { type: 'tail_wag', duration: 1000 },
  { type: 'scratching', duration: 1500 },
  { type: 'head_tilt', duration: 800 },
  { type: 'yawn', duration: 1200 },
  { type: 'blink', duration: 200 },
  { type: 'NEW_BEHAVIOR', duration: 1000 }, // ← Add here
];
```

Then update `main.css` to add animation.

### Change Personality Drift

File: `src/hooks/useFoxPersonality.js`

```javascript
// Line ~40: Change how fast personality changes
// OLD: 10000ms (10 seconds)
// NEW: 5000ms (5 seconds) - personality changes faster
setInterval(() => { ... }, 10000);
```

### Adjust Personality Trait Bounds

File: `src/hooks/useFoxPersonality.js`

```javascript
// Make playfulness less extreme (smaller changes)
playfulness: Math.max(0, Math.min(1, 
  prev.playfulness + (Math.random() - 0.5) * 0.05  // ← Was 0.1
))
```

---

## 🚨 Debugging Checklist

### Hand Tracking Not Working

- [ ] Camera permission granted?
- [ ] Hand clearly visible?
- [ ] Good lighting?
- [ ] Check console: `console.log(handsRef.current)`
- [ ] Try different camera angles

### Fox Not Moving

- [ ] Check if hand visible? (`setHandVisible` logs)
- [ ] Verify `useFoxAutonomy` is in component
- [ ] Check personality traits changing? (personality widget)
- [ ] Mood changing? (top-left widget)

### No Sound

- [ ] Browser tab unmuted?
- [ ] Site audio enabled?
- [ ] Check console for audio errors
- [ ] Try interacting with gesture (should trigger sound)

### CPU Overload

- [ ] Hand tracking = normal 15-20% usage
- [ ] If > 50%, try hiding hand from camera
- [ ] Disable hand tracking (not in scope for this guide)

---

## 📚 File Structure

```
src/
├── components/
│   ├── Desktop.jsx                    ← Imports PetAssistantUltimate
│   └── PetAssistantUltimate.jsx       ← Main component
├── hooks/
│   ├── useFoxPersonality.js           ← Mood + behavior state machine
│   ├── useFoxAutonomy.js              ← Wandering + idle behaviors
│   ├── useEmotions.js                 ← Emotion stats (5-stat system)
│   ├── useBehaviorTracking.js         ← Activity logging
│   └── usePetSounds.js                ← Audio playback
├── utils/
│   └── gestureRecognition.js          ← Gesture detection utilities
└── styles/
    └── main.css                       ← All styling (1600+ lines)
```

---

## 🎓 Learning Path

**Beginner**: Understand the mood system
- Read `useFoxPersonality.js`
- Watch mood change in personality widget
- See how moods affect animations

**Intermediate**: Add custom moods
- Add new mood to `calculateMood()`
- Add CSS animation for new mood
- Add sound effect for new mood

**Advanced**: Create new behavior state
- Add to behavior transition map
- Create CSS animation
- Integrate with personality traits

**Expert**: Extend personality system
- Add new personality trait
- Use trait to influence mood/behavior
- Create emergent behaviors

---

## 🎉 Next: Lottie Animations

Ready to replace emoji with smooth fox animations?

```bash
npm install lottie-react
```

Then:
1. Find fox Lottie files at https://lottiefiles.com
2. Download JSON file
3. Replace emoji render with:

```javascript
import Lottie from 'lottie-react';
import foxAnimation from '../animations/fox.json';

<Lottie animationData={foxAnimation} loop autoplay />
```

---

**You've got a sentient fox! 🦊✨**

Questions? Check `ULTIMATE_PET_GUIDE.md` for deep dives!
