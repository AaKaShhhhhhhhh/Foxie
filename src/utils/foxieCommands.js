
export const parseFoxieCommand = (transcript) => {
    const text = transcript.toLowerCase().trim();

    const commands = [
        { keywords: ['sleep', 'go to sleep', 'nap'], type: 'SLEEP', text: '😴 Going to sleep...' },
        { keywords: ['play', 'let\'s play', 'wanna play'], type: 'PLAY', text: '🎮 Let\'s play!' },
        { keywords: ['dance', 'show me a dance'], type: 'DANCE', text: '💃 Dancing!' },
        { keywords: ['sit', 'sit down'], type: 'SIT', text: '🐕 Sitting down' },
        { keywords: ['jump', 'hop'], type: 'JUMP', text: '⬆️ Jumping!' },
        { keywords: ['spin', 'turn around'], type: 'SPIN', text: '🌀 Spinning!' },
        { keywords: ['how are you', 'how do you feel', 'status'], type: 'STATUS', text: '📊 Checking status...' },
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

    for (const cmd of commands) {
        if (cmd.keywords.some(kw => text.includes(kw))) {
            return { type: cmd.type, text: cmd.text };
        }
    }

    // Generic chat if no command matched
    return { type: 'CHAT', text: transcript };
};
