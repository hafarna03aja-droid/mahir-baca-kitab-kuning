import { GoogleGenAI, Chat, GenerateContentResponse, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const analyzeTextSimple = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error in simple text analysis:", error);
    return "Maaf, terjadi kesalahan saat menganalisis teks.";
  }
};

export const analyzeTextDeep = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 32768 } }
    });
    return response.text;
  } catch (error) {
    console.error("Error in deep text analysis:", error);
    return "Maaf, terjadi kesalahan saat melakukan analisis mendalam.";
  }
};

export const generateGroundedResponse = async (query: string) => {
  try {
    const response = await ai.models.generateContent({
       model: "gemini-2.5-flash",
       contents: query,
       config: {
         tools: [{googleSearch: {}}],
       },
    });
    return {
      text: response.text,
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
    };
  } catch (error) {
    console.error("Error generating grounded response:", error);
    return {
      text: "Maaf, terjadi kesalahan saat mencari informasi.",
      sources: [],
    };
  }
};

let chatInstance: Chat | null = null;

export const getChatStream = async (prompt: string) => {
  if (!chatInstance) {
    chatInstance = ai.chats.create({ 
      model: 'gemini-2.5-flash',
      // Using gemini-2.5-flash as it's great for chat. For even lower latency, flash-lite could be an option.
      config: {
        systemInstruction: "You are a helpful assistant specializing in 'Kitab Kuning' and Islamic studies. Answer in Bahasa Indonesia unless the user asks in another language. Use Markdown formatting to structure your answers clearly. Use headings for main topics, bold for important terms, and bullet points for lists to make the information easy to understand."
      }
    });
  }
  return chatInstance.sendMessageStream({ message: prompt });
};


export const generateSpeech = async (textToSpeak: string): Promise<string | null> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: textToSpeak }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, 
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Error generating speech:", error);
        return null;
    }
};

export const createLiveSession = () => {
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    config: {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: 'You are a friendly and interactive Arabic reading coach. Start the conversation with a greeting in Arabic like "Ahlan wa sahlan! Mari kita mulai latihan membaca." Listen to the user\'s Arabic reading. Provide your primary feedback on pronunciation and fluency in **Bahasa Indonesia**. However, you can use short, encouraging Arabic phrases like "ممتاز (Mumtaz!)" for good reading, or "حاول مرة أخرى (Hawil marratan ukhra)" for corrections. Keep your feedback concise, positive, and helpful to create a supportive learning environment.',
    },
  });
};