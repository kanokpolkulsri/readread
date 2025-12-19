
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ReadingSession } from '../types';
import Button from './Button';
import { db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface ReadingViewProps {
  session: ReadingSession;
  userSessionId: string | null;
  onBack: () => void;
  onNext: () => void;
  onComplete?: () => void;
  isReviewMode?: boolean;
  initialAnswers?: Record<number, number>;
}

const ReadingView: React.FC<ReadingViewProps> = ({ 
  session, 
  userSessionId, 
  onBack, 
  onNext, 
  onComplete,
  isReviewMode = false,
  initialAnswers = {}
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>(initialAnswers);
  const [showResults, setShowResults] = useState(isReviewMode);
  const [score, setScore] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const [splitRatio, setSplitRatio] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768 ? 0.5 : 0.75;
    }
    return 0.5;
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const isQuickRead = session.questions.length === 0;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (isReviewMode && !isQuickRead) {
      let calcScore = 0;
      session.questions.forEach(q => {
        if (initialAnswers[q.id] === q.correctAnswerIndex) {
          calcScore++;
        }
      });
      setScore(calcScore);
    }
  }, [isReviewMode, session.questions, initialAnswers, isQuickRead]);

  const formattedPassage = useMemo(() => {
    if (!session.passage) return [];
    return session.passage
      .replace(/\\n/g, '\n')
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);
  }, [session.passage]);

  const handleOptionSelect = (questionId: number, optionIndex: number) => {
    if (showResults || isReviewMode) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleQuickReadComplete = async () => {
    setShowResults(true);
    if (userSessionId) {
      try {
        const sessionRef = doc(db, 'userSessions', userSessionId);
        await updateDoc(sessionRef, {
          status: 'completed',
          score: 0,
          totalQuestions: 0,
          userAnswers: {}
        });
      } catch (err) {
        console.error("Error updating user session in Firestore:", err);
      }
    }
    if (onComplete) onComplete();
  };

  const handleSubmit = async () => {
    let newScore = 0;
    session.questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswerIndex) {
        newScore++;
      }
    });
    setScore(newScore);
    setShowResults(true);
    
    if (userSessionId) {
      try {
        const sessionRef = doc(db, 'userSessions', userSessionId);
        await updateDoc(sessionRef, {
          status: 'completed',
          score: newScore,
          totalQuestions: session.questions.length,
          userAnswers: selectedAnswers
        });
      } catch (err) {
        console.error("Error updating user session in Firestore:", err);
      }
    }

    if (onComplete) {
      onComplete();
    }

    setTimeout(() => {
      const resultsEl = document.getElementById('session-results');
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    isDraggingRef.current = true;
    const isDesktop = window.innerWidth >= 768;
    document.body.style.cursor = isDesktop ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
    
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchend', handleDragEnd);
  };

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    
    const isDesktop = window.innerWidth >= 768;
    if (e.type === 'touchmove') e.preventDefault(); 

    const containerRect = containerRef.current.getBoundingClientRect();
    let newRatio;
    
    if (isDesktop) {
        const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
        const relativeX = clientX - containerRect.left;
        newRatio = relativeX / containerRect.width;
    } else {
        const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
        const relativeY = clientY - containerRect.top;
        newRatio = relativeY / containerRect.height;
    }
    
    const clampedRatio = Math.min(Math.max(newRatio, 0.2), 0.85);
    setSplitRatio(clampedRatio);
  }, []);

  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchend', handleDragEnd);
  }, [handleDragMove]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-50">
      {/* Header Bar */}
      <div className="flex-none bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between shadow-sm z-10">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="hidden sm:inline font-medium">{isReviewMode ? 'Finish Review' : 'Exit'}</span>
        </button>
        <div className="text-center px-4 overflow-hidden">
          <h2 className="font-bold text-slate-800 text-sm truncate max-w-xs sm:max-w-md">
            {isReviewMode && <span className="text-indigo-600 mr-2 uppercase text-[10px] tracking-widest border border-indigo-200 px-1.5 py-0.5 rounded">Review Mode</span>}
            {session.title}
          </h2>
        </div>
        <div className="text-slate-400 text-xs font-medium tabular-nums whitespace-nowrap">
          {session.avgTime} read
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex-grow flex flex-col md:flex-row overflow-hidden relative"
      >
        <div 
          className="overflow-y-auto bg-white"
          style={{ 
            flexBasis: `${splitRatio * 100}%`,
            flexGrow: 0,
            flexShrink: 0
          }}
        >
          <div className="max-w-2xl mx-auto p-6 md:p-12 lg:p-16">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-8 leading-tight">
              {session.title}
            </h1>
            <div className="text-slate-700 font-serif leading-loose text-base">
              {formattedPassage.map((para, i) => (
                <p key={i} className="mb-6 indent-8 text-justify">
                  {para}
                </p>
              ))}
            </div>
            <div className="mt-12 pt-8 border-t border-slate-100 text-center text-slate-300 italic text-sm">
              End of Text
            </div>
          </div>
        </div>

        <div 
          className="flex-none bg-slate-200 border-slate-300 flex items-center justify-center z-20 hover:bg-indigo-300 transition-colors touch-none
                     md:w-2 md:h-full md:cursor-col-resize md:border-x
                     w-full h-4 cursor-row-resize border-y"
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <div className="bg-slate-400 rounded-full md:w-0.5 md:h-6 w-6 h-0.5" />
        </div>

        <div id="questions-panel" className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">
          <div className="max-w-xl mx-auto space-y-8 pb-12">
            {isQuickRead ? (
              <div className="space-y-6">
                {/* Summary AFTER Actions */}
                <div className="bg-indigo-50 p-8 rounded-2xl border border-indigo-100 shadow-sm">
                  <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Summary
                  </h3>
                  <p className="text-indigo-800 leading-relaxed text-justify text-base">
                    {session.summary}
                  </p>
                </div>
                {/* Actions AFTER Summary */}
                {!showResults ? (
                  <div className="pt-2">
                    <Button 
                      onClick={handleQuickReadComplete} 
                      className="w-full py-4 text-lg shadow-lg font-bold"
                      variant="primary"
                    >
                      Complete
                    </Button>
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">Session Completed</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={onNext}
                          className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Read Another
                        </button>
                        <button 
                          onClick={onBack}
                          className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          Menu
                        </button>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Great Job!</h3>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {session.questions.map((q, qIdx) => (
                    <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <div className="flex items-start gap-3 mb-4">
                        <span className="flex-none bg-slate-100 text-slate-500 font-bold text-xs w-6 h-6 rounded flex items-center justify-center mt-1">
                          {qIdx + 1}
                        </span>
                        <h4 className="text-slate-900 font-medium leading-relaxed text-base">
                          {q.text}
                        </h4>
                      </div>

                      <div className="space-y-2">
                        {q.options.map((option, oIdx) => {
                          let btnClass = "w-full text-left p-3 rounded-lg border transition-all duration-200 text-base ";
                          
                          if (showResults) {
                            if (oIdx === q.correctAnswerIndex) {
                              btnClass += "bg-emerald-50 border-emerald-500 text-emerald-800 font-medium";
                            } else if (selectedAnswers[q.id] === oIdx) {
                              btnClass += "bg-red-50 border-red-500 text-red-800";
                            } else {
                              btnClass += "bg-slate-50 border-slate-100 text-slate-400 opacity-60";
                            }
                          } else {
                            if (selectedAnswers[q.id] === oIdx) {
                              btnClass += "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm";
                            } else {
                              btnClass += "bg-white border-slate-200 hover:bg-slate-50 hover:border-indigo-200 text-slate-600";
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleOptionSelect(q.id, oIdx)}
                              disabled={showResults || isReviewMode}
                              className={btnClass}
                            >
                              <span className="inline-block w-6 font-bold opacity-30">{String.fromCharCode(65 + oIdx)}</span>
                              {option}
                            </button>
                          );
                        })}
                      </div>

                      {showResults && (
                        <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-500 italic bg-slate-50 p-3 rounded-lg">
                          <span className="font-bold text-slate-800 not-italic block mb-1">Explanation:</span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!showResults ? (
                  <div className="pt-4">
                    <Button 
                      onClick={handleSubmit} 
                      className="w-full py-4 text-lg shadow-lg"
                      disabled={Object.keys(selectedAnswers).length < session.questions.length}
                    >
                      {Object.keys(selectedAnswers).length < session.questions.length 
                        ? `Answer All Questions (${Object.keys(selectedAnswers).length}/${session.questions.length})` 
                        : "Submit Final Answers"}
                    </Button>
                  </div>
                ) : (
                  <div id="session-results" className="bg-white p-8 rounded-2xl shadow-md border-2 border-indigo-500 animate-fade-in text-center mt-8">
                    <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">{isReviewMode ? 'Reviewing Results' : 'Session Completed'}</span>
                    <div className="text-5xl font-bold text-slate-900 mt-2 mb-6">
                      {score} <span className="text-2xl text-slate-400">/ {session.questions.length}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {!isReviewMode && <Button onClick={onNext} className="w-full">Read Another</Button>}
                      <Button onClick={onBack} variant="outline" className="w-full bg-white">{isReviewMode ? 'Back to Selection' : 'Menu'}</Button>
                    </div>
                    {!isReviewMode && (
                      <button 
                        onClick={() => setShowResults(false)} 
                        className="mt-4 text-sm text-slate-400 hover:text-indigo-600 font-medium transition-colors"
                      >
                        Review My Answers
                      </button>
                    )}
                  </div>
                )}

                <div className="pt-8 border-t border-slate-200">
                  <button 
                    onClick={() => setShowSummary(!showSummary)}
                    className="text-indigo-600 font-bold text-sm flex items-center hover:text-indigo-700 uppercase tracking-wider"
                  >
                    <svg className={`w-4 h-4 mr-2 transition-transform ${showSummary ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    {showSummary ? 'Hide Context Summary' : 'Show Context Summary'}
                  </button>
                  {showSummary && (
                    <div className="mt-4 p-6 bg-white rounded-xl border border-slate-200 text-slate-600 text-base leading-relaxed shadow-sm animate-fade-in">
                      {session.summary}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingView;
