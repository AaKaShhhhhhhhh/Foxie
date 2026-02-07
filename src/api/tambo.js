import { callLLM } from '../utils/ai';

/**
 * Ask Tambo AI a question
 * @param {string} message - The user's message
 * @param {string|null} threadId - (Ignored, handled by callLLM persistence)
 * @returns {Promise<object>} - The response from Tambo
 */
export async function askTambo(message, threadId = null) {
  try {
    const result = await callLLM(message);
    
    return {
        response: result.text,
        threadId: result.data?.threadId,
        skipped: result.data?.skipped
    };
  } catch (error) {
    console.error('Failed to ask Tambo:', error);
    return { 
      response: "I'm having trouble connecting to my brain right now. 🧠", 
      error: error.message 
    };
  }
}
