import { ReadingSession, SavedSession, TestType, DifficultyLevel } from "../types";

// NOTE: Replaced Firebase with localStorage to resolve import errors and ensure data persistence works without external configuration.
const STORAGE_KEY = 'readerline_sessions';

export const databaseService = {
  // Save a new session to LocalStorage
  saveSession: async (session: ReadingSession, testType: TestType, level: DifficultyLevel): Promise<SavedSession> => {
    try {
      const timestamp = Date.now();
      const id = 'sess_' + timestamp + '_' + Math.random().toString(36).substring(2, 9);
      
      const sessionData: SavedSession = {
        ...session,
        id,
        timestamp,
        testType,
        level
      };

      // Get existing sessions
      const existingData = localStorage.getItem(STORAGE_KEY);
      const sessions: SavedSession[] = existingData ? JSON.parse(existingData) : [];
      
      // Add new session
      sessions.push(sessionData);
      
      // Save back
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      
      console.log("Session saved to LocalStorage with ID: ", id);
      
      return sessionData;
    } catch (error) {
      console.error("Error saving to LocalStorage: ", error);
      throw error;
    }
  },

  // Retrieve all sessions (mimics SELECT * FROM reading_sessions ORDER BY timestamp DESC)
  getAllSessions: async (): Promise<SavedSession[]> => {
    try {
      const existingData = localStorage.getItem(STORAGE_KEY);
      const sessions: SavedSession[] = existingData ? JSON.parse(existingData) : [];
      
      // Sort by timestamp desc
      return sessions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error("Error reading from LocalStorage: ", error);
      return [];
    }
  }
};