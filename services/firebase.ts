
// Import from firebase/app and firebase/auth using namespaced imports to ensure compatibility with environments where named exports are not correctly resolved
import * as FirebaseApp from "firebase/app";
import * as FirebaseAuth from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCwt2WEsDfwtWxwTBL3vYnWdZqdA476R20",
  authDomain: "readright-cd466.firebaseapp.com",
  projectId: "readright-cd466",
  storageBucket: "readright-cd466.firebasestorage.app",
  messagingSenderId: "664232512396",
  appId: "1:664232512396:web:5b79842a6729a1f8fe24a9"
};

// Initialize Firebase using the modular API through namespaced imports
const app = FirebaseApp.initializeApp(firebaseConfig);
export const auth = FirebaseAuth.getAuth(app);

// Ensure local persistence is enabled so users stay logged in across sessions
FirebaseAuth.setPersistence(auth, FirebaseAuth.browserLocalPersistence).catch((error) => {
  console.error("Error setting persistence:", error);
});

export const db = getFirestore(app);
export const googleProvider = new FirebaseAuth.GoogleAuthProvider();

// Re-export Auth functions for use in components to ensure standard API access
export const signInWithEmailAndPassword = FirebaseAuth.signInWithEmailAndPassword;
export const createUserWithEmailAndPassword = FirebaseAuth.createUserWithEmailAndPassword;
export const signInWithPopup = FirebaseAuth.signInWithPopup;
export const signOut = FirebaseAuth.signOut;
export const onAuthStateChanged = FirebaseAuth.onAuthStateChanged;
export const updateProfile = FirebaseAuth.updateProfile;
export const sendPasswordResetEmail = FirebaseAuth.sendPasswordResetEmail;
export const confirmPasswordReset = FirebaseAuth.confirmPasswordReset;
