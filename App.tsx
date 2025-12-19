import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TestSelector from './components/TestSelector';
import ReadingView from './components/ReadingView';
import LoginView from './components/LoginView';
import HistoryView from './components/HistoryView';
import { generateReadingSession } from './services/geminiService';
import { ReadingSession, UserSessionRecord, TestType, Difficulty, User, SharedPassage, TopicProgress } from './types';
import { auth, db, onAuthStateChanged, signOut } from './services/firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'reading' | 'history'>('home');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<ReadingSession | null>(null);
  const [currentUserSessionId, setCurrentUserSessionId] = useState<string | null>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [initialAnswers, setInitialAnswers] = useState<Record<number, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [activeTestType, setActiveTestType] = useState<TestType | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.STANDARD);
  
  const [globalProgressMap, setGlobalProgressMap] = useState<Record<string, TopicProgress>>({});
  
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUid, setFirebaseUid] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setFirebaseUid(firebaseUser.uid);
        let displayName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            if (userData.username) displayName = userData.username;
          }
        } catch (err) { console.error("Error fetching username:", err); }
        setUser({ email: firebaseUser.email || '', name: displayName, photoUrl: firebaseUser.photoURL || undefined });
      } else {
        setUser(null);
        setFirebaseUid(null);
        setGlobalProgressMap({});
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!firebaseUid) return;
      try {
        const snapAllPassages = await getDocs(query(collection(db, 'passages')));
        const snapUserSessions = await getDocs(query(collection(db, 'userSessions'), where('userId', '==', firebaseUid)));
        
        const passagesWithId = snapAllPassages.docs.map(d => ({ id: d.id, ...d.data() } as SharedPassage));
        const userCompletedIds = snapUserSessions.docs
          .filter(d => d.data().status === 'completed')
          .map(d => d.data().passageId);

        const progress: Record<string, TopicProgress> = {};
        Object.values(TestType).forEach(t => {
          Object.values(Difficulty).forEach(d => {
            progress[`${t}-${d}`] = { total: 0, completed: 0 };
          });
        });

        passagesWithId.forEach(p => {
          const key = `${p.testType}-${p.difficulty}`;
          if (progress[key]) {
            progress[key].total += 1;
            if (userCompletedIds.includes(p.id)) {
              progress[key].completed += 1;
            }
          }
        });
        setGlobalProgressMap(progress);
      } catch (err) { console.error("Error fetching stats:", err); }
    };
    fetchStats();
  }, [firebaseUid, currentView, difficulty]);

  const [fontSize, setFontSize] = useState(() => (typeof window !== 'undefined' && window.innerWidth < 768 ? 14 : 12));
  useEffect(() => { document.documentElement.style.fontSize = `${fontSize}px`; }, [fontSize]);

  const handleZoomIn = () => setFontSize(prev => Math.min(prev + 1, 24));
  const handleZoomOut = () => setFontSize(prev => Math.max(prev - 1, 12));
  const handleLogout = async () => { try { await signOut(auth); setCurrentView('home'); } catch (err) { console.error(err); } };

  const handleTestSelect = async (testType: TestType) => {
    setError(null);
    setActiveTestType(testType);
    setIsReviewMode(false);
    setInitialAnswers({});

    if (!firebaseUid) {
      setShowLogin(true);
      return;
    }

    setLoading(true);
    try {
      // Step 1: Query user sessions by ID (low complexity) and filter for 'in-progress' in memory
      const snapUserSessions = await getDocs(query(collection(db, 'userSessions'), where('userId', '==', firebaseUid)));
      const inProgressSession = snapUserSessions.docs.find(d => {
        const data = d.data();
        return data.testType === testType && data.difficulty === difficulty && data.status === 'in-progress';
      });

      if (inProgressSession) {
        const pRef = doc(db, 'passages', inProgressSession.data().passageId);
        const pSnap = await getDoc(pRef);
        if (pSnap.exists()) {
          const pData = pSnap.data();
          setSession({ title: pData.title, passage: pData.passage, summary: pData.summary, questions: pData.questions, avgTime: pData.avgTime });
          setCurrentUserSessionId(inProgressSession.id);
          setCurrentView('reading');
          setLoading(false);
          return;
        }
      }

      // Step 2: Look for a global passage not yet touched by the user
      const snapAllGlobal = await getDocs(query(collection(db, 'passages'), where('testType', '==', testType)));
      const filteredGlobal = snapAllGlobal.docs.filter(d => d.data().difficulty === difficulty);
      const touchedPassageIds = snapUserSessions.docs.map(d => d.data().passageId);
      const unreadDoc = filteredGlobal.find(d => !touchedPassageIds.includes(d.id));

      if (unreadDoc) {
        const data = unreadDoc.data();
        const newUserSession = await addDoc(collection(db, 'userSessions'), {
          userId: firebaseUid, passageId: unreadDoc.id, passageTitle: data.title,
          testType, difficulty, status: 'in-progress', createdAt: serverTimestamp()
        });
        setSession({ title: data.title, passage: data.passage, summary: data.summary, questions: data.questions, avgTime: data.avgTime });
        setCurrentUserSessionId(newUserSession.id);
        setCurrentView('reading');
        setLoading(false);
        return;
      }

      // Step 3: Generation Fallback
      const newData = await generateReadingSession(testType, difficulty);
      const passageRef = await addDoc(collection(db, 'passages'), { ...newData, testType, difficulty, createdAt: serverTimestamp() });
      const newUserSession = await addDoc(collection(db, 'userSessions'), {
        userId: firebaseUid, passageId: passageRef.id, passageTitle: newData.title,
        testType, difficulty, status: 'in-progress', createdAt: serverTimestamp()
      });
      setSession(newData);
      setCurrentUserSessionId(newUserSession.id);
      setCurrentView('reading');
    } catch (err) {
      setError("Failed to start session. This may be due to a library update or AI timeout. Please try again.");
      console.error(err);
    } finally { setLoading(false); }
  };

  const handleHistoryAction = async (record: UserSessionRecord) => {
    setLoading(true);
    try {
      const pSnap = await getDoc(doc(db, 'passages', record.passageId));
      if (pSnap.exists()) {
        const pData = pSnap.data();
        setSession({ title: pData.title, passage: pData.passage, avgTime: pData.avgTime, questions: pData.questions, summary: pData.summary });
        setCurrentUserSessionId(record.id);
        setActiveTestType(record.testType);
        setDifficulty(record.difficulty);
        setIsReviewMode(record.status === 'completed');
        setInitialAnswers(record.userAnswers || {});
        setCurrentView('reading');
      } else { setError("Passage not found."); }
    } catch (err) { setError("Could not load history."); }
    finally { setLoading(false); }
  };

  const handleNextSession = () => activeTestType && handleTestSelect(activeTestType);
  const handleBackToHome = () => { setCurrentView('home'); setSession(null); setCurrentUserSessionId(null); setActiveTestType(null); setIsReviewMode(false); };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Header onHomeClick={handleBackToHome} currentView={currentView} fontSize={fontSize} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} user={user} onLoginClick={() => setShowLogin(true)} onLogout={handleLogout} onHistoryClick={() => setCurrentView('history')} />
      {showLogin && <LoginView onClose={() => setShowLogin(false)} />}
      {loading && (
         <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-[60] flex flex-col items-center justify-center">
           <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
           <h2 className="text-2xl font-serif font-bold text-slate-800 mb-2">Preparing Session...</h2>
           <p className="text-slate-500">Checking global library and writing content.</p>
         </div>
      )}
      {currentView === 'home' && (
        <main className="pb-20">
          <TestSelector onSelect={handleTestSelect} difficulty={difficulty} onDifficultyChange={setDifficulty} progress={globalProgressMap} />
          {error && (
            <div className="fixed bottom-6 right-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-bounce z-50">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
              <button onClick={() => setError(null)} className="ml-auto text-sm underline hover:text-red-800">Dismiss</button>
            </div>
          )}
        </main>
      )}
      {currentView === 'history' && firebaseUid && <HistoryView userId={firebaseUid} onBack={handleBackToHome} onSelectSession={handleHistoryAction} />}
      {currentView === 'reading' && session && !loading && <ReadingView session={session} userSessionId={currentUserSessionId} onBack={handleBackToHome} onNext={handleNextSession} isReviewMode={isReviewMode} initialAnswers={initialAnswers} />}
    </div>
  );
}

export default App;