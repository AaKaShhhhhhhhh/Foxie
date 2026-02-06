/**
 * Tambo AI LLM Client
 * Handles reasoning and context understanding for the AI pet using OpenAI gpt-5.2
 */

import { callLLM } from '../utils/ai';

/**
 * Generate a response from Tambo AI based on context
 * @param {string} prompt - The user's input or context
 * @param {object} context - Additional context about the user state
 * @returns {Promise<string>} - AI response
 */
export async function getTamboResponse(prompt, context = {}) {
  try {
    const response = await callLLM(prompt, { context });
    return response.text;
  } catch (error) {
    console.error('Error calling Tambo AI:', error);
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
    
    Provide a brief, one-sentence insight as Foxie.`;

  const text = await getTamboResponse(prompt, state);
  return { insight: text };
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
  return getTamboResponse(prompt, context);
}

/**
 * Fallback response
 */
function getDefaultResponse(context) {
  const responses = {
    happy: "Keep up the great work! 🚀",
    bored: "How about taking a break? ☕",
    excited: "You're on fire today! 🔥",
    tired: "Time to rest? 😴",
    angry: "Something needs attention! ⚠️",
  };

  return responses[context.mood] || "I'm here to help! 🦊";
}

export default {
  getTamboResponse,
  reasonAboutState,
  getPetResponse,
};
