import React from 'react';
import { TestType } from '../types';

interface TestSelectorProps {
  onSelect: (type: TestType) => void;
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
    subtitle: 'Stories & Gossip',
    description: '200-250 words. Narratives, dialogue, and drama.',
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

const TestSelector: React.FC<TestSelectorProps> = ({ onSelect }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-12">
      <div className="text-center mb-8 md:mb-16">
        <h1 className="text-2xl md:text-4xl font-serif font-bold text-slate-900 mb-3 md:mb-6">Choose Your Reading</h1>
        <p className="text-slate-500 max-w-lg mx-auto text-xs md:text-base">Select a topic to generate a unique reading session powered by AI.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
        {BOOKSHELF.map((book) => (
          <button
            key={book.type}
            onClick={() => onSelect(book.type)}
            className="group relative p-4 md:p-8 rounded-xl md:rounded-2xl bg-white border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-left flex flex-col h-full overflow-hidden"
          >
            <div className="flex items-start justify-between mb-3 md:mb-6">
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                {book.icon}
              </div>
            </div>
            
            <div className="flex-grow">
              <h3 className="text-base md:text-xl font-bold mb-0.5 md:mb-1 text-slate-900">
                {book.title}
              </h3>
              <div className="text-[10px] md:text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1.5 md:mb-3">
                {book.subtitle}
              </div>
              <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                {book.description}
              </p>
            </div>
            
            <div className="mt-3 md:mt-8 pt-3 md:pt-6 border-t border-slate-100 flex items-center text-indigo-600 font-medium text-xs md:text-sm group-hover:text-indigo-700">
              <span>Start Reading</span>
              <svg className="w-3 h-3 md:w-4 md:h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TestSelector;