
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const apiKey = process.env.TAMBO_PROJECT_API_KEY;
const endpoint = process.env.TAMBO_API_ENDPOINT || 'https://api.tambo.co';

console.log('--- Tambo Debug Script ---');
console.log('Endpoint:', endpoint);

if (!apiKey) {
    console.error('ERROR: TAMBO_PROJECT_API_KEY is missing in .env');
    process.exit(1);
}

console.log('API Key length:', apiKey.length);
console.log('API Key start:', apiKey.substring(0, 5));
console.log('API Key end:', apiKey.substring(apiKey.length - 5));

async function testCreateThread() {
    console.log('\nTesting POST /threads...');
    try {
        const res = await fetch(`${endpoint}/threads`, {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: {
                    role: 'user',
                    content: [{ type: 'text', text: "Hello from Foxie Debug" }]
                }
            })
        });

        console.log('Status:', res.status, res.statusText);
        const text = await res.text();
        console.log('Body:', text);

        if (!res.ok) {
            console.error('FAILED: Thread creation failed.');
        } else {
            console.log('SUCCESS: Thread created.');
        }
    } catch (err) {
        console.error('EXCEPTION:', err);
    }
}

testCreateThread();
