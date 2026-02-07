const API_URL = 'http://localhost:3001/api/ask';

/**
 * Ask Tambo AI a question
 * @param {string} message - The user's message
 * @param {string|null} threadId - The current conversation thread ID
 * @returns {Promise<object>} - The response from Tambo
 */
export async function askTambo(message, threadId = null) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, threadId }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to ask Tambo:', error);
    return { 
      response: "I'm having trouble connecting to my brain right now. 🧠", 
      error: error.message 
    };
  }
}
