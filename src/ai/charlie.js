/**
 * Charlie LLM API Client
 * Handles reasoning and context understanding for the AI pet
 */

// Get Charlie API credentials from environment
const CHARLIE_API_KEY = import.meta.env.VITE_CHARLIE_API_KEY;
const CHARLIE_API_ENDPOINT = import.meta.env.VITE_CHARLIE_API_ENDPOINT || 'https://api.charlie-ai.com/v1';

/**
 * Generate a response from Charlie LLM based on context
 * @param {string} prompt - The user's input or context
 * @param {object} context - Additional context about the user state
 * @returns {Promise<string>} - AI response
 */
export async function getCharlieResponse(prompt, context = {}) {
  if (!CHARLIE_API_KEY) {
    console.warn('Charlie API key not configured');
    return getDefaultResponse(context);
  }

  try {
    const response = await fetch(`${CHARLIE_API_ENDPOINT}/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CHARLIE_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        context,
        maxTokens: 100,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Charlie API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response || getDefaultResponse(context);
  } catch (error) {
    console.error('Error calling Charlie API:', error);
    return getDefaultResponse(context);
  }
}

/**
 * Get reasoning about user mood/state
 * @param {object} state - Current app state
 * @returns {Promise<object>} - Reasoning result
 */
export async function reasonAboutState(state) {
  const prompt = `Analyze the following user state and provide mood insight:
    User Active: ${state.userActive}
    Windows Open: ${state.windowsOpen}
    Last Activity: ${state.lastActivity || 'recent'}
    
    Provide a brief, one-sentence insight.`;

  const response = await getCharlieResponse(prompt, state);
  return { insight: response };
}

/**
 * Get a pet personality response
 * @param {string} mood - Current pet mood
 * @param {object} context - Context object
 * @returns {Promise<string>} - Personality response
 */
export async function getPetResponse(mood, context = {}) {
  const moodPrompts = {
    happy: 'Generate an encouraging, upbeat message for someone working productively.',
    bored: 'Generate a gentle, slightly sad message suggesting activity.',
    excited: 'Generate an enthusiastic, energetic message celebrating productivity.',
    tired: 'Generate a calming message suggesting rest or break.',
    angry: 'Generate a warning message about system issues.',
  };

  const prompt = moodPrompts[mood] || moodPrompts.happy;
  return getCharlieResponse(prompt, context);
}

/**
 * Fallback response when Charlie API is unavailable
 */
function getDefaultResponse(context) {
  const responses = {
    happy: "Keep up the great work! 🚀",
    bored: "How about taking a break? ☕",
    excited: "You're on fire today! 🔥",
    tired: "Time to rest? 😴",
    angry: "Something needs attention! ⚠️",
  };

  return responses[context.mood] || "I'm here to help!";
}

export default {
  getCharlieResponse,
  reasonAboutState,
  getPetResponse,
};
