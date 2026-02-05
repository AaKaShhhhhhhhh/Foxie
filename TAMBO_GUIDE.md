# 🤖 Tambo AI Integration Guide

## Overview

Tambo is now fully integrated into Foxie Desktop with Charlie LLM for intelligent, adaptive UI that responds to user behavior.

## What Changed

### New Components:
1. **AdaptiveUIProvider** (`src/components/AdaptiveUIProvider.jsx`)
   - Wraps the entire app
   - Manages state analysis
   - Integrates Charlie LLM reasoning
   - Exposes adaptive UI context

2. **TamboUI** (`src/components/TamboUI.jsx`)
   - Visual suggestion panel
   - Shows current intent
   - Displays Charlie's recommendations
   - Shows confidence scores

### Enhanced Files:
- `src/tambo/registry.js` - Added Charlie integration + focus tracking
- `src/components/Desktop.jsx` - Tracks app state for Tambo analysis
- `src/App.jsx` - Wraps Desktop with AdaptiveUIProvider
- `src/styles/main.css` - Tambo UI styling

## How It Works

### Data Flow:
```
User Action (click, focus, etc.)
    ↓
Desktop State Updated (windowsOpen, userActive, focusTime, lastAppOpened)
    ↓
AdaptiveUIProvider Detects Changes
    ↓
Charlie LLM Analyzes State (every 5 seconds)
    ↓
Tambo Registry Generates Recommendation
    ↓
TamboUI Displays Suggestion Panel
    ↓
App Adapts UI Based on Intent
```

## Using Tambo in Your Components

### 1. Access Adaptive UI State

```javascript
import { useAdaptiveUI } from './AdaptiveUIProvider';

export function MyComponent() {
  const { adaptiveUI, charlieInsight, isAnalyzing } = useAdaptiveUI();

  return (
    <div>
      <p>Current Intent: {adaptiveUI.intent}</p>
      <p>Recommended: {adaptiveUI.component}</p>
      <p>Confidence: {Math.round(adaptiveUI.confidence * 100)}%</p>
    </div>
  );
}
```

### 2. Get UI Recommendations

```javascript
import { useUIRecommendation } from './AdaptiveUIProvider';

export function SuggestionBox() {
  const { recommendedComponent, suggestedAction, confidence } = useUIRecommendation();

  return (
    <div>
      <p>🤖 {suggestedAction}</p>
      <p>Try opening: {recommendedComponent}</p>
    </div>
  );
}
```

### 3. Trigger Manual Analysis

```javascript
import { useTriggerAdaptiveUI } from './AdaptiveUIProvider';

export function ActionButton() {
  const triggerAnalysis = useTriggerAdaptiveUI();

  return (
    <button onClick={() => triggerAnalysis('user_click')}>
      Ask Tambo
    </button>
  );
}
```

## Intent Types

Tambo detects these intents automatically:

| Intent | Triggered By | Suggestion |
|--------|-------------|-----------|
| `productivity.taskFocus` | Multiple windows open, Pomodoro running | "Stay focused!" |
| `productivity.notesTaking` | Notes app open | "Great time to write!" |
| `productivity.taskManagement` | Task Manager open | "Organize your work!" |
| `pet.greeting` | Idle for 60+ seconds | "Chat with Foxie!" |
| `system.startMenu` | No windows, inactive | "What next?" |
| `system.desktop` | Default state | "Keep working!" |

## Charlie LLM Integration

Charlie provides contextual reasoning about what the user should do next:

```javascript
// Charlie analyzes this state
{
  userActive: true,
  windowsOpen: 2,
  focusTime: 300,          // 5 minutes
  lastAppOpened: 'Pomodoro'
}

// Charlie might respond:
// "You've been focused for 5 minutes. Keep the momentum going!"
// → Recommends: 'productivity.taskFocus'
```

### Analyze State Manually:

```javascript
import { reasonAboutState } from './ai/charlie';

const insight = await reasonAboutState({
  userActive: true,
  windowsOpen: 2,
  focusTime: 300,
});

console.log(insight.insight);           // Charlie's reasoning
console.log(insight.recommendedAction); // 'focus', 'rest', etc.
console.log(insight.confidence);        // 0.0 - 1.0
```

## Tambo UI Panel

The Tambo panel appears in the **bottom-left** corner and shows:

- 🤖 **Header** - "Tambo AI" with thinking indicator
- **Current Intent** - What Tambo thinks you're doing
- **💡 Suggestion** - What you should do next
- **Confidence Bar** - How confident Tambo is (color-coded)
- **Debug Info** - (dev mode) Component and priority info

### Customizing Panel Position:

Edit `src/styles/main.css`:

```css
.tambo-ui-panel {
  /* Default: bottom-left */
  bottom: 70px;
  left: 20px;

  /* Or move to bottom-right */
  bottom: 70px;
  right: 20px;
  left: auto;
}
```

## Advanced: Custom Intent Detection

Add custom intent logic to `src/tambo/registry.js`:

```javascript
export function detectIntent(state, charlieInsight = null) {
  const { userActive, windowsOpen, focusTime } = state;

  // YOUR CUSTOM LOGIC HERE
  if (focusTime > 3600) {  // 1 hour focused
    return 'productivity.deepFocus';
  }

  // ... rest of detection
}

// Add to registry
export const componentRegistry = {
  productivity: {
    deepFocus: 'DeepFocusMode',  // New component
    // ...
  }
};
```

## Performance Optimization

Tambo runs analysis **every 5 seconds max** to avoid overhead. Control this in `AdaptiveUIProvider.jsx`:

```javascript
const ANALYSIS_THROTTLE = 5000;  // milliseconds

// Adjust as needed:
if (now - lastAnalyzed < ANALYSIS_THROTTLE) return;
```

## Testing Tambo

### 1. Open Developer Console (F12)

```javascript
// Check current state
import { useAdaptiveUI } from './components/AdaptiveUIProvider';

// In Console:
localStorage.tamboDebug = true;  // Enable debug mode
```

### 2. Manual Trigger

```javascript
// In Console, if you have context:
window.__foxie__.adaptiveUI  // See current state
```

### 3. Test Different States

1. **Test Focus Mode**: Open Pomodoro → Start timer → Wait 10 seconds
   - Expected: Intent = `productivity.taskFocus`

2. **Test Idle Mode**: Don't move mouse for 30 seconds
   - Expected: Intent = `pet.greeting` after 60 seconds idle

3. **Test Multi-window**: Open 3+ apps
   - Expected: Intent = `productivity.taskFocus`

## Common Issues

### Tambo Panel Not Showing?
- Check browser console for errors
- Verify AdaptiveUIProvider wraps Desktop
- Check `showSuggestions={true}` in TamboUI

### Charlie Not Analyzing?
- Verify `VITE_CHARLIE_API_KEY` in `.env.local`
- Check console for Charlie API errors
- Fallback responses will display if API unavailable

### Intent Not Changing?
- Open DevTools → Network tab
- Check if state updates are firing
- Look at Desktop state in React DevTools

## Next Steps

1. ✅ **Tambo is running** - See suggestions in bottom-left
2. 🎯 **Add Custom Intents** - Detect specific user behaviors
3. 🤝 **Enhance Charlie** - More sophisticated reasoning
4. 🎨 **Customize UI** - Modify TamboUI component appearance
5. 📊 **Add Analytics** - Track which suggestions work best

## Resources

- [Tambo AI Docs](https://tambo-ai.com/docs)
- [AdaptiveUIProvider.jsx](../src/components/AdaptiveUIProvider.jsx) - Full implementation
- [Registry.js](../src/tambo/registry.js) - Intent detection logic
- [Charlie Integration](../src/ai/charlie.js) - LLM reasoning

---

**You're now using AI-powered adaptive UI! 🚀🤖**
