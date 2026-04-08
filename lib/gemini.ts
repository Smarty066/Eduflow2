import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });

export async function generateSummary(text: string) {
  const prompt = `Summarize the following academic handout text. Provide a concise summary, key points, and exam focus areas in markdown format.
  
  Text: ${text}`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });
  
  return response.text || "No summary generated.";
}

export async function analyzeImage(base64Image: string) {
  const prompt = "Extract all text from this handout image. Maintain the structure as much as possible.";
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { text: prompt },
        {
          inlineData: {
            data: base64Image,
            mimeType: "image/jpeg"
          }
        }
      ]
    }
  });
  
  return response.text || "";
}
