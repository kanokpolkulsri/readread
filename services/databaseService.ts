import { supabase } from "./supabase";
import { ReadingSession, SavedSession, TestType, DifficultyLevel } from "../types";

// Legacy/Mock export to prevent breaking unused LoginModal if it exists
export const mockLogin = async (email: string) => {
  return { user: { email, uid: 'mock' } };
};

export const databaseService = {
  // Save a new session to Supabase 'books' table
  saveSession: async (session: ReadingSession, testType: TestType, level: DifficultyLevel): Promise<SavedSession> => {
    try {
      const dbPayload = {
        title: session.title,
        passage: session.passage,
        difficulty: session.difficulty,
        avg_time: session.avgTime,
        questions: session.questions,
        question_count: session.questions.length,
        topic: testType,
        level: level,
      };

      const { data, error } = await supabase
        .from('books')
        .insert([dbPayload])
        .select()
        .single();

      if (error) {
        console.error("Supabase Insert Error:", error);
        // Fallback to local structure if DB fails, but throw to alert app
        throw error;
      }

      console.log("Session saved to Supabase with ID:", data.id);

      return {
        ...session,
        id: data.id,
        timestamp: new Date(data.created_at).getTime(),
        testType: testType,
        level: level
      };
    } catch (error) {
      console.error("Error saving to database: ", error);
      throw error;
    }
  },

  // Retrieve all sessions from Supabase
  getAllSessions: async (): Promise<SavedSession[]> => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase Select Error:", error);
        return [];
      }

      return data.map((item: any) => ({
        title: item.title,
        passage: item.passage,
        difficulty: item.difficulty,
        avgTime: item.avg_time,
        questions: item.questions,
        id: item.id,
        timestamp: new Date(item.created_at).getTime(),
        testType: item.topic as TestType,
        level: item.level as DifficultyLevel
      }));
    } catch (error) {
      console.error("Error getting documents: ", error);
      return [];
    }
  }
};