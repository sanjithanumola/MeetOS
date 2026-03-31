import { GoogleGenAI, Type } from "@google/genai";

const getApiKey = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "undefined") {
    console.warn("GEMINI_API_KEY is not set or invalid. Please ensure it is configured in the environment.");
    return "";
  }
  return key;
};

const ai = new GoogleGenAI({
  apiKey: getApiKey(),
});

export const geminiModel = "gemini-flash-latest";

export async function transcribeAudio(file: File): Promise<string> {
  const base64Data = await fileToBase64(file);
  
  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: file.type || "audio/mpeg",
            },
          },
          { text: "Transcribe this audio exactly as it is spoken. Provide only the transcript text." },
        ],
      },
    ],
  });

  return response.text || "";
}

export async function analyzeTranscript(transcript: string) {
  const prompt = `Analyze the following meeting transcript and provide a structured intelligence report:
    
  Transcript:
  ${transcript}`;

  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          executiveSummary: { type: Type.STRING },
          detailedSummary: { type: Type.STRING },
          keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          decisions: { type: Type.ARRAY, items: { type: Type.STRING } },
          actionItems: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                task: { type: Type.STRING },
                assignee: { type: Type.STRING },
                deadline: { type: Type.STRING }
              }
            } 
          },
          risks: { type: Type.ARRAY, items: { type: Type.STRING } },
          sentiment: { type: Type.STRING },
          topics: { type: Type.ARRAY, items: { type: Type.STRING } },
          speakers: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["executiveSummary", "detailedSummary", "keyPoints", "decisions", "actionItems", "risks", "sentiment", "topics", "speakers"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
}

export async function chatWithMeeting(transcript: string, analysis: any, message: string, history: any[]) {
  const chat = ai.chats.create({
    model: geminiModel,
    history: history.map((h: any) => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }],
    })),
    config: {
      systemInstruction: `You are an AI assistant for a meeting intelligence platform. You have access to the transcript and analysis of a meeting. 
      Answer questions based on this context. 
      Meeting Context:
      Transcript: ${transcript}
      Analysis: ${JSON.stringify(analysis)}`,
    },
  });

  const result = await chat.sendMessage({ message });
  return result.text || "";
}
