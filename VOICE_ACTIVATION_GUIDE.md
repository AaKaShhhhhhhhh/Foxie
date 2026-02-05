# 🎙️ VOICE-ACTIVATED FOXIE - QUICK START GUIDE

## 🚀 You're All Set!

Foxie now responds to voice commands and has realistic life needs! Open **http://localhost:5173** to see your enhanced AI pet.

---

## 🎤 Voice Activation System

### Wake Word
Say **"Hey Foxie"** (or "Hi Foxie", "Hello Foxie") to wake up the fox!

### Voice Commands (after waking Foxie)

| Command | Effect |
|---------|--------|
| **"feed"** | Feeds Foxie (+50 hunger) 🍖 |
| **"drink"** / **"water"** | Gives water (+40 thirst) 💧 |
| **"sleep"** | Puts Foxie to sleep (+50 energy) 😴 |
| **"play"** | Play time (+15 happiness, -5 energy) 🎮 |
| **"sit"** | Sit command 🐾 |
| **"jump"** | Jump animation ⬆️ |
| **"spin"** | Spin around 🌀 |
| **"dance"** | Dance animation 💃 |
| **"status"** | Check Foxie's current status 📊 |
| **"good fox"** / **"praise"** | Pet and praise (+10 happiness) 💕 |

### Voice Controls (Bottom Right Panel)
- **Start Listening** - Enable voice recognition (requires microphone permission)
- **Stop Listening** - Disable voice recognition
- **Wake Foxie** - Manually wake up the fox without voice command

**Status Indicators:**
- 🔇 **Waiting for "Hey Foxie"** - Listening for wake word
- 🎙️ **Awake & Listening** - Ready for commands (30s timeout)
- ⏸️ **Paused** - Voice recognition disabled

---

## 🐾 Life Simulation System

### 6 Needs (Bottom Left Panel)

Foxie has realistic needs that degrade over time:

| Need | Degradation Rate | Critical Level | How to Fix |
|------|-----------------|----------------|------------|
| **Hunger** 🍖 | -0.5% per minute | < 20% | Say "feed" or click feed button |
| **Thirst** 💧 | -0.7% per minute | < 15% | Say "drink" or give water |
| **Sleep** 😴 | -0.3% per minute | < 25% | Say "sleep" or let Foxie rest |
| **Hygiene** 🛁 | -0.05% per hour | < 30% | Bathe Foxie |
| **Happiness** 💖 | Dynamic | < 30% | Play, praise, interact |
| **Health** ❤️ | Average of all | < 40% | Maintain all other needs |

### Urgency Levels
- ✅ **Normal** - Green bar (> 50%)
- ⚠️ **Warning** - Orange bar (20-50%) + yellow border
- 🚨 **Critical** - Red bar (< 20%) + red pulsing border + vocal alerts

### Life Stages
Watch Foxie transition through different states:
- **Awake** - Normal active state
- **Eating** - After feeding command (3s animation)
- **Drinking** - After water command (3s animation)
- **Sleeping** - After sleep command (10s rest cycle)
- **Playing** - After play command (active fun time)

### Mood System
Foxie's mood changes based on needs:
- **Ecstatic** 🎉 - High happiness + well-fed
- **Happy** 😊 - Most needs satisfied
- **Content** 😌 - Comfortable state
- **Sad** 😢 - Low happiness
- **Exhausted** 🥱 - Very low sleep
- **Desperate** 😰 - Critical hunger or thirst

---

## 🎮 How to Use

### 1️⃣ Start Voice Control
1. Look at the **Voice Control panel** (bottom right)
2. Click **"Start Listening"**
3. Allow microphone permissions when prompted
4. Wait for status: "🔇 Waiting for 'Hey Foxie'"

### 2️⃣ Wake Foxie
Say loudly and clearly:
> **"Hey Foxie!"**

You'll see:
- 🎙️ Voice badge appears on Needs panel
- Status changes to "🎙️ Awake & Listening"
- Foxie perks up with scale animation
- Speech bubble may appear

### 3️⃣ Give Commands
Within 30 seconds of waking, say commands:
> **"Feed"** - Foxie eats and hunger increases
> **"Play"** - Foxie becomes playful
> **"Status"** - Check current mood/needs

### 4️⃣ Monitor Needs
Watch the **Needs Panel** (bottom left):
- **Green bars** - Foxie is healthy
- **Orange bars** - Pay attention soon
- **Red pulsing bars** - Urgent! Take action immediately

### 5️⃣ Maintain Health
Respond to vocal alerts:
- "🍖 *stomach growls* I'm really hungry!"
- "💧 *pants* I need water!"
- "😴 *yawns deeply* I'm so tired..."
- "🛁 *scratches* I need a bath!"

---

## 🧪 Testing Voice System

### Browser Compatibility
✅ **Supported:**
- Chrome/Edge (best performance)
- Safari (iOS 14.5+)
- Firefox (may require manual permissions)

❌ **Not Supported:**
- Internet Explorer
- Older browsers without Web Speech API

### Troubleshooting

**Voice commands not working?**
1. Check microphone permissions in browser
2. Ensure you're using HTTPS or localhost
3. Try saying wake word louder/clearer
4. Check Voice Control panel shows "listening"
5. Use manual "Wake Foxie" button if needed

**Needs not updating?**
1. Needs degrade over time automatically
2. Wait 1-2 minutes to see changes
3. Check localStorage in DevTools (needs are persisted)
4. Use voice commands to trigger immediate changes

---

## 🎨 UI Features

### Panels Overview

**Voice Control (Bottom Right)**
- Status indicator (animated dot)
- Start/Stop listening buttons
- Wake Foxie button (manual trigger)
- Last command display
- Help text with available commands

**Needs Panel (Bottom Left)**
- 6 need bars with icons
- Color-coded urgency (green/orange/red)
- Percentage values
- Life stage indicator
- Current mood display

**Personality Widget (Top Left - on hover)**
- Current mood emoji
- Playfulness percentage
- Curiosity percentage
- Tiredness percentage

**Stats Panel (Left Side - on hover)**
- Energy bar
- Happiness bar
- Focus bar
- Trust bar
- Current behavior display

---

## 🌟 Advanced Features

### Memory System
Foxie remembers your last 50 interactions:
- Voice commands
- Gesture interactions
- Feeding/watering events
- Play sessions

Memory persists across page refreshes!

### Autonomous Behavior
Foxie still has autonomous features:
- Wanders around screen when idle
- Reacts to hand gestures (if camera enabled)
- Personality traits drift over time
- Mood-based animations and sounds

### Integration with Existing Features
Voice commands work seamlessly with:
- Hand tracking (wave, thumbs up gestures)
- Personality system (behaviors adapt to traits)
- Sound effects (plays sounds for actions)
- Emotion tracking (voice interactions affect stats)

---

## 📊 What's New

**Voice Activation Hook** (`useVoiceActivation.js`)
- Continuous listening mode
- Wake word detection
- 15+ voice commands
- Auto-sleep after 30s inactivity
- Confidence scoring
- Error recovery

**Life Simulation Hook** (`useLifeSimulation.js`)
- 6 realistic needs with degradation
- Memory system (last 50 interactions)
- Mood calculation engine
- Urgency detection
- Life stage management
- Persistence via localStorage

**UI Enhancements**
- Voice controls panel (300px, glassmorphic)
- Needs panel (320px, urgency-aware)
- Animated status indicators
- Critical need alerts
- Voice badge on wake

---

## 🎯 Quick Commands Cheat Sheet

```
Wake: "Hey Foxie"
Feed: "feed"
Drink: "drink" or "water"
Sleep: "sleep"
Play: "play"
Dance: "dance"
Sit: "sit"
Jump: "jump"
Spin: "spin"
Status: "status" (check needs)
Love: "good fox" or "praise"
```

---

## 🚀 Next Steps

Try these combinations:
1. Wake Foxie → Say "status" → Check which needs are low
2. If hunger critical → Say "feed" → Watch eating animation
3. Let needs degrade → See vocal alerts → Respond with commands
4. Say "play" → Watch happiness increase → Energy decreases
5. Experiment with personality changes based on interactions

**Have fun with your voice-activated AI pet! 🦊✨**
