
// Mock callLLM
const callLLM = async () => ({ text: "Mock AI response" });

const parseFoxieCommand = async (transcript) => {
    const text = transcript.toLowerCase().trim();

    // ... (mocking previous commands)

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
    
    return { type: 'UNKNOWN', text: "Unknown command" };
};

// Test
const fs = require('fs');

async function test() {
    console.log("Testing Timer Duration...");
    let output = '';
    
    const cases = [
        "set timer for 10 minutes",
        "start a 5 min timer",
        "set timer for 1 hour and 30 minutes",
        "start timer", // default
        "focus for 25 mins"
    ];

    for (const c of cases) {
        const res = await parseFoxieCommand(c);
        const log = `Input: "${c}"\nResult: ${JSON.stringify(res)}\n---\n`;
        console.log(log);
        output += log;
    }
    
    fs.writeFileSync('verify_timer_results.txt', output);
}

test();
