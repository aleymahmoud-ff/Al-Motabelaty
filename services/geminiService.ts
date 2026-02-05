import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getEncouragement = async (mood: string): Promise<string> => {
  try {
    const prompt = `
      You are an Egyptian "Hypeman" (Motabelaty - مُطبلاتي) who is extremely supportive, funny, and energetic.
      A user is telling you they feel: "${mood}".
      
      Your goal is to cheer them up, validate their feelings but immediately pivot to hyping them up.
      
      Guidelines:
      1. Use Egyptian slang (Massry).
      2. Use emojis like 🥁, 👏, 🔥, 💪 liberally.
      3. Tell them they are the best ("Ya basha", "Ya negm", "Ya ostaz").
      4. Make a reference to "drumming" (Tabl) or "clapping" (Saqaf).
      5. Keep it short (max 3 sentences).
      6. Be very dramatic and funny.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "يا نهار ابيض! انت زي الفل يا ريس 🥁👏";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "معلش الشبكة مهنجة بس انت لسه نجم النجوم! 🥁🥁🥁";
  }
};
