import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

const getClient = () => {
  if (!client && process.env.API_KEY) {
    client = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return client;
};

export const runPythonSimulation = async (code: string, history: string): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Error: API Key not configured.";

  try {
    // We simulate a Python REPL by asking Gemini to act like one.
    const prompt = `
    ACT AS A PYTHON INTERPRETER.
    I will give you Python code. You will execute it (simulate) and return ONLY the output (stdout/stderr) or the return value.
    Do not wrap in markdown blocks (no \`\`\`).
    Do not explain.
    If there is an error, output the Python error message.
    
    PREVIOUS HISTORY:
    ${history}
    
    CURRENT CODE:
    ${code}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error(error);
    return "Error: Failed to execute code via Gemini.";
  }
};

export const getCodeSuggestion = async (context: string): Promise<string> => {
   const ai = getClient();
   if (!ai) return "# API Key missing";

   try {
     const response = await ai.models.generateContent({
       model: 'gemini-2.5-flash',
       contents: `Provide a short, concise continuation or fix for this code:\n${context}`,
     });
     return response.text || "";
   } catch (e) {
     return "";
   }
}