import { GoogleGenAI } from "@google/genai";

// A singleton instance of the AI client, initialized lazily.
let aiInstance: GoogleGenAI | null = null;

/**
 * Lazily initializes and returns the GoogleGenAI instance.
 * Returns null if the API key is not available.
 */
function getAiInstance(): GoogleGenAI | null {
  if (!process.env.API_KEY) {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiInstance;
}


export const generateScript = async (prompt: string): Promise<string> => {
  const ai = getAiInstance();
  if (!ai) {
    console.warn("API_KEY environment variable not set. Cannot generate script.");
    return "API Key not configured. Please set the API_KEY environment variable to use this feature.";
  }
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a short, funny dialogue script based on the following prompt. The script should be suitable for a short animated video. Keep it concise.

        Prompt: "${prompt}"
        
        Format it like this:
        Character Name: Dialogue line.
        Character Name: Another dialogue line.
        `,
        config: {
            temperature: 0.7,
            topP: 0.95,
        }
    });

    return response.text;
  } catch (error) {
    console.error("Error generating script:", error);
    return "Sorry, I couldn't generate a script at this time. Please check the console for more details.";
  }
};