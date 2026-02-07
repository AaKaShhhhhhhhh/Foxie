# 🦊 Foxie - Windows-like Desktop with Emotional AI Pet Assistant

A modern web-based desktop environment featuring an emotional AI pet companion powered by Tambo and Charlie LLM.

## ✨ Features

- **Windows-like Desktop UI**: Fullscreen desktop with taskbar, start menu, and draggable windows
- **Emotional AI Pet**: Foxie the pet responds to your activity with 5 moods:
  - 😊 **Happy**: When you're being productive
  - 😔 **Bored**: When you're inactive
  - 🎉 **Excited**: When you have multiple windows open
  - 😴 **Tired**: When you have no windows open
  - ⚠️ **Angry**: For system warnings

- **Productivity Apps**:
  - 📝 **Notes**: Quick note-taking app
  - 🍅 **Pomodoro Timer**: 25-min focus sessions with 5-min breaks
  - ✓ **Task Manager**: Create and track tasks

- **Adaptive UI**: Tambo AI decides which UI components to show based on your intent
- **Smart Notifications**: Real-time feedback and pet messages (top-right corner)
- **Natural Interactions**: Charlie LLM generates contextual pet responses

## 🛠️ Tech Stack

- **React 18** + Vite (lightning-fast dev server)
- **@tambo-ai/react**: Adaptive UI components
- **Framer Motion**: Smooth animations
- **Charlie LLM**: Natural language reasoning
- **MediaPipe**: Hand/webcam detection (future)
- **UUID**: Unique ID generation
- **Howler.js**: Audio (future)

## 📦 Installation

### Prerequisites
- Node.js 16+
- npm or yarn

### Setup

1. **Install dependencies**:
```bash
npm install
```

Dependencies were pre-installed:
- `@tambo-ai/react` - Adaptive UI
- `@mediapipe/hands @mediapipe/camera_utils` - Hand tracking
- `framer-motion` - Animations
- `uuid` - ID generation
- `howler` - Audio

2. **Configure Environment Variables**:

Copy `.env.example` to `.env.local` and fill in your Charlie API credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
# Recommended (Tambo)
VITE_TAMBO_API_KEY=your_tambo_api_key_here
VITE_TAMBO_API_ENDPOINT=https://api.tambo.ai/v1
VITE_LLM_PROVIDER=tambo

# OR: OpenAI
# VITE_OPENAI_API_KEY=your_openai_api_key_here
# VITE_LLM_PROVIDER=openai
```

Note: for Electron (`npm run electron:dev`), the main process also loads `.env.local` / `.env` and supports non-`VITE_` aliases like `TAMBO_API_KEY`, `OPENAI_API_KEY`, `LLM_API_KEY`, and `LLM_PROVIDER`.

3. **Start Development Server**:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📂 Project Structure

```
src/
├── components/
│   ├── Desktop.jsx          # Main desktop container
│   ├── Taskbar.jsx          # Windows-style taskbar with clock
│   ├── StartMenu.jsx        # App launcher menu
│   ├── Window.jsx           # Draggable window container
│   ├── PetAssistant.jsx     # Foxie the AI pet
│   ├── Notifications.jsx    # Notification toasts
│   └── apps/
│       ├── Notes.jsx        # Notes app
│       ├── Pomodoro.jsx     # Pomodoro timer
│       └── Tasks.jsx        # Task manager
├── ai/
│   └── charlie.js           # Charlie LLM API client
├── tambo/
│   └── registry.js          # Tambo adaptive UI registry
├── styles/
│   └── main.css             # All styles (modern Windows design)
├── App.jsx                  # Root component
└── main.jsx                 # Vite entry point
```

## 🚀 Usage

### Opening Apps
1. Click the **Start** button in the taskbar
2. Click on an app icon (Notes, Pomodoro, Task Manager)
3. Drag windows by their titlebar
4. Close/minimize windows with the controls

### Interacting with Foxie
- Foxie automatically changes mood based on your activity
- He'll send messages and react to your actions
- Hover over Foxie to see his current mood
- The more you work, the happier he becomes!

### Task Management
- **Notes**: Jot down quick thoughts
- **Pomodoro**: Focus for 25 mins, then break for 5 mins
- **Tasks**: Add, complete, and delete tasks

## 🧠 AI Integration

### Charlie LLM Features
- Generates natural pet responses
- Reasons about user state and mood
- Creates contextual suggestions

### Tambo Adaptive UI
- Detects user intent automatically
- Shows relevant components based on activity
- Prioritizes notifications and UI elements

Example:
```javascript
// Charlie generates pet responses
const response = await getPetResponse('happy', { windowsOpen: 3 });
// Returns: "You're on fire today! 🔥"

// Tambo selects adaptive UI
const adaptiveUI = getAdaptiveUI({ userActive: true, windowsOpen: 2 });
// Returns: { intent: 'productivity.taskFocus', component: 'Pomodoro', ... }
```

## 🎨 Customization

### Change Pet Emojis
Edit `src/components/PetAssistant.jsx`:
```javascript
const moodEmoji = {
  happy: '😊',      // Change these
  bored: '😔',
  excited: '🎉',
  // ...
};
```

### Modify Colors
Edit `src/styles/main.css` - look for CSS variables and gradients

### Add New Apps
1. Create `src/components/apps/MyApp.jsx`
2. Add to start menu in `Desktop.jsx`
3. Add render logic in `renderAppContent()`

## 📝 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code (if ESLint configured)
npm run lint
```

## 🔧 Development Tips

- **Hot Module Replacement (HMR)**: Changes auto-reload in browser
- **Component Isolation**: Each component is independent
- **State Management**: Uses React hooks (useState, useEffect)
- **CSS Modules**: All styles in `src/styles/main.css`

## 🐛 Troubleshooting

### App won't load?
- Check that `npm run dev` is running
- Clear browser cache (Ctrl+Shift+Delete)
- Check console for errors (F12 → Console tab)

### Charlie API not working?
- Verify `VITE_CHARLIE_API_KEY` is set in `.env.local`
- Check your Charlie account balance
- Test API manually: `curl -H "Authorization: Bearer YOUR_KEY" https://api.charlie-ai.com/v1/...`

### Pet not reacting?
- Ensure you have windows open
- Move your mouse to trigger activity detection
- Check browser console for errors

## 🚧 Planned Features

- [ ] Webcam hand gesture recognition
- [ ] Sound/audio responses from pet
- [ ] Persistent storage (localStorage)
- [ ] Dark mode
- [ ] Multi-pet support
- [ ] Custom pet skins
- [ ] Voice commands
- [ ] Screen sharing integration

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit PRs

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the code comments
3. Check browser console for errors

---

**Made with ❤️ by Foxie Desktop Team**
