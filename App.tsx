import React, { useState } from 'react';
import Header from './components/Header';
import TestSelector from './components/TestSelector';
import ReadingView from './components/ReadingView';
import { generateReadingSession } from './services/geminiService';
import { ReadingSession, TestType, DifficultyLevel } from './types';

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'reading'>('home');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<ReadingSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>(DifficultyLevel.INTERMEDIATE);

  const handleTestSelect = async (testType: TestType) => {
    setLoading(true);
    setError(null);
    try {
      // Pass the selected difficulty level to the generator
      const data = await generateReadingSession(testType, difficultyLevel);
      setSession(data);
      setCurrentView('reading');
    } catch (err) {
      setError("Failed to generate content. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSession(null);
  };

  const handleRetry = () => {
    setCurrentView('home');
    setSession(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {currentView === 'home' && (
        <>
          <Header onHomeClick={() => setCurrentView('home')} />
          
          <main className="pb-20">
            {loading ? (
               <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                 <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                 <h2 className="text-xl font-serif font-bold text-slate-800">Constructing Passage...</h2>
                 <p className="text-slate-500 mt-2">Drafting a {difficultyLevel.toLowerCase()} level session...</p>
               </div>
            ) : (
              <TestSelector 
                onSelect={handleTestSelect} 
                selectedLevel={difficultyLevel}
                onLevelChange={setDifficultyLevel}
              />
            )}

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

          <footer className="bg-white border-t border-slate-200 py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
              <p>&copy; {new Date().getFullYear()} Lexicon Practice. Powered by Gemini AI.</p>
            </div>
          </footer>
        </>
      )}

      {currentView === 'reading' && session && (
        <ReadingView 
          session={session} 
          onBack={handleBackToHome}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
}

export default App;