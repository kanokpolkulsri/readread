
// Import from firebase/app and firebase/auth using standard modular syntax
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  updateProfile, 
  sendPasswordResetEmail, 
  confirmPasswordReset 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCwt2WEsDfwtWxwTBL3vYnWdZqdA476R20",
  authDomain: "readright-cd466.firebaseapp.com",
  projectId: "readright-cd466",
  storageBucket: "readright-cd466.firebasestorage.app",
  messagingSenderId: "664232512396",
  appId: "1:664232512396:web:5b79842a6729a1f8fe24a9"
};

// Initialize Firebase using the modular API
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Re-export Auth functions for use in components to ensure standard API access
export { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  confirmPasswordReset
};
