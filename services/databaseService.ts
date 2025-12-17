import { ReadingSession, SavedSession, TestType, DifficultyLevel } from "../types";

// Using a local storage mock implementation to ensure functionality.
const STORAGE_KEY = 'readerline_sessions_local';

export const mockLogin = async (email: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock logic
  if (email.includes('error')) {
    throw new Error("Invalid credentials");
  }
  
  if (email === 'exists@test.com') {
     throw new Error("User already exists. Sign in?");
  }

  return {
    user: {
      email: email,
      uid: 'mock-uid-' + Date.now(),
    }
  };
};

export const databaseService = {
  // Save a new session to LocalStorage
  saveSession: async (session: ReadingSession, testType: TestType, level: DifficultyLevel): Promise<SavedSession> => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const timestamp = Date.now();
      
      const docData: SavedSession = {
        ...session,
        id: 'sess-' + timestamp,
        timestamp,
        testType,
        level,
      };

      const stored = localStorage.getItem(STORAGE_KEY);
      const sessions: SavedSession[] = stored ? JSON.parse(stored) : [];
      sessions.unshift(docData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      
      console.log("Session saved locally (mock DB)");
      return docData;
    } catch (error) {
      console.error("Error saving to local storage: ", error);
      throw error;
    }
  },

  // Retrieve all sessions
  getAllSessions: async (): Promise<SavedSession[]> => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error getting from local storage: ", error);
      return [];
    }
  }
};