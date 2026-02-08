# Foxie - Sentient AI Desktop Companion

A premium web-based desktop environment featuring an emotionally intelligent, autonomous AI pet companion. Foxie doesn't just react—he lives, wanders, and evolves alongside you.

## Features

- **Sentient AI Pet**: Foxie the fox is powered by an ultimate behavior state machine:
  - **Autonomous Behavior**: Wanders, sits, sleeps, and interacts independently.
  - **5D Emotion System**: Tracks Energy, Happiness, Focus, Stress, and Trust.
  - **8+ Core Moods**: Happy, Excited, Angry, Sad, Bored, Sleepy, Thinking, and Neutral.
  - **Health System**: Real-time health monitoring (Excellent to Poor).
- **Advanced Interaction**:
  - **Hand Tracking**: MediaPipe-powered gesture recognition (Wave, Thumbs Up, Sniff).
  - **Voice UI**: Wake phrase "Hey Foxie" and natural language commands.
  - **Contextual Chat**: Interactive speech bubbles and AI-generated responses.
- **Productivity Desktop**:
  - **Windows 11 Aesthetics**: Dark/Light mode support, glassmorphism, and smooth animations.
  - **Productivity Dashboard**: Daily activity tracking, goal progress, and focus sessions.
  - **Utility Apps**: Notes, Task Manager, Calculator, Weather, Browser, and Pomodoro Timer.

## Tech Stack

- **React 19** + Vite (Next-gen frontend performance)
- **MediaPipe Hands**: Real-time 21-point landmark detection
- **Framer Motion**: Fluid animations and spring physics
- **Tambo & Charlie AI**: Adaptive UI and natural language reasoning
- **Howler.js & Web Audio API**: Immersive soundscapes and mood-based audio
- **Zod & UUID**: Robust data validation and identification

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

1. **Clone & Install**:
```bash
npm install
```

2. **Configure Environment**:
Copy `.env.example` to `.env` and add your API keys:
```bash
cp .env.example .env
```

3. **Launch**:
```bash
npm run dev
```
3. **Launch backend**:
```bash
cd backend
npm start

Open [http://localhost:5173](http://localhost:5173) and interact with Foxie ✋

## Project Structure

```
src/
├── components/
│   ├── Desktop.jsx          # Core desktop shell
│   ├── FoxieAvatar.jsx      # High-fidelity pet rendering
│   ├── PetAssistantUltimate.jsx # Core AI behavior engine
│   ├── FoxieVoiceUI.jsx     # Voice recognition interface
│   ├── ProductivityDashboard.jsx # Stats & Goal tracking
│   ├── Taskbar.jsx          # Windows-style taskbar
│   └── apps/                # Built-in productivity tools
├── hooks/
│   ├── useFoxAutonomy.js    # Movement & AI decision logic
│   ├── useEmotions.js       # Emotional state management
│   └── usePetSounds.js      # Adaptive audio engine
├── styles/
│   └── main.css             # Unified premium design system
└── App.jsx                  # Main entry point
```

## Key Interactions

- **Wake Foxie**: Say "Hey Foxie" or type it in the taskbar command.
- **Interact**: Use hand gestures (Wave, Thumbs Up) or click/drag Foxie.
- **Manage**: Open the **Dashboard** from the Start Menu to track your productivity.
- **Personalize**: Access **Settings** to toggle themes and optimize your experience.

---

