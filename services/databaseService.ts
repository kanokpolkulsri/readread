import { ReadingSession, SavedSession, TestType, DifficultyLevel } from "../types";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";

// Your web app's Firebase configuration
// These should ideally come from process.env variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "YOUR_API_KEY_HERE",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const COLLECTION_NAME = 'reading_sessions';

export const databaseService = {
  // Save a new session to Firestore
  saveSession: async (session: ReadingSession, testType: TestType, level: DifficultyLevel): Promise<SavedSession> => {
    try {
      const timestamp = Date.now();
      
      const docData = {
        ...session,
        timestamp,
        testType,
        level
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);
      
      console.log("Session written to Firestore with ID: ", docRef.id);
      
      return {
        ...docData,
        id: docRef.id
      };
    } catch (error) {
      console.error("Error adding document to Firestore: ", error);
      throw error;
    }
  },

  // Retrieve all sessions (SELECT * FROM reading_sessions ORDER BY timestamp DESC)
  getAllSessions: async (): Promise<SavedSession[]> => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      
      const sessions: SavedSession[] = [];
      querySnapshot.forEach((doc) => {
        sessions.push({
          id: doc.id,
          ...doc.data()
        } as SavedSession);
      });
      
      return sessions;
    } catch (error) {
      console.error("Error getting documents from Firestore: ", error);
      return [];
    }
  }
};