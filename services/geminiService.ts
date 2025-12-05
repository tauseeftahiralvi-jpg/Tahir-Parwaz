import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedArticle, Video, PoetProfile } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please ensure process.env.API_KEY is set.");
  }
  return new GoogleGenAI({ apiKey });
};

export const fetchPoetProfile = async (): Promise<PoetProfile> => {
  const ai = getClient();
  
  const prompt = `
    Find information about the Pakistani poet Tahir Parwaz using Google Search.
    Summarize his biography, list his major achievements/awards, and his most notable poetic works/books.
    
    You MUST return the result as a raw JSON object with the following structure:
    {
      "summary": "string",
      "achievements": ["string"],
      "notableWorks": ["string"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType and responseSchema are NOT allowed with googleSearch
      },
    });

    let text = response.text;
    if (!text) throw new Error("No content generated");

    // Clean up markdown code blocks if present
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        console.warn("Failed to parse JSON from search result, using text as summary");
        data = {
            summary: text,
            achievements: [],
            notableWorks: []
        };
    }
    
    // Extract sources from grounding metadata if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web?.uri && chunk.web?.title)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      }));

    return {
      summary: data.summary || "Information available in sources.",
      achievements: data.achievements || [],
      notableWorks: data.notableWorks || [],
      sources: sources
    };
  } catch (error) {
    console.error("Gemini profile fetch error:", error);
    // Return fallback data if live fetch fails
    return {
      summary: "Tahir Parwaz is a renowned poet known for his soulful expression of Punjabi and Urdu literature, touching upon themes of family, society, and human nature.",
      achievements: ["Celebrated voice in modern Punjabi poetry", "Viral acclaim on social media for 'Maa' and 'Dhee' poems"],
      notableWorks: ["Maa", "Dhee", "Village Life"],
      sources: []
    };
  }
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