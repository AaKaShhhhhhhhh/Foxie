
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const key = process.env.TAMBO_PROJECT_API_KEY;

const endpoints = [
    'https://api.tambo.co/threads',
    'https://api.tambo.co/v1/threads',
    'https://api.tambo.ai/v1/threads',
    'https://api.tambo.ai/threads'
];

async function test() {
    console.log('Testing endpoints with key:', key ? key.substring(0, 5) + '...' : 'MISSING');
    
    for (const url of endpoints) {
        try {
            console.log(`\nTrying: ${url}`);
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });
            console.log(`Status: ${res.status} ${res.statusText}`);
            const text = await res.text();
            console.log(`Response: ${text.substring(0, 100)}...`);
        } catch (err) {
            console.error(`Error connecting to ${url}:`, err.message);
        }
    }
}

test();
