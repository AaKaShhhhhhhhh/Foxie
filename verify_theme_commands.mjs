
import { parseFoxieCommand } from './src/utils/foxieCommands.js';

// Mock callLLM since we don't need real AI for this test 
// We need to mock the module import if possible, but for simple testing 
// we can rely on catching the error if callLLM fails, as our test cases shouldn't trigger it.
// Actually, foxieCommands imports callLLM. If we run this file, node might complain about missing dependencies or non-mocked imports.
// However, let's try to run it. If it fails on import, we might need a different approach.

async function testThemeCommands() {
    const testCases = [
        "switch to dark mode",
        "enable dark mode",
        "turn on night mode",
        "switch to light mode",
        "enable light mode",
        "turn on day mode",
        "start timer"
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

testThemeCommands();
