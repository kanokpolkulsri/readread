import React, { useState } from 'react';
import Header from './components/Header';
import TestSelector from './components/TestSelector';
import ReadingView from './components/ReadingView';
import { generateReadingSession } from './services/geminiService';
import { ReadingSession, TestType } from './types';

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'reading'>('home');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<ReadingSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTestType, setActiveTestType] = useState<TestType | null>(null);

  // Helper to get storage key
  const getStorageKey = (type: TestType) => `readerline_session_${type}`;
  
  const handleTestSelect = async (testType: TestType) => {
    setLoading(true);
    setError(null);
    setActiveTestType(testType);

    // 1. Check Cache (Skip for Quick Read)
    if (testType !== TestType.QUICK_READ) {
      const cached = localStorage.getItem(getStorageKey(testType));
      if (cached) {
        try {
          const sessionData = JSON.parse(cached);
          setSession(sessionData);
          setCurrentView('reading');
          setLoading(false);
          return;
        } catch (e) {
          console.error("Failed to parse cached session", e);
          localStorage.removeItem(getStorageKey(testType));
        }
      }
    }

    // 2. Fetch if not cached
    try {
      const data = await generateReadingSession(testType);
      setSession(data);
      
      // 3. Save to Cache (Skip for Quick Read)
      if (testType !== TestType.QUICK_READ) {
        localStorage.setItem(getStorageKey(testType), JSON.stringify(data));
      }

      setCurrentView('reading');
    } catch (err) {
      setError("Failed to generate content. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNextSession = async () => {
    if (!activeTestType) return;
    setLoading(true);
    setError(null);
    
    try {
      setSession(null); 
      const data = await generateReadingSession(activeTestType);
      setSession(data);

      // Overwrite Cache (Skip for Quick Read)
      if (activeTestType !== TestType.QUICK_READ) {
        localStorage.setItem(getStorageKey(activeTestType), JSON.stringify(data));
      }

    } catch (err) {
      setError("Failed to generate next session. Please try again.");
      setCurrentView('home'); // Fallback to home on error
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSession(null);
    setActiveTestType(null);
  };

  const handleSessionComplete = () => {
    // Clear cache when user finishes questions (not for Quick Read)
    if (activeTestType && activeTestType !== TestType.QUICK_READ) {
      localStorage.removeItem(getStorageKey(activeTestType));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Header 
        onHomeClick={handleBackToHome} 
        currentView={currentView}
      />
      
      {/* Global Loader Overlay */}
      {loading && (
         <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-[60] flex flex-col items-center justify-center">
           <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
           <h2 className="text-2xl font-serif font-bold text-slate-800 mb-2">Creating Your Session...</h2>
           <p className="text-slate-500">
             Writing a {activeTestType || 'new'} passage just for you.
           </p>
         </div>
      )}

      {currentView === 'home' && (
        <main className="pb-20">
            <TestSelector 
              onSelect={handleTestSelect} 
            />

          {error && (
            <div className="fixed bottom-6 right-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-bounce">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
              <button onClick={() => setError(null)} className="ml-auto text-sm underline hover:text-red-800">Dismiss</button>
            </div>
          )}
        </main>
      )}

      {currentView === 'reading' && session && !loading && (
        <ReadingView 
          session={session} 
          onBack={handleBackToHome}
          onNext={handleNextSession}
          onComplete={handleSessionComplete}
        />
      )}

      {/* Shared Footer (hide in reading view) */}
      {currentView !== 'reading' && (
        <footer className="bg-white border-t border-slate-200 py-12 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
            <p>&copy; {new Date().getFullYear()} readerline. Powered by Gemini AI.</p>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;