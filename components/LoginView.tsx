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
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, limit } from "firebase/firestore";

interface LoginViewProps {
  onClose: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onClose }) => {
  const [identifier, setIdentifier] = useState(''); // Email or Username
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetCode, setResetCode] = useState<string | null>(null);

  // Check for password reset code in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('oobCode');
    const mode = params.get('mode');
    if (code && mode === 'resetPassword') {
      setResetCode(code);
    }
  }, []);

  const saveUserToFirestore = async (userId: string, email: string, name: string) => {
    try {
      await setDoc(doc(db, 'users', userId), {
        email,
        username: name,
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
    
    let resetEmail = identifier.trim();
    if (!resetEmail) {
      setError('Please enter your email or username first.');
      setLoading(false);
      return;
    }

    // Lookup email if username provided
    if (!resetEmail.includes('@')) {
      try {
        const userQuery = query(collection(db, 'users'), where('username', '==', resetEmail), limit(1));
        const querySnapshot = await getDocs(userQuery);
        if (!querySnapshot.empty) {
          resetEmail = querySnapshot.docs[0].data().email;
        } else {
          setError('Username not found.');
          setLoading(false);
          return;
        }
      } catch (err) {
        setError('Could not verify username.');
        setLoading(false);
        return;
      }
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setMessage('Password reset link sent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
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
      setMessage('Password successfully updated! You can now sign in.');
      setResetCode(null);
      setIsForgotPassword(false);
      setIsRegistering(false);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err: any) {
      setError('Link expired or invalid. Please request a new one.');
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
    
    let loginEmail = identifier.trim();

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
    } else {
      if (!loginEmail.includes('@')) {
        try {
          const userQuery = query(collection(db, 'users'), where('username', '==', loginEmail), limit(1));
          const querySnapshot = await getDocs(userQuery);
          if (!querySnapshot.empty) {
            loginEmail = querySnapshot.docs[0].data().email;
          } else {
            setError('Username not found. Please use your email address.');
            setLoading(false);
            return;
          }
        } catch (err) {
          setError('Could not verify username.');
          setLoading(false);
          return;
        }
      }
    }

    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, loginEmail, password);
        await updateProfile(userCredential.user, { displayName: username });
        await saveUserToFirestore(userCredential.user.uid, loginEmail, username);
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
        setError('Invalid identifier or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError('An error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-5 py-3 rounded-2xl bg-white border border-slate-200 focus:border-indigo-600 outline-none transition-all text-black placeholder:text-slate-400 font-medium shadow-sm disabled:bg-white disabled:text-slate-900 disabled:border-slate-100 disabled:opacity-90";

  const renderTitle = () => {
    if (resetCode) return 'New Password';
    if (isForgotPassword) return 'Reset Password';
    return isRegistering ? 'Create Account' : 'Welcome Back';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden border border-white/20 animate-fade-in">
        <div className="p-8 md:p-10">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-indigo-100 shadow-xl">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">
            {renderTitle()}
          </h2>
          <p className="text-slate-500 mb-8">
            {resetCode ? 'Choose a strong password to secure your account.' : 'Track your progress and access advanced readings.'}
          </p>

          <div className="space-y-5">
            <form onSubmit={handleAuth} className="space-y-4">
              {isRegistering && !isForgotPassword && !resetCode && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Desired Username</label>
                  <input
                    type="text"
                    placeholder="e.g. janesmith"
                    disabled={loading}
                    className={inputClasses}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              )}

              {!resetCode && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                    {isRegistering ? 'Email Address' : 'Email or Username'}
                  </label>
                  <input
                    type={isRegistering ? "email" : "text"}
                    placeholder={isRegistering ? "name@example.com" : "Email or Username"}
                    disabled={loading}
                    className={inputClasses}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
              )}

              {(!isForgotPassword || resetCode) && (
                <div className={(isRegistering || resetCode) ? "grid grid-cols-2 gap-3" : "space-y-4"}>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                      {resetCode ? 'New Password' : 'Password'}
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      disabled={loading}
                      className={inputClasses}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {(isRegistering || resetCode) && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Confirm</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        disabled={loading}
                        className={inputClasses}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold animate-shake">
                  {error}
                </div>
              )}

              {message && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold">
                  {message}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full py-4 rounded-2xl shadow-xl shadow-indigo-100 text-base font-bold"
                isLoading={loading}
              >
                {resetCode ? 'Update Password' : (isForgotPassword ? 'Send Reset Link' : (isRegistering ? 'Create Account' : 'Sign in'))}
              </Button>
            </form>

            <div className="text-center pt-2 space-y-3">
              {!isRegistering && !isForgotPassword && !resetCode && (
                <button 
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="block w-full text-xs text-slate-400 hover:text-indigo-600 font-medium transition-all"
                >
                  Forgot your password?
                </button>
              )}

              <button 
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setIsForgotPassword(false);
                  setResetCode(null);
                  setError('');
                  setMessage('');
                }}
                className="text-sm text-slate-500 hover:text-indigo-600 font-bold transition-all underline underline-offset-4 decoration-slate-200 hover:decoration-indigo-200"
              >
                {resetCode || isForgotPassword ? 'Back to Sign in' : (isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Create one")}
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50/80 p-6 text-center border-t border-slate-50">
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
            Premium AI Reading Practice. Access 1000+ unique contexts.<br/>
            Secure authentication via Firebase.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;