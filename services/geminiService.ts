import { GoogleGenAI, Type } from "@google/genai";
import { TestType, ReadingSession, DifficultyLevel } from "../types";

// Initialize Gemini Client
// Note: API_KEY is expected to be in process.env
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateReadingSession = async (testType: TestType, level: DifficultyLevel): Promise<ReadingSession> => {
  const model = "gemini-2.5-flash";

  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "A catchy title for the passage." },
      passage: { type: Type.STRING, description: "The reading passage text. Must use double newlines (\\n\\n) to separate paragraphs." },
      difficulty: { type: Type.STRING, description: "The displayed difficulty level." },
      avgTime: { type: Type.STRING, description: "Estimated reading time, e.g., '5 mins'." },
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            text: { type: Type.STRING, description: "The question stem." },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "4 or 5 multiple choice options."
            },
            correctAnswerIndex: { type: Type.INTEGER, description: "Index of the correct option (0-based)." },
            explanation: { type: Type.STRING, description: "Explanation for why the answer is correct." }
          },
          required: ["id", "text", "options", "correctAnswerIndex", "explanation"]
        }
      }
    },
    required: ["title", "passage", "difficulty", "avgTime", "questions"]
  };

  let specificInstruction = "";
  
  // Topic definitions
  switch (testType) {
    case TestType.ACADEMIC:
      specificInstruction = "Topic: Academic & Test Prep (GRE/LSAT/GMAT style). Style: Dense, argumentative, rigorous, and logical. Subjects: Philosophy, Social Science, or Abstract Theory.";
      break;
    case TestType.LITERATURE:
      specificInstruction = "Topic: Literary Fiction. Style: Narrative, descriptive, and emotive. Resemble a classic novel chapter, fancy prose, or a dramatic short story. Focus on character feelings, setting, and metaphorical language.";
      break;
    case TestType.BUSINESS:
      specificInstruction = "Topic: Business & Economy. Style: Professional, analytical, and strategic. Resemble The Wall Street Journal or Harvard Business Review. Subjects: Corporate Strategy, Markets, Leadership, or Economics.";
      break;
    case TestType.SCIENCE:
      specificInstruction = "Topic: Science & Nature. Style: Factual, explanatory, and detailed. Resemble National Geographic or Scientific American. Subjects: Biology, Psychology, Environment, or Physics.";
      break;
    case TestType.TECHNOLOGY:
      specificInstruction = "Topic: Technology & The Future. Style: Modern, forward-looking, and technical yet accessible. Resemble Wired or TechCrunch. Subjects: Artificial Intelligence, Cybernetics, Coding, or Digital Ethics.";
      break;
    case TestType.HORROR:
      specificInstruction = "Topic: Mystery & Horror. Style: Suspenseful, atmospheric, dark, and tense. Focus on sensory details, fear, and building a creepy mood. Resemble Stephen King or Gothic literature.";
      break;
    case TestType.HISTORY:
      specificInstruction = "Topic: History & Society. Style: Narrative non-fiction, informative, and retrospective. Focus on historical events, biographies, or societal changes over time.";
      break;
    case TestType.COMEDY:
      specificInstruction = "Topic: Comedy & Satire. Style: Humorous, witty, sarcastic, or light-hearted. Resemble a funny essay, a stand-up routine, or a satirical article.";
      break;
    default:
      specificInstruction = "Topic: General Reading. Style: Standard prose.";
  }

  // Proficiency Level Adjustments
  let levelInstruction = "";
  switch (level) {
    case DifficultyLevel.BEGINNER:
      levelInstruction = "Proficiency: BEGINNER. Use simple vocabulary (CEFR A2/B1). Short sentences. Avoid complex grammar. Clear and direct structure.";
      break;
    case DifficultyLevel.INTERMEDIATE:
      levelInstruction = "Proficiency: INTERMEDIATE. Use standard vocabulary (CEFR B2). Moderate sentence length. Some compound sentences.";
      break;
    case DifficultyLevel.ADVANCED:
      levelInstruction = "Proficiency: ADVANCED. Use sophisticated vocabulary (CEFR C1/C2). Complex sentence structures. Nuanced expressions.";
      break;
  }

  const prompt = `
  Create a unique reading practice session.
  
  ${specificInstruction}
  
  ${levelInstruction}
  
  FORMATTING RULES (CRITICAL):
  1. Separate every paragraph with a double newline (\\n\\n).
  2. Ensure every sentence ends with a punctuation mark followed by a space. Do not attach the next sentence immediately to the period.
  3. Indent the start of paragraphs is not required in the text, but clear separation is mandatory.
  4. Length: Approximately 300-600 words depending on the style.

  Generate 4 to 5 multiple-choice questions suitable for the proficiency level selected.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are an expert author and English teacher. Your priority is generating engaging, perfectly formatted text that perfectly matches the requested genre/topic."
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ReadingSession;
    } else {
      throw new Error("No content generated.");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};