
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
            'task manager': 'Task Manager',
            'todo': 'Task Manager',
            'to-do': 'Task Manager',
            'pomodoro': 'Timer',
            'timer': 'Timer',
            'clock': 'Timer',
            'dashboard': 'Dashboard',
            'stats': 'Dashboard',
            'productivity': 'Dashboard',
            'assistant': 'Foxie Assistant',
            'foxie': 'Foxie Assistant',
            'chat': 'Foxie Assistant',
            'calculator': 'Calculator',
            'calc': 'Calculator',
            'math': 'Calculator',
            'weather': 'Weather',
            'forecast': 'Weather',
            'browser': 'Browser',
            'web': 'Browser',
            'internet': 'Browser',
            'settings': 'Settings',
            'preferences': 'Settings',
            'config': 'Settings'
        };

        for (const [key, appName] of Object.entries(appMap)) {
            if (text.includes(key)) {
                return { type: 'OPEN_APP', app: appName, text: `Opening ${appName}... 📱` };
            }
        }
    }

    // Close App: "close [app name]" or "exit [app name]"
    if (text.includes('close') || text.includes('exit') || text.includes('stop')) {
        // Close all apps
        if (text.includes('all') || text.includes('everything') || text.includes('all apps')) {
            return { type: 'CLOSE_ALL', text: 'Closing all apps... 🧹' };
        }

        const appMap = {
            'notes': 'Notes',
            'note': 'Notes',
            'notepad': 'Notes',
            'tasks': 'Task Manager',
            'task': 'Task Manager',
            'task manager': 'Task Manager',
            'todo': 'Task Manager',
            'to-do': 'Task Manager',
            'pomodoro': 'Timer',
            'timer': 'Timer',
            'clock': 'Timer',
            'dashboard': 'Dashboard',
            'stats': 'Dashboard',
            'productivity': 'Dashboard',
            'assistant': 'Foxie Assistant',
            'foxie': 'Foxie Assistant',
            'chat': 'Foxie Assistant',
            'calculator': 'Calculator',
            'calc': 'Calculator',
            'math': 'Calculator',
            'weather': 'Weather',
            'forecast': 'Weather',
            'browser': 'Browser',
            'web': 'Browser',
            'internet': 'Browser',
            'settings': 'Settings',
            'preferences': 'Settings',
            'config': 'Settings',
            'windows': 'all'
        };

        for (const [key, appName] of Object.entries(appMap)) {
            if (text.includes(key)) {
                if (appName === 'all') {
                    return { type: 'CLOSE_ALL', text: 'Closing all apps... 🧹' };
                }
                return { type: 'CLOSE_APP', app: appName, text: `Closing ${appName}...` };
            }
        }
    }

    // Start Timer: "start timer", "start pomodoro", "set timer for..."
    if (text.includes('start timer') || text.includes('start pomodoro') || text.includes('set timer') || text.includes('focus')) {
        // Extract duration
        let duration = null;
        const timeRegex = /(\d+)\s*(hour|hr|minute|min|second|sec)/g;
        let match;
        let totalSeconds = 0;
        let found = false;

        while ((match = timeRegex.exec(text)) !== null) {
            found = true;
            const value = parseInt(match[1]);
            const unit = match[2];
            
            if (unit.startsWith('hour') || unit === 'hr') totalSeconds += value * 3600;
            else if (unit.startsWith('minute') || unit === 'min') totalSeconds += value * 60;
            else if (unit.startsWith('second') || unit === 'sec') totalSeconds += value;
        }

        if (found) {
            duration = totalSeconds;
            // Format duration for response
            const minutes = Math.floor(duration / 60);
            const seconds = duration % 60;
            let timeText = '';
            if (minutes > 0) timeText += `${minutes} minute${minutes !== 1 ? 's' : ''}`;
            if (seconds > 0) timeText += `${minutes > 0 ? ' and ' : ''}${seconds} second${seconds !== 1 ? 's' : ''}`;
            
            return { type: 'START_TIMER', duration, text: `Starting timer for ${timeText}! ⏱️` };
        }

        return { type: 'START_TIMER', text: 'Starting timer! Let\'s focus. ⏱️' };
    }

    // Change Theme: "switch to dark mode", "enable light mode"
    if (text.includes('dark mode') || text.includes('night mode')) {
        return { type: 'CHANGE_THEME', theme: 'dark', text: 'Switching to dark mode! 🌙' };
    }
    if (text.includes('light mode') || text.includes('day mode')) {
        return { type: 'CHANGE_THEME', theme: 'light', text: 'Switching to light mode! ☀️' };
    }

    // Search: "search for [query]", "search [query] on browser"
    if (text.startsWith('search for') || text.startsWith('search')) {
        let query = text.replace('search for', '').replace('search', '').trim();
        // Remove trailing "on browser" etc.
        query = query.replace('on browser', '').replace('in browser', '').trim();
        
        if (query) {
             return { type: 'BROWSER_SEARCH', query, text: `Searching for "${query}"... 🔍` };
        }
    }

    // Browser: Go to URL - "go to youtube.com", "navigate to google.com"
    if (text.startsWith('go to') || text.startsWith('navigate to')) {
        let url = text.replace('go to', '').replace('navigate to', '').trim();
        // Clean up common speech patterns
        url = url.replace('dot', '.').replace(' ', '');
        if (url && !url.includes(' ')) {
            return { type: 'BROWSER_NAVIGATE', url, text: `Navigating to ${url}... 🌐` };
        }
    }

    // Browser: Open known sites - "open youtube", "open wikipedia"
    const knownSites = {
        youtube: 'https://www.youtube.com',
        wikipedia: 'https://www.wikipedia.org',
        github: 'https://github.com',
        twitter: 'https://twitter.com',
        facebook: 'https://www.facebook.com',
        reddit: 'https://www.reddit.com',
        bing: 'https://www.bing.com',
        google: 'https://www.google.com',
    };
    
    for (const [siteName, siteUrl] of Object.entries(knownSites)) {
        if (text.includes(`open ${siteName}`) || text.includes(`go to ${siteName}`)) {
            return { type: 'BROWSER_NAVIGATE', url: siteUrl, text: `Opening ${siteName}... 🌐` };
        }
    }

    // Browser: Clear/Home - "clear search", "go home", "browser home"
    if (text.includes('clear search') || text.includes('go home') || text.includes('browser home')) {
        return { type: 'BROWSER_HOME', text: 'Going to homepage... 🏠' };
    }

    // Browser: Refresh - "refresh", "refresh the page", "reload"
    if (text.includes('refresh') || text.includes('reload')) {
        return { type: 'BROWSER_REFRESH', text: 'Refreshing the page... 🔄' };
    }

    // Browser: Back - "go back", "back"
    if (text === 'go back' || text === 'back' || text.includes('go back')) {
        return { type: 'BROWSER_BACK', text: 'Going back... ⬅️' };
    }

    // Priority 3: AI Chat Fallback
    // Any request that doesn't match a known command is treated as general chat.
    try {
        console.log('FoxieCommands: No match, responding with AI chat...');

        const prompt = `You are Foxie, a helpful desktop assistant and virtual pet fox. Reply concisely and stay in character. 
At the END of your response, add a line with the detected user emotion in format: [EMOTION: happy/sad/excited/confused/frustrated/neutral]

User: ${transcript}`;
        const response = await callLLM(prompt);
        
        // Extract emotion from response
        const emotionMatch = response.text.match(/\[EMOTION:\s*(happy|sad|excited|confused|frustrated|neutral|empathetic|curious|concerned|joyful)\]/i);
        let emotion = 'neutral';
        let cleanText = response.text;
        
        if (emotionMatch) {
            emotion = emotionMatch[1].toLowerCase();
            cleanText = response.text.replace(emotionMatch[0], '').trim();
        } else {
            // Fallback: detect emotion from user input
            const inputLower = transcript.toLowerCase();
            if (inputLower.includes('sad') || inputLower.includes('depressed') || inputLower.includes('unhappy') || inputLower.includes('crying')) {
                emotion = 'empathetic';
            } else if (inputLower.includes('happy') || inputLower.includes('excited') || inputLower.includes('great') || inputLower.includes('awesome')) {
                emotion = 'joyful';
            } else if (inputLower.includes('confused') || inputLower.includes('don\'t understand') || inputLower.includes('what')) {
                emotion = 'curious';
            } else if (inputLower.includes('angry') || inputLower.includes('frustrated') || inputLower.includes('annoyed')) {
                emotion = 'concerned';
            }
        }
        
        return { type: 'CHAT', text: cleanText, emotion };
    } catch (error) {
        console.error('AI Chat Failed:', error);
        return { type: 'CHAT', text: "I'm here to help, but I couldn't reach my AI brain right now.", emotion: 'concerned' };
    }
};
