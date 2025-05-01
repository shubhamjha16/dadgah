import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const apiKey = process.env.GOOGLE_GENAI_API_KEY;

if (!apiKey) {
  console.error(
    '\n>>> ERROR: GOOGLE_GENAI_API_KEY environment variable is not set. <<<\n' +
    'Please obtain an API key from Google AI Studio (https://aistudio.google.com/) ' +
    'and add it to your .env file like this:\n' +
    'GOOGLE_GENAI_API_KEY=YOUR_API_KEY_HERE\n' +
    'Then, restart your development server.\n'
  );
  // We don't throw an error here to allow the app to potentially start
  // but Genkit calls will fail without the key.
}


export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({ // Ensure GOOGLE_GENAI_API_KEY is set in your environment variables
      apiKey: apiKey, // Use the variable checked above
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
});
