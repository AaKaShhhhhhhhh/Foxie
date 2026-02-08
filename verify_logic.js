
// Mock callLLM
const callLLM = async () => ({ text: "Mock AI response" });

const parseFoxieCommand = async (transcript) => {
    const text = transcript.toLowerCase().trim();

    const commands = [
        { keywords: ['sleep', 'go to sleep', 'nap'], type: 'SLEEP', text: '😴 Going to sleep...' },
        // ... (omitting other commands for brevity as they are not the focus, but good to keep structure)
    ];

    // Priority 1: Exact Keyword Match (Fast)
    // ...

    // Change Theme: "switch to dark mode", "enable light mode"
    if (text.includes('dark mode') || text.includes('night mode')) {
        return { type: 'CHANGE_THEME', theme: 'dark', text: 'Switching to dark mode! 🌙' };
    }
    if (text.includes('light mode') || text.includes('day mode')) {
        return { type: 'CHANGE_THEME', theme: 'light', text: 'Switching to light mode! ☀️' };
    }
    
    // ... (rest of logic)

    return { type: 'UNKNOWN', text: "Unknown command" };
};

// Test
async function test() {
    console.log("Testing...");
    const t1 = await parseFoxieCommand("switch to dark mode");
    console.log("Dark Mode:", t1);
    
    const t2 = await parseFoxieCommand("enable light mode");
    console.log("Light Mode:", t2);
}

test();
