
import { callLLM } from './ai';

export const parseFoxieCommand = async (transcript) => {
    const text = transcript.toLowerCase().trim();

    const commands = [
        { keywords: ['sleep', 'go to sleep', 'nap'], type: 'SLEEP', text: '😴 Going to sleep...' },
        { keywords: ['play', 'let\'s play', 'wanna play'], type: 'PLAY', text: '🎮 Let\'s play!' },
        { keywords: ['dance', 'show me a dance'], type: 'DANCE', text: '💃 Dancing!' },
        { keywords: ['sit', 'sit down'], type: 'SIT', text: '🐕 Sitting down' },
        { keywords: ['jump', 'hop'], type: 'JUMP', text: '⬆️ Jumping!' },
        { keywords: ['spin', 'turn around', 'run in circles', 'circle'], type: 'SPIN', text: '🌀 Spinning!' },
        { keywords: ['how are you', 'how do you feel', 'status'], type: 'STATUS', text: '📊 Checking status...' },
        { keywords: ['hello', 'hi', 'hey', 'greetings'], type: 'GREETING', text: '👋 Hello!' },
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

    // Priority 1: Exact Keyword Match (Fast)
    for (const cmd of commands) {
        if (cmd.keywords.some(kw => text.includes(kw))) {
            return { type: cmd.type, text: cmd.text };
        }
    }

    // Priority 2: Structured Pattern Matching (Regex-like)

    // Open App: "open [app name]"
    if (text.includes('open') || text.includes('launch')) {
        const appMap = {
            'notes': 'Notes',
            'note': 'Notes',
            'notepad': 'Notes',
            'tasks': 'Task Manager',
            'task': 'Task Manager',
            'todo': 'Task Manager',
            'to-do': 'Task Manager',
            'pomodoro': 'Pomodoro',
            'timer': 'Pomodoro',
            'clock': 'Pomodoro',
            'dashboard': 'Dashboard',
            'stats': 'Dashboard',
            'assistant': 'Foxie Assistant',
            'chat': 'Foxie Assistant'
        };

        for (const [key, appName] of Object.entries(appMap)) {
            if (text.includes(key)) {
                return { type: 'OPEN_APP', app: appName, text: `Opening ${appName}... 📱` };
            }
        }
    }

    // Start Timer: "start timer", "start pomodoro", "set timer for..."
    if (text.includes('start timer') || text.includes('start pomodoro') || text.includes('set timer') || text.includes('focus')) {
         return { type: 'START_TIMER', text: 'Starting timer! Let\'s focus. ⏱️' };
    }

    // Priority 3: AI Chat Fallback
    // Any request that doesn't match a known command is treated as general chat.
    try {
        console.log('FoxieCommands: No match, responding with AI chat...');

        const prompt = `You are Foxie, a helpful desktop assistant and virtual pet fox. Reply concisely and stay in character.\n\nUser: ${transcript}`;
        const response = await callLLM(prompt);
        return { type: 'CHAT', text: response.text };
    } catch (error) {
        console.error('AI Chat Failed:', error);
        return { type: 'CHAT', text: "I'm here to help, but I couldn't reach my AI brain right now." };
    }
};
