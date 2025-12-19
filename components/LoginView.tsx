import React, { useState } from 'react';
import Button from './Button';
import { 
  auth, 
  db,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile
} from '../services/firebase';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, limit } from "firebase/firestore";

interface LoginViewProps {
  onClose: () => void;
}

// Internal constant for Firebase Auth compliance (since we are doing passwordless-style login)
const INTERNAL_AUTH_KEY = "reading_practice_app_secure_key";

const LoginView: React.FC<LoginViewProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const saveUserToFirestore = async (userId: string, userEmail: string, name: string) => {
    try {
      await setDoc(doc(db, 'users', userId), {
        email: userEmail.toLowerCase(),
        username: name,
        username_lowercase: name.toLowerCase(),
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error("Error saving user to Firestore:", err);
    }
  };

  const checkUsernameExists = async (name: string): Promise<boolean> => {
    const cleanName = name.trim().toLowerCase();
    try {
      const q = query(
        collection(db, 'users'), 
        where('username_lowercase', '==', cleanName),
        limit(1)
      );
      const snap = await getDocs(q);
      return !snap.empty;
    } catch (err) {
      console.error("Error checking username:", err);
      return false;
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const cleanEmail = email.trim().toLowerCase();

      if (isRegistering) {
        const cleanUsername = username.trim();

        if (!cleanEmail || !cleanUsername) {
          setError('Please provide both email and username.');
          setLoading(false);
          return;
        }

        const usernameTaken = await checkUsernameExists(cleanUsername);
        if (usernameTaken) {
          setError('Username already taken. Please choose another.');
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, INTERNAL_AUTH_KEY);
        await updateProfile(userCredential.user, { displayName: cleanUsername });
        await saveUserToFirestore(userCredential.user.uid, cleanEmail, cleanUsername);
      } else {
        if (!cleanEmail) {
          setError('Please enter your email address.');
          setLoading(false);
          return;
        }

        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, INTERNAL_AUTH_KEY);
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          lastLogin: serverTimestamp()
        }, { merge: true });
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-login-credentials') {
        setError('Account not found. Please check your email or sign up.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Authentication failed. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-5 py-3 rounded-2xl bg-white border border-slate-200 focus:border-indigo-600 outline-none transition-all text-black placeholder:text-slate-400 font-medium shadow-sm disabled:bg-slate-50 text-[16px]";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-fade-in">
        <div className="p-8 md:p-10">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <button onClick={onClose} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">
            {isRegistering ? 'Create Account' : 'Hey, what\'s good?'}
          </h2>
          <p className="text-slate-500 mb-8">
            {isRegistering ? 'Choose a username and enter your email.' : 'Sign in using your registered email.'}
          </p>

          <form onSubmit={handleAuth} className="space-y-6">
            {isRegistering && (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Username</label>
                <input 
                  type="text" 
                  placeholder="e.g. readingmaster" 
                  className={inputClasses} 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                />
              </div>
            )}
            
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
              <input 
                type="email" 
                placeholder="email@example.com" 
                className={inputClasses} 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>

            {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold animate-shake">{error}</div>}

            <Button type="submit" className="w-full py-4 rounded-2xl shadow-xl shadow-indigo-100 font-bold" isLoading={loading}>
              {isRegistering ? 'Start Practicing' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center pt-6">
            <button 
              onClick={() => { setIsRegistering(!isRegistering); setError(''); }} 
              className="text-sm font-bold text-indigo-600 hover:underline"
            >
              {isRegistering ? 'Already have an account? Sign in' : "New user? Create an account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;