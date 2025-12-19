
import { GoogleGenAI, Type } from "@google/genai";
import { TestType, ReadingSession, Difficulty } from "../types";

/**
 * Generates a reading session using Gemini 3 Pro.
 * Adheres to the @google/genai guidelines for model naming and response handling.
 */
export const generateReadingSession = async (testType: TestType, difficulty: Difficulty): Promise<ReadingSession> => {
  // Always create a new instance right before making the call as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-pro-preview";

  let lengthInstruction = "";
  let avgTime = "";
  let questionCountInstruction = "";
  let specificInstruction = "";

  switch (testType) {
    case TestType.QUICK_READ:
      lengthInstruction = "STRICT LENGTH CONSTRAINT: 150-200 words.";
      avgTime = "1-2 mins";
      questionCountInstruction = "Do NOT generate questions.";
      specificInstruction = "Topic: Random Interesting Knowledge. Style: Engaging and educational.";
      break;
    case TestType.BUSINESS:
      lengthInstruction = "STRICT LENGTH CONSTRAINT: 250-300 words.";
      avgTime = "3-4 mins";
      questionCountInstruction = "Generate EXACTLY 3 multiple-choice questions.";
      specificInstruction = "Topic: Business Case Study. Style: Harvard Business Case style.";
      break;
    case TestType.ENTERTAINMENT:
      lengthInstruction = "STRICT LENGTH CONSTRAINT: 200-250 words.";
      avgTime = "2-3 mins";
      questionCountInstruction = "Generate EXACTLY 3 multiple-choice questions.";
      specificInstruction = "Topic: Fiction exploring Love, Notoriety, and Sadness.";
      break;
    default:
      lengthInstruction = "STRICT LENGTH CONSTRAINT: 200-250 words.";
      avgTime = "2-3 mins";
      questionCountInstruction = "Generate EXACTLY 2 multiple-choice questions.";
      specificInstruction = "Topic: General Knowledge.";
  }

  let difficultyInstruction = "";
  if (difficulty === Difficulty.CHALLENGE) {
    difficultyInstruction = "Proficiency Level: GRE / Advanced Academic. Use sophisticated vocabulary and complex sentence structures.";
  } else {
    difficultyInstruction = "Proficiency Level: IELTS Band 8-9. Natural, fluent, and precise language.";
  }

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      passage: { type: Type.STRING },
      avgTime: { type: Type.STRING },
      summary: { type: Type.STRING },
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            text: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswerIndex: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          },
          required: ["id", "text", "options", "correctAnswerIndex", "explanation"]
        }
      }
    },
    required: ["title", "passage", "avgTime", "questions", "summary"]
  };

  const prompt = `Create a reading practice session. ${specificInstruction} ${lengthInstruction} ${difficultyInstruction} FORMATTING: Separate paragraphs with double newlines. ${questionCountInstruction} Generate a 'summary' field.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are an expert English tutor generating reading materials."
      }
    });

    // Directly access the text property as a getter (not a method call) as per @google/genai documentation
    const rawText = response.text || "";
    
    if (rawText) {
      // When responseMimeType is application/json, the model returns raw JSON directly
      const result = JSON.parse(rawText) as ReadingSession;
      if (!result.questions) result.questions = [];
      return result;
    } else {
      throw new Error("Empty response from AI.");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
