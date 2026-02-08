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
4. **Launch backend**:
```bash
cd backend
npm start
```

Open [http://localhost:5173](http://localhost:5173) and interact with Foxie 

## Project Structure

```
e:/Foxie
├── .env.example            # Environment configuration template
├── backend/                # Backend server logic
│   ├── server.js           # Main server entry point
│   └── tools/              # Backend tools and utilities
├── electron/               # Electron desktop wrapper
│   ├── main.cjs            # Main process
│   └── preload.cjs         # Preload script
├── public/                 # Static assets
├── scripts/                # Build and utility scripts
├── src/                    # Frontend source code
│   ├── ai/                 # AI Models & Logic
│   │   ├── charlie.js      # Charlie AI integration
│   │   └── tambo_llm.js    # Tambo LLM interface
│   ├── components/         # React Components
│   │   ├── apps/           # Productivity tools (Notes, Calculator, etc.)
│   │   ├── Desktop.jsx     # Main desktop environment
│   │   ├── FoxieAvatar.jsx # Interactive 3D/2D Avatar
│   │   ├── FoxieVoiceUI.jsx # Voice command interface
│   │   ├── PetAssistantUltimate.jsx # Core behavior engine
│   │   └── ProductivityDashboard.jsx # User stats & goals
│   ├── hooks/              # Custom React Hooks
│   │   ├── useFoxAutonomy.js    # Movement & decision logic
│   │   ├── useEmotions.js       # Emotional state system
│   │   ├── useLifeSimulation.js # Health, hunger, sleep cycles
│   │   └── usePetSounds.js      # Adaptive audio engine
│   ├── tambo/              # Tambo Registry & Integration
│   ├── utils/              # Helper functions
│   ├── voice/              # Voice processing modules
│   └── App.jsx             # Main application entry
└── vite.config.js          # Vite configuration
```

## Key Interactions

- **Wake Foxie**: Say "Hey Foxie" or type it in the taskbar command.
- **Interact**: Use hand gestures (Wave, Thumbs Up) or click/drag Foxie.
- **Manage**: Open the **Dashboard** from the Start Menu to track your productivity.
- **Personalize**: Access **Settings** to toggle themes and optimize your experience.

---

### NOTE
Please use chrome browser to properly run Foxie.