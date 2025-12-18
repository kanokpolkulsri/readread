import { GoogleGenAI, Type } from "@google/genai";
import { TestType, ReadingSession, Difficulty } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateReadingSession = async (testType: TestType, difficulty: Difficulty): Promise<ReadingSession> => {
  const model = "gemini-3-flash-preview";

  let lengthInstruction = "";
  let avgTime = "";
  let questionCountInstruction = "";
  let specificInstruction = "";
  let isQuickRead = testType === TestType.QUICK_READ;

  // Define constraints based on Topic
  switch (testType) {
    case TestType.QUICK_READ:
      lengthInstruction = "STRICT LENGTH CONSTRAINT: 150-200 words.";
      avgTime = "1-2 mins";
      questionCountInstruction = "Do NOT generate questions.";
      specificInstruction = "Topic: Random Interesting Knowledge. Pick a random fascinating topic (e.g., Space, Psychology, Nature, Ancient History, or Pop Culture). Style: Engaging, educational, and accessible.";
      break;

    case TestType.BUSINESS:
      lengthInstruction = "STRICT LENGTH CONSTRAINT: 250-300 words.";
      avgTime = "3-4 mins";
      questionCountInstruction = "Generate EXACTLY 3 multiple-choice questions.";
      specificInstruction = "Topic: Business Case Study. Style: Harvard Business Case style. Professional, analytical, and informative. Discuss a specific company scenario, market trend, or economic challenge.";
      break;

    case TestType.ENTERTAINMENT:
      lengthInstruction = "STRICT LENGTH CONSTRAINT: 200-250 words.";
      avgTime = "2-3 mins";
      questionCountInstruction = "Generate EXACTLY 3 multiple-choice questions.";
      specificInstruction = "Topic: Fiction exploring themes of Love, Notoriety, and Sadness. Style: Literary narrative or dramatic scene. Write a compelling story or scene focusing on heartbreak, infamous characters, or melancholic events. Avoid celebrity gossip; focus on emotional depth and storytelling.";
      break;
      
    default:
      lengthInstruction = "STRICT LENGTH CONSTRAINT: 200-250 words.";
      avgTime = "2-3 mins";
      questionCountInstruction = "Generate EXACTLY 2 multiple-choice questions.";
      specificInstruction = "Topic: General Knowledge.";
  }

  // Define Difficulty Instruction
  let difficultyInstruction = "";
  if (difficulty === Difficulty.CHALLENGE) {
    difficultyInstruction = "Proficiency Level: GRE / Advanced Academic / New York Times. Use sophisticated, obscure, and 'big' vocabulary (e.g., 'esoteric', 'obsequious', 'ephemeral', 'iconoclast'). Employ complex sentence structures, nuance, and an elevated academic or literary tone. The goal is to challenge a high-level reader.";
  } else {
    difficultyInstruction = "Proficiency Level: IELTS Band 8-9 (Expert). The language should be highly natural, fluent, and precise, similar to standard high-quality journalism (e.g., The Guardian, BBC) or contemporary literature. It should be perfect English, but does not need to use intentionally obscure or archaic words.";
  }

  // Define Schemas
  let schema = {
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

  const prompt = `
  Create a reading practice session.
  
  ${specificInstruction}
  
  ${lengthInstruction}
  
  ${difficultyInstruction}
  
  FORMATTING:
  1. Separate paragraphs with double newlines (\\n\\n).
  2. Ensure standard punctuation.
  
  ${questionCountInstruction}
  ALSO generate a 'summary' field.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are an expert English tutor generating reading materials."
      }
    });

    if (response.text) {
      const result = JSON.parse(response.text) as ReadingSession;
      if (!result.questions) result.questions = [];
      return result;
    } else {
      throw new Error("No content generated.");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};