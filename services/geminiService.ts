
import { GoogleGenAI } from "@google/genai";

export const generateDistributionReport = async (summaryData: string): Promise<string> => {
  // Check for the existence of `process` before trying to access it.
  // This prevents the ReferenceError that crashes the app on load in a browser.
  if (typeof process === 'undefined' || !process.env.API_KEY) {
    console.warn("API_KEY environment variable not set or not accessible in this environment.");
    return "AI report generation is not available. The API key is not configured for this deployment. Please follow the deployment guide to set up a secure way to handle the API key, such as using a serverless function.";
  }

  try {
    // Initialize the client here, inside the function call.
    // This ensures the code only runs when the button is clicked,
    // and only if the environment supports `process.env`.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      You are an event management assistant for a cultural festival.
      Based on the following data for bhog distribution, generate a short, friendly, and informative status report.
      The tone should be positive and encouraging.
      Mention the overall progress and give a shout-out to the volunteers.
      
      Data:
      ${summaryData}

      Start the report with a festive greeting.
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error generating report with Gemini:", error);
    return "Could not generate the report due to an error. Please check the console for details.";
  }
};
