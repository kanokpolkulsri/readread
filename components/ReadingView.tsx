import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ReadingSession } from '../types';
import Button from './Button';

interface ReadingViewProps {
  session: ReadingSession;
  onBack: () => void;
  onNext: () => void;
  onComplete?: () => void;
}

const ReadingView: React.FC<ReadingViewProps> = ({ session, onBack, onNext, onComplete }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  // Split pane state
  const [splitRatio, setSplitRatio] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768 ? 0.5 : 0.75;
    }
    return 0.5;
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const isQuickRead = session.questions.length === 0;

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Text cleaning and paragraph splitting logic
  const formattedPassage = useMemo(() => {
    if (!session.passage) return [];
    const cleanedText = session.passage.replace(/\.([A-Z])/g, '. $1');
    const normalizedText = cleanedText.replace(/\r\n/g, '\n');
    return normalizedText
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);
  }, [session.passage]);

  const handleOptionSelect = (questionId: number, optionIndex: number) => {
    if (showResults) return;
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
    
    // Notify parent that session is complete (to clear cache if needed)
    if (onComplete) {
      onComplete();
    }

    const questionsPanel = document.getElementById('questions-panel');
    if (questionsPanel) {
      questionsPanel.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Drag Handlers
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
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
        const relativeX = clientX - containerRect.left;
        newRatio = relativeX / containerRect.width;
    } else {
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
        const relativeY = clientY - containerRect.top;
        newRatio = relativeY / containerRect.height;
    }
    
    const clampedRatio = Math.min(Math.max(newRatio, 0.2), 0.9);
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

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [handleDragMove, handleDragEnd]);


  const progress = isQuickRead ? 100 : Math.round((Object.keys(selectedAnswers).length / session.questions.length) * 100);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 relative">
      {/* Toolbar */}
      <div className="flex-none bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm z-10 gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors flex-shrink-0"
            title="Back to menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="min-w-0">
            <h2 className="font-bold text-slate-800 text-sm md:text-base truncate">{session.title}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="hidden md:inline bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                {isQuickRead ? 'Short' : session.questions.length > 2 ? 'Long' : 'Standard'}
              </span>
              <span className="hidden md:inline">•</span>
              <span>{session.avgTime} read</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          {/* Progress Bar (Visible only when taking quiz on desktop) */}
          {!showResults && !isQuickRead && (
             <div className="hidden lg:flex flex-col items-end w-32">
               <div className="flex justify-between w-full text-[10px] mb-1 text-slate-500">
                 <span>Progress</span>
                 <span>{Object.keys(selectedAnswers).length}/{session.questions.length}</span>
               </div>
               <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                 <div 
                    className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                 />
               </div>
             </div>
          )}
        </div>
      </div>

      {/* Main Content: Split View */}
      <div 
        ref={containerRef}
        className="flex-grow flex flex-col md:flex-row overflow-hidden relative"
      >
        
        {/* Left Pane: Passage */}
        <div 
          className="overflow-y-auto bg-white scroll-smooth"
          style={{ 
            flexBasis: `${splitRatio * 100}%`,
            flexGrow: 0,
            flexShrink: 0
          }}
        >
          <div className="max-w-2xl mx-auto p-6 md:p-10 lg:p-14 transition-all duration-200">
             <h1 className="text-3xl font-serif font-bold text-slate-900 mb-8 leading-tight">
               {session.title}
             </h1>
             <div className="prose prose-lg prose-slate max-w-none text-slate-700 font-serif leading-loose">
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

        {/* Drag Handle */}
        <div 
          className="flex-none bg-slate-100 border-slate-200 flex items-center justify-center z-20 hover:bg-indigo-50 active:bg-indigo-100 transition-colors touch-none
                     md:w-3 md:h-full md:cursor-col-resize md:border-x
                     w-full h-6 cursor-row-resize border-y"
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          {/* Handle visual */}
          <div className="bg-slate-300 rounded-full
                          md:w-1 md:h-8
                          w-8 h-1" 
          />
        </div>

        {/* Right Pane: Questions & Summary */}
        <div 
            id="questions-panel" 
            className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 min-h-0 min-w-0"
        >
          <div className="max-w-xl mx-auto space-y-8 pb-20 md:pb-0">
            
            {/* Quick Read Mode: Show Summary Directly */}
            {isQuickRead && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Summary
                  </h3>
                  <div className="text-slate-700 leading-relaxed text-justify">
                    {session.summary || "Summary not available."}
                  </div>
                </div>

                <div className="flex gap-3 text-base">
                  <Button onClick={onNext} variant="primary" className="flex-1">
                    Read Another
                  </Button>
                  <Button onClick={onBack} variant="outline" className="flex-1">
                    Menu
                  </Button>
                </div>
              </div>
            )}

            {/* Standard Mode: Questions & Collapsible Summary */}
            {!isQuickRead && (
              <>
                {showResults && (
                  <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-slate-200 animate-fade-in">
                    <div className="text-center">
                      <span className="text-sm font-bold uppercase tracking-wider text-slate-500">Session Score</span>
                      <div className="text-4xl font-bold text-slate-900 mt-2 mb-1">
                        {score} <span className="text-xl text-slate-400">/ {session.questions.length}</span>
                      </div>
                      <p className="text-slate-600 mb-6">
                        {score === session.questions.length ? "Perfect score!" : 
                        score >= session.questions.length / 2 ? "Good job!" : 
                        "Keep practicing."}
                      </p>
                      <Button onClick={onNext} variant="primary" className="w-full">
                        Read More
                      </Button>
                    </div>
                  </div>
                )}

                {session.questions.map((q, qIdx) => {
                  return (
                    <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <div className="flex items-start gap-3 mb-4">
                        <span className="flex-none bg-slate-100 text-slate-700 font-bold text-sm w-6 h-6 rounded flex items-center justify-center mt-0.5">
                          {qIdx + 1}
                        </span>
                        <h3 className="text-slate-900 font-medium leading-relaxed">
                          {q.text}
                        </h3>
                      </div>

                      <div className="space-y-3">
                        {q.options.map((option, oIdx) => {
                          let btnClass = "w-full text-left p-3 rounded-lg border transition-all duration-200 relative ";
                          
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
                            </button>
                          );
                        })}
                      </div>

                      {showResults && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          <div className="flex items-start gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                            <span className="font-semibold text-slate-900 block mb-1">Explanation:</span>
                            {q.explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {!showResults && (
                  <div className="pt-4 pb-4">
                    <Button 
                      onClick={handleSubmit} 
                      className="w-full py-3 text-lg"
                      disabled={Object.keys(selectedAnswers).length < session.questions.length}
                    >
                      {Object.keys(selectedAnswers).length < session.questions.length 
                        ? `Submit (${Object.keys(selectedAnswers).length}/${session.questions.length})` 
                        : "Submit Answers"}
                    </Button>
                  </div>
                )}

                {/* Collapsible Summary for Standard Modes */}
                <div className="border-t border-slate-200 pt-6 mt-8">
                  <button 
                    onClick={() => setShowSummary(!showSummary)}
                    className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 shadow-sm hover:border-indigo-300 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="text-left">
                         <span className="block font-semibold text-slate-800">Passage Summary</span>
                         <span className="text-xs text-slate-500">Check your understanding</span>
                      </div>
                    </div>
                    <div className={`p-1 rounded-full text-slate-400 transition-transform duration-200 ${showSummary ? 'rotate-180 bg-slate-100' : ''}`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  
                  {showSummary && (
                    <div className="mt-3 p-5 bg-white rounded-lg border border-slate-200 text-slate-700 leading-relaxed animate-fade-in text-justify">
                      {session.summary || "Summary not available for this session."}
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