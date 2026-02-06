
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

    // Priority 3: AI Fallback (Smart)
    try {
        console.log('FoxieCommands: No regex match, consulting AI brain...');
        const prompt = `
        You are Foxie, a smart virtual petfox. Map the user's request to a JSON command.
        
        Available Commands:
        - { "type": "OPEN_APP", "app": "Notes" | "Task Manager" | "Pomodoro" | "Dashboard" | "Foxie Assistant" }
        - { "type": "START_TIMER" } (if user wants to focus, study, work, or set a timer)
        - { "type": "CHAT", "text": "Your friendly, short response as a cute fox" } (for general conversation)
        - { "type": "SPIN" } (if they ask you to spin, run around)
        
        User Request: "${transcript}"
        
        Return ONLY valid JSON.
        `;
        
        const response = await callLLM(prompt);
        // Clean markdown code blocks if any
        const cleaned = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const aiCommand = JSON.parse(cleaned);
        
        if (aiCommand && aiCommand.type) {
             // Fallback text if missing
             if (aiCommand.type === 'OPEN_APP' && !aiCommand.text) aiCommand.text = `Opening ${aiCommand.app}...`;
             if (aiCommand.type === 'START_TIMER' && !aiCommand.text) aiCommand.text = 'Starting timer!';
             return aiCommand;
        }

    } catch (error) {
        console.error('AI Parse Failed:', error);
    }

    // Final Fallback: Generic chat echo
    return { type: 'CHAT', text: transcript };
};
