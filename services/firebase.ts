// Use standard named imports for Firebase v9+ modular SDK to ensure compatibility and correct type resolution
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged, updateProfile, sendPasswordResetEmail, confirmPasswordReset } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCwt2WEsDfwtWxwTBL3vYnWdZqdA476R20",
  authDomain: "readright-cd466.firebaseapp.com",
  projectId: "readright-cd466",
  storageBucket: "readright-cd466.firebasestorage.app",
  messagingSenderId: "664232512396",
  appId: "1:664232512396:web:5b79842a6729a1f8fe24a9"
};

// Initialize Firebase using the standard modular API
// Fix: Removing leading empty lines and consolidating imports to resolve "no exported member" errors in certain build environments.
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Ensure local persistence is enabled so users stay logged in across sessions
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting persistence:", error);
});

export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Re-export Auth functions for use in components using the modular API access
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
