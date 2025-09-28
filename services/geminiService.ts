
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
  // This is a placeholder for development.
  // In a real environment, the key would be set.
  console.warn("API_KEY environment variable not set. Gemini features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateDistributionReport = async (summaryData: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API key not configured. Please set the API_KEY environment variable to generate reports.";
  }
  try {
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
    return "Could not generate the report due to an error. Please check the console.";
  }
};
