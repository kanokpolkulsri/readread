import React, { useState, useEffect } from 'react';
import Button from './Button';
import { 
  auth, 
  db,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  sendPasswordResetEmail,
  confirmPasswordReset
} from '../services/firebase';
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

interface LoginViewProps {
  onClose: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetCode, setResetCode] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('oobCode');
    const mode = params.get('mode');
    if (code && mode === 'resetPassword') {
      setResetCode(code);
    }
  }, []);

  const saveUserToFirestore = async (userId: string, userEmail: string, name: string) => {
    try {
      await setDoc(doc(db, 'users', userId), {
        email: userEmail.toLowerCase(),
        username: name.toLowerCase(),
        username_lowercase: name.toLowerCase(),
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error("Error saving user to Firestore:", err);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    const resetEmail = email.trim();
    if (!resetEmail || !resetEmail.includes('@')) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setMessage('Password reset link sent! Check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isForgotPassword) return handleForgotPassword(e);
    if (resetCode) return handleCompleteReset(e);

    setLoading(true);
    setError('');
    setMessage('');
    
    const loginEmail = email.trim();

    if (isRegistering) {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }
      if (!username.trim()) {
        setError('Please enter a username.');
        setLoading(false);
        return;
      }
    }

    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, loginEmail, password);
        const lowercaseUsername = username.toLowerCase();
        await updateProfile(userCredential.user, { displayName: lowercaseUsername });
        await saveUserToFirestore(userCredential.user.uid, loginEmail, lowercaseUsername);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, loginEmail, password);
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          lastLogin: serverTimestamp()
        }, { merge: true });
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Incorrect email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use.');
      } else {
        setError(err.message || 'Authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!resetCode) return;
    setLoading(true);
    setError('');
    try {
      await confirmPasswordReset(auth, resetCode, password);
      setMessage('Password updated! You can now sign in.');
      setResetCode(null);
      setIsForgotPassword(false);
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err: any) {
      setError('Reset link is invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-5 py-3 rounded-2xl bg-white border border-slate-200 focus:border-indigo-600 outline-none transition-all text-black placeholder:text-slate-400 font-medium shadow-sm disabled:bg-slate-50";

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

          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">{resetCode ? 'New Password' : (isForgotPassword ? 'Reset Password' : (isRegistering ? 'Create Account' : 'Welcome Back'))}</h2>
          <p className="text-slate-500 mb-8">{isForgotPassword ? 'Enter your email to get a reset link.' : 'Level up your English reading with AI.'}</p>

          <form onSubmit={handleAuth} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Username (Lowercase Only)</label>
                <input 
                  type="text" 
                  placeholder="e.g. palm" 
                  className={`${inputClasses} lowercase`} 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value.toLowerCase())} 
                  required 
                />
              </div>
            )}

            {!resetCode && (
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
            )}

            {(!isForgotPassword || resetCode) && (
              <div className={isRegistering ? "grid grid-cols-2 gap-3" : "space-y-4"}>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                  <input type="password" placeholder="••••••••" className={inputClasses} value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {isRegistering && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm</label>
                    <input type="password" placeholder="••••••••" className={inputClasses} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  </div>
                )}
              </div>
            )}

            {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold animate-shake">{error}</div>}
            {message && <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-bold">{message}</div>}

            <Button type="submit" className="w-full py-4 rounded-2xl shadow-xl shadow-indigo-100 font-bold" isLoading={loading}>
              {resetCode ? 'Update Password' : (isForgotPassword ? 'Send Reset Link' : (isRegistering ? 'Create Account' : 'Sign in'))}
            </Button>
          </form>

          <div className="text-center pt-4">
            {!isRegistering && !isForgotPassword && !resetCode && (
              <button onClick={() => setIsForgotPassword(true)} className="text-xs text-slate-400 hover:text-indigo-600 mb-4 block w-full">Forgot password?</button>
            )}
            <button onClick={() => { setIsRegistering(!isRegistering); setIsForgotPassword(false); setResetCode(null); setError(''); setMessage(''); }} className="text-sm font-bold text-indigo-600 hover:underline">
              {isForgotPassword || resetCode ? 'Back to Sign in' : (isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Create one")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;