import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedArticle, Video } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please ensure process.env.API_KEY is set.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateArticleFromVideo = async (video: Video): Promise<GeneratedArticle> => {
  const ai = getClient();
  
  const prompt = `
    You are an expert literary critic, philosopher, and translator specializing in the works of Tahir Parwaz.
    The user wants a deep analysis of the video titled "${video.title}" (Description: "${video.description}").

    **Goal:** Create a rich, magazine-style article that analyzes the poem in both English and Urdu.

    **Requirements:**
    1. **title**: A captivating philosophical title in English.
    2. **englishContent**: Markdown string. 1) Start with a 'Core Philosophy' section. 2) Break down the narrative into 3 distinct emotional stages. 3) Conclude with a 'Life Lesson'. Use bolding for impact. Use > blockquotes for key verses translated to English.
    3. **urduContent**: Markdown string. This entire section must be in URDU SCRIPT (Nastaliq compatible). 1) Translate the core message into high-quality Urdu prose. 2) Write a short 'Tashreeh' (Explanation) of the poem's themes in Urdu.
    4. **emotionalSpectrum**: Analyze the vibe. Return 3-4 emotions with percentages totaling 100%. Use hex codes for colors (Red for anger, Blue for sadness, Gold for wisdom/hope, Green for peace).
    5. **tags**: List of relevant topics.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            englishContent: { type: Type.STRING },
            urduContent: { type: Type.STRING },
            emotionalSpectrum: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  percentage: { type: Type.INTEGER },
                  color: { type: Type.STRING },
                },
                required: ["label", "percentage", "color"],
              },
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["title", "englishContent", "urduContent", "emotionalSpectrum", "tags"],
        },
      }
    });

    const text = response.text;
    if (!text) throw new Error("No content generated");

    const data = JSON.parse(text);
    
    return {
      title: data.title || video.title,
      englishContent: data.englishContent || "Analysis unavailable.",
      urduContent: data.urduContent || "Urdu content unavailable.",
      emotionalSpectrum: data.emotionalSpectrum || [],
      tags: data.tags || []
    };
  } catch (error) {
    console.error("Gemini generation error:", error);
    throw error;
  }
};