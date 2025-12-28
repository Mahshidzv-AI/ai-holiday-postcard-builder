import { GoogleGenAI } from "@google/genai";
import { FormData } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateHolidayWish = async (data: FormData): Promise<string> => {
  // If user provided a custom message, use it directly
  if (data.customMessage && data.customMessage.trim().length > 0) {
    return data.customMessage;
  }

  try {
    const prompt = `
      Write a personalized, short holiday wish (max 40 words).
      Recipient: ${data.recipient}
      Sender: ${data.sender}
      Holiday: ${data.holiday}
      Vibe/Tone: ${data.vibe}
      Specific Theme: ${data.theme || 'General Holiday'}
      
      Output only the message text itself. Do not include quotes or "Message:" prefixes.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        maxOutputTokens: 100,
        temperature: 0.8,
      }
    });

    return response.text?.trim() || "Happy Holidays!";
  } catch (error) {
    console.error("Text generation failed:", error);
    throw new Error("Failed to generate holiday wish.");
  }
};

export const generatePostcardImage = async (data: FormData): Promise<string> => {
  try {
    const prompt = `
      A high-quality, magical, digital art postcard background for ${data.holiday}.
      Theme: ${data.theme || 'Festive and warm'}.
      Style: ${data.vibe === 'Funny' ? 'Cartoonish, whimsical, colorful' : 'Elegant, cinematic, detailed, cozy lighting'}.
      No text, no words, just artwork.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: prompt,
      config: {
        imageConfig: {
          aspectRatio: "4:3",
        }
      }
    });

    // Extract image from response parts
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Image generation failed:", error);
    // Return a fallback placeholder if AI fails (using picsum with a random seed based on length)
    return `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`;
  }
};