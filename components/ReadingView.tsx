import React, { useState, useEffect, useMemo } from 'react';
import { ReadingSession } from '../types';
import Button from './Button';

interface ReadingViewProps {
  session: ReadingSession;
  onBack: () => void;
  onRetry: () => void;
}

const ReadingView: React.FC<ReadingViewProps> = ({ session, onBack, onRetry }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Text cleaning and paragraph splitting logic
  const formattedPassage = useMemo(() => {
    if (!session.passage) return [];
    
    // 1. Fix missing space after period (e.g. "end.The" -> "end. The")
    // This looks for a period followed immediately by a capital letter
    const cleanedText = session.passage.replace(/\.([A-Z])/g, '. $1');
    
    // 2. Split by double newline or single newline, but prioritize double if available
    // We try to normalize newlines first.
    const normalizedText = cleanedText.replace(/\r\n/g, '\n');
    
    // Split by at least one newline, but filter empty ones
    return normalizedText
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);
  }, [session.passage]);

  const handleOptionSelect = (questionId: number, optionIndex: number) => {
    if (showResults) return; // Prevent changing after submission
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmit = () => {
    let newScore = 0;
    session.questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswerIndex) {
        newScore++;
      }
    });
    setScore(newScore);
    setShowResults(true);
    
    // Smooth scroll to top of questions to see results
    const questionsPanel = document.getElementById('questions-panel');
    if (questionsPanel) {
      questionsPanel.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const progress = Math.round((Object.keys(selectedAnswers).length / session.questions.length) * 100);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-50">
      {/* Toolbar */}
      <div className="flex-none bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
            title="Back to menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h2 className="font-bold text-slate-800 text-sm md:text-base line-clamp-1">{session.title}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">{session.difficulty}</span>
              <span>•</span>
              <span>{session.avgTime} read</span>
            </div>
          </div>
        </div>
        
        {/* Progress Bar (Visible only when not done) */}
        {!showResults && (
           <div className="hidden md:flex flex-col items-end w-48">
             <div className="flex justify-between w-full text-xs mb-1 text-slate-500">
               <span>Progress</span>
               <span>{Object.keys(selectedAnswers).length}/{session.questions.length}</span>
             </div>
             <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
               <div 
                  className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
               />
             </div>
           </div>
        )}
      </div>

      {/* Main Content: Split View */}
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Left Pane: Passage */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-14 bg-white border-r border-slate-200 scroll-smooth">
          <div className="max-w-2xl mx-auto">
             <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-8 leading-tight">
               {session.title}
             </h1>
             <div className="prose prose-slate prose-lg text-slate-700 font-serif leading-loose">
                {formattedPassage.map((para, i) => (
                  <p key={i} className="mb-6 indent-8 text-justify">
                    {para}
                  </p>
                ))}
             </div>
             <div className="mt-12 pt-8 border-t border-slate-100 text-center text-slate-400 italic text-sm">
               End of Passage
             </div>
          </div>
        </div>

        {/* Right Pane: Questions */}
        <div id="questions-panel" className="flex-1 md:w-[45%] lg:w-[40%] overflow-y-auto bg-slate-50 p-6 md:p-8">
          <div className="max-w-xl mx-auto space-y-8">
            {showResults && (
              <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-slate-200 animate-fade-in">
                <div className="text-center">
                  <span className="text-sm font-bold uppercase tracking-wider text-slate-500">Session Score</span>
                  <div className="text-4xl font-bold text-slate-900 mt-2 mb-1">
                    {score} <span className="text-xl text-slate-400">/ {session.questions.length}</span>
                  </div>
                  <p className="text-slate-600 mb-6">
                    {score === session.questions.length ? "Perfect score! Outstanding reading comprehension." : 
                     score >= session.questions.length / 2 ? "Good job! Review the explanations to improve." : 
                     "Keep practicing. Analyze the logic behind the correct answers."}
                  </p>
                  <Button onClick={onRetry} variant="primary" className="w-full">
                    Start New Practice
                  </Button>
                </div>
              </div>
            )}

            {session.questions.map((q, qIdx) => {
              const isCorrect = selectedAnswers[q.id] === q.correctAnswerIndex;
              const isSelected = selectedAnswers[q.id] !== undefined;
              
              return (
                <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="flex-none bg-indigo-50 text-indigo-700 font-bold text-sm w-6 h-6 rounded flex items-center justify-center mt-0.5">
                      {qIdx + 1}
                    </span>
                    <h3 className="text-slate-900 font-medium leading-relaxed">
                      {q.text}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {q.options.map((option, oIdx) => {
                      let btnClass = "w-full text-left p-3 rounded-lg border text-sm transition-all duration-200 relative ";
                      
                      if (showResults) {
                        if (oIdx === q.correctAnswerIndex) {
                          btnClass += "bg-emerald-50 border-emerald-500 text-emerald-800 font-medium"; // Correct answer
                        } else if (selectedAnswers[q.id] === oIdx) {
                          btnClass += "bg-red-50 border-red-500 text-red-800"; // Wrong selection
                        } else {
                          btnClass += "bg-slate-50 border-slate-100 text-slate-400 opacity-60"; // Other
                        }
                      } else {
                        if (selectedAnswers[q.id] === oIdx) {
                          btnClass += "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm ring-1 ring-indigo-500";
                        } else {
                          btnClass += "bg-white border-slate-200 hover:bg-slate-50 hover:border-indigo-300 text-slate-600";
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleOptionSelect(q.id, oIdx)}
                          disabled={showResults}
                          className={btnClass}
                        >
                          <div className="flex items-start">
                            <span className="mr-3 font-semibold opacity-50 min-w-[1.2rem]">{String.fromCharCode(65 + oIdx)}.</span>
                            <span>{option}</span>
                          </div>
                          {showResults && oIdx === q.correctAnswerIndex && (
                            <svg className="w-5 h-5 text-emerald-600 absolute right-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                           {showResults && selectedAnswers[q.id] === oIdx && oIdx !== q.correctAnswerIndex && (
                            <svg className="w-5 h-5 text-red-500 absolute right-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {showResults && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-start gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                        <svg className="w-5 h-5 text-indigo-500 flex-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <span className="font-semibold text-slate-900 block mb-1">Explanation</span>
                          {q.explanation}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {!showResults && (
              <div className="pt-4 pb-12">
                <Button 
                  onClick={handleSubmit} 
                  className="w-full py-3 text-lg"
                  disabled={Object.keys(selectedAnswers).length < session.questions.length}
                >
                  {Object.keys(selectedAnswers).length < session.questions.length 
                    ? `Answer all questions to submit (${Object.keys(selectedAnswers).length}/${session.questions.length})` 
                    : "Submit Answers"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingView;