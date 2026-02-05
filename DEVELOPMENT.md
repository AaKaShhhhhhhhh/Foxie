# Foxie Development Guide

## Current Status ✅

Your Foxie Desktop application is **fully scaffolded and running**!

### What's Been Built:

1. **Desktop Shell** ✓
   - Windows-like fullscreen environment
   - Gradient purple background
   - Draggable windows
   - Taskbar with clock

2. **Core Components** ✓
   - Start Menu (click Start button)
   - Draggable Windows
   - Taskbar with system tray
   - Three productivity apps

3. **AI Pet Assistant** ✓
   - Foxie character with 5 moods
   - Auto mood detection
   - Floating on screen
   - Animation effects

4. **Productivity Apps** ✓
   - Notes app (textarea)
   - Pomodoro timer (25+5 min)
   - Task Manager (add/complete/delete)

5. **Environment Setup** ✓
   - Charlie LLM API stubs
   - Tambo adaptive UI registry
   - Environment variable support

---

## Next Development Steps 🚀

### Phase 1: Polish & Testing (30 mins)
- [ ] Test all window operations (drag, close, minimize)
- [ ] Test all app functionality
- [ ] Test Pomodoro timer notifications
- [ ] Verify pet mood changes

### Phase 2: Webcam Integration (1-2 hours)
```javascript
// In PetAssistant.jsx or new Webcam.jsx
import { Hands, HAND_CONNECTIONS } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

// Add webcam access
const camera = new Camera(videoElement, {
  onFrame: async () => {
    const results = await hands.send({ image: videoElement });
    // Update pet mood based on hand presence
    if (results.multiHand.length > 0) {
      setPetMood('excited'); // User is interacting
    }
  },
});
```

### Phase 3: Charlie LLM Integration (1 hour)
```javascript
// In PetAssistant.jsx or connected to charlie.js
import { getPetResponse } from '../ai/charlie';

// Generate dynamic responses
useEffect(() => {
  const getResponse = async () => {
    const msg = await getPetResponse(mood, { windowsOpen, userActive });
    onSpeak(msg);
  };
}, [mood]);
```

### Phase 4: Tambo Adaptive UI (1-2 hours)
```javascript
// In Desktop.jsx
import { getAdaptiveUI } from '../tambo/registry';

// Dynamically show/hide components
useEffect(() => {
  const adaptive = getAdaptiveUI({ userActive, windowsOpen });
  // Use adaptive.component to render appropriate UI
  // Use adaptive.priority for layering
}, [userActive, windowsOpen]);
```

### Phase 5: Audio System (30 mins)
```javascript
// Add to PetAssistant.jsx
import { Howl } from 'howler';

const petSound = new Howl({
  src: ['/pet-greeting.mp3'],
  volume: 0.7,
});

petSound.play(); // When pet speaks
```

### Phase 6: Persistent Storage (30 mins)
```javascript
// Add to Desktop.jsx
// Save notes, tasks to localStorage
useEffect(() => {
  localStorage.setItem('foxie-notes', notes);
  localStorage.setItem('foxie-tasks', JSON.stringify(tasks));
}, [notes, tasks]);

// Load on mount
useEffect(() => {
  const saved = localStorage.getItem('foxie-notes');
  if (saved) setNotes(saved);
}, []);
```

---

## Architecture Overview

### Data Flow:
```
User Action
    ↓
Desktop.jsx (state management)
    ├→ Window Component (render)
    ├→ PetAssistant (mood calc)
    ├→ Notifications (display)
    └→ Tambo Registry (logic)
        └→ Charlie LLM (responses)
```

### Component Responsibilities:
- **Desktop.jsx**: Main state, window management, app logic
- **Taskbar.jsx**: Clock, window count, start button
- **StartMenu.jsx**: App launcher UI
- **Window.jsx**: Dragging, titlebar, window chrome
- **PetAssistant.jsx**: Mood state, animations, interactions
- **Apps**: Self-contained productivity tools

### AI Integration Points:
- **charlie.js**: API calls, reasoning, response generation
- **registry.js**: Intent detection, component selection
- **PetAssistant.jsx**: Mood logic, message display

---

## File Locations & Functions

### Key Functions to Enhance:

**Detect user intent** (registry.js):
```javascript
export function detectIntent(state) {
  // Currently basic - add ML model integration here
}
```

**Get AI response** (charlie.js):
```javascript
export async function getCharlieResponse(prompt, context) {
  // Currently has fallbacks - integrate real API
}
```

**Pet mood calculation** (PetAssistant.jsx):
```javascript
useEffect(() => {
  let newMood = 'happy';
  // Add webcam detection, focus tracking, task completion
}, [userActive, windowsOpen]);
```

---

## Testing Checklist

### Manual Testing:
- [ ] Start button opens/closes menu
- [ ] Click app icon opens window
- [ ] Drag window by titlebar
- [ ] Click close button removes window
- [ ] Click minimize hides window
- [ ] Pomodoro timer counts down
- [ ] Notifications appear top-right
- [ ] Pet changes mood after 30s inactivity
- [ ] Pet reacts to multiple windows

### Browser Console:
```javascript
// Test Charlie API setup
import { getCharlieResponse } from './ai/charlie.js';
await getCharlieResponse('Hello!', { mood: 'happy' });

// Test Tambo logic
import { getAdaptiveUI } from './tambo/registry.js';
getAdaptiveUI({ userActive: true, windowsOpen: 2 });
```

---

## Debugging Tips

### In VS Code:
1. Open **View → Debug Console**
2. Open **F12 → Console tab**
3. Add breakpoints in Components

### Common Issues:
- **Hot reload not working**: Clear browser cache, restart `npm run dev`
- **Styles not updating**: Clear CSS cache, hard refresh (Ctrl+Shift+R)
- **Component not rendering**: Check React DevTools, look for errors in console
- **State not updating**: Verify setState is called, check dependencies array

---

## API Integration Template

When ready to connect Charlie LLM:

```javascript
// In .env.local
VITE_CHARLIE_API_KEY=your_key_here
VITE_CHARLIE_API_ENDPOINT=https://api.charlie-ai.com/v1

// In charlie.js - Already set up!
const CHARLIE_API_KEY = import.meta.env.VITE_CHARLIE_API_KEY;
const CHARLIE_API_ENDPOINT = import.meta.env.VITE_CHARLIE_API_ENDPOINT;

// Test in console:
const msg = await getCharlieResponse('How am I doing?', { mood: 'happy' });
console.log(msg);
```

---

## Customization Ideas

### Quick Wins:
1. Change pet emoji to different character
2. Adjust timer duration (Pomodoro.jsx: `25 * 60`)
3. Add more apps to start menu
4. Change desktop background gradient
5. Add sound effects with Howler.js

### Medium Effort:
1. Add dark mode toggle
2. Implement localStorage persistence
3. Add window snap-to-grid
4. Create settings window
5. Add keyboard shortcuts

### Advanced:
1. Multi-pet support
2. Custom pet skins/animations
3. ML-based mood prediction
4. Voice commands
5. Cloud sync

---

## Resources

- **React Docs**: https://react.dev
- **Vite Docs**: https://vite.dev
- **Framer Motion**: https://www.framer.com/motion/
- **MediaPipe Hands**: https://developers.google.com/mediapipe/solutions/vision/hand_landmarker
- **Charlie AI**: https://charlie-ai.com

---

## Questions?

1. **Check Console**: F12 → Look for red errors
2. **Read Comments**: Every component has inline docs
3. **Check Repo**: All code is well-structured and readable
4. **Run Tests**: `npm run dev` and manually test each feature

---

**Happy coding! 🚀🦊**
