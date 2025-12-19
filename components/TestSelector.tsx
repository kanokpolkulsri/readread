
import React from 'react';
import { TestType, Difficulty, TopicProgress } from '../types';

interface TestSelectorProps {
  onSelect: (type: TestType) => void;
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  progress: Record<string, TopicProgress>;
}

const BOOKSHELF = [
  { 
    type: TestType.QUICK_READ, 
    title: 'Quick Read', 
    subtitle: 'Random Topic',
    description: '150-200 words. Learn something new in minutes.',
    icon: (
      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  { 
    type: TestType.ENTERTAINMENT, 
    title: 'Fiction & Drama', 
    subtitle: 'Love, Notoriety & Sadness',
    description: '200-250 words. Stories of heartbreak, infamy, and melancholic moments.',
    icon: (
      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  { 
    type: TestType.BUSINESS, 
    title: 'Business', 
    subtitle: 'Case Studies',
    description: '250-300 words. Harvard Business Case style analysis.',
    icon: (
      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
      </svg>
    )
  },
];

const TestSelector: React.FC<TestSelectorProps> = ({ onSelect, difficulty, onDifficultyChange, progress }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 mb-4 md:mb-6">Choose Your Reading</h1>
        <p className="text-slate-500 max-w-xl mx-auto text-sm md:text-lg leading-relaxed mb-8">Select a topic. If the library is empty, AI will generate a new passage for you.</p>
        
        {/* Difficulty Toggle */}
        <div className="inline-flex bg-slate-100 p-1.5 rounded-xl shadow-inner">
          <button
            onClick={() => onDifficultyChange(Difficulty.STANDARD)}
            className={`px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-all duration-200 ${
              difficulty === Difficulty.STANDARD
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => onDifficultyChange(Difficulty.CHALLENGE)}
            className={`px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-all duration-200 ${
              difficulty === Difficulty.CHALLENGE
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Challenge <span className="text-xs opacity-75 hidden sm:inline">(GRE)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
        {BOOKSHELF.map((book) => {
          const prog = progress[`${book.type}-${difficulty}`] || { total: 0, completed: 0 };
          const isEmpty = prog.total === 0;
          
          return (
            <button
              key={book.type}
              onClick={() => onSelect(book.type)}
              className="group relative p-5 md:p-8 rounded-xl md:rounded-2xl bg-white border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-left flex flex-col h-full overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4 md:mb-6">
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  {book.icon}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {!isEmpty && (
                    <div className="text-[10px] font-bold text-indigo-500 tracking-tighter uppercase">
                      {prog.completed}/{prog.total} Tests
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-grow">
                <h3 className="text-lg md:text-xl font-bold mb-1 text-slate-900">
                  {book.title}
                </h3>
                <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2 md:mb-3">
                  {book.subtitle}
                </div>
                <p className="text-sm md:text-base text-slate-500 leading-relaxed mb-4">
                  {book.description}
                </p>

                {!isEmpty && (
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-500" 
                      style={{ width: `${(prog.completed / prog.total) * 100}%` }}
                    />
                  </div>
                )}
              </div>
              
              <div className="mt-4 md:mt-8 pt-4 md:pt-6 border-t border-slate-100 flex items-center text-indigo-600 font-medium text-sm md:text-base group-hover:text-indigo-700">
                <span>Start Reading</span>
                <svg className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TestSelector;
