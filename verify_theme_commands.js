
import { parseFoxieCommand } from './src/utils/foxieCommands.js';

async function testThemeCommands() {
    const testCases = [
        "switch to dark mode",
        "enable dark mode",
        "turn on night mode",
        "switch to light mode",
        "enable light mode",
        "turn on day mode",
        "start timer", // valid control
        "hello foxie"  // valid control
    ];

    console.log("Testing Theme Commands...");
    
    for (const text of testCases) {
        try {
            const result = await parseFoxieCommand(text);
            console.log(`Input: "${text}"`);
            console.log(`Result:`, result);
            console.log('---');
        } catch (e) {
            console.error(`Error parsing "${text}":`, e);
        }
    }
}

// Mock callLLM since we don't need real AI for this test and it might fail in restricted env
import * as ai from './src/utils/ai.js';
ai.callLLM = async () => ({ text: "Mock AI response" });

testThemeCommands();
