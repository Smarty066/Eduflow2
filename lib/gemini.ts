import { GoogleGenAI, Modality, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' 
});

export const gemini = ai;

export async function generateSummary(text: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Summarize the following academic handout text into key points and a brief overview:\n\n${text}`,
    config: {
      systemInstruction: "You are an expert academic assistant. Provide clear, concise, and structured summaries.",
    }
  });
  return response.text;
}

export async function generateAudio(text: string, voice: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr' = 'Kore') {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    return `data:audio/mp3;base64,${base64Audio}`;
  }
  throw new Error("Failed to generate audio");
}

export async function generateStudyImage(prompt: string, size: '1K' | '2K' | '4K' = '1K') {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: `Academic illustration for: ${prompt}` }],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size
      }
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Failed to generate image");
}

export async function complexQuery(query: string, context?: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: context ? `Context: ${context}\n\nQuery: ${query}` : query,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      systemInstruction: "You are a highly intelligent academic tutor. Use deep reasoning to solve complex problems and explain difficult concepts.",
    }
  });
  return response.text;
}
