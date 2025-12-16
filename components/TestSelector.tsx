import React from 'react';
import { TestType, DifficultyLevel } from '../types';

interface TestSelectorProps {
  onSelect: (type: TestType) => void;
  selectedLevel: DifficultyLevel;
  onLevelChange: (level: DifficultyLevel) => void;
}

const BOOKSHELF = [
  { 
    type: TestType.ACADEMIC, 
    title: 'The Study Hall', 
    subtitle: 'Academic & Test Prep',
    desc: 'Rigorous practice for GRE, GMAT, LSAT. Dense logic and argumentation.', 
    accent: 'bg-indigo-50 text-indigo-600',
    icon: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z'
  },
  { 
    type: TestType.LITERATURE, 
    title: 'The Library', 
    subtitle: 'Literature & Drama',
    desc: 'Classic novels, prose, and poetry. Focus on narrative, emotion, and imagery.', 
    accent: 'bg-amber-50 text-amber-700',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
  },
  { 
    type: TestType.BUSINESS, 
    title: 'The Boardroom', 
    subtitle: 'Business & Economy',
    desc: 'Market trends, leadership, finance, and corporate strategy. Wall Street Journal style.', 
    accent: 'bg-slate-100 text-slate-700',
    icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
  },
  { 
    type: TestType.SCIENCE, 
    title: 'The Laboratory', 
    subtitle: 'Science & Nature',
    desc: 'Biology, physics, environment, and psychology. Factual and explanatory texts.', 
    accent: 'bg-emerald-50 text-emerald-600',
    icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
  },
  { 
    type: TestType.TECHNOLOGY, 
    title: 'The Future', 
    subtitle: 'Technology & AI',
    desc: 'AI, cybernetics, coding, and digital culture. Wired Magazine style.', 
    accent: 'bg-cyan-50 text-cyan-600',
    icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
  },
  { 
    type: TestType.HORROR, 
    title: 'Dark Corner', 
    subtitle: 'Mystery & Horror',
    desc: 'Spine-chilling tales, suspense, thrillers, and gothic horror. Atmospheric and intense.', 
    accent: 'bg-purple-50 text-purple-600',
    icon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
  },
  { 
    type: TestType.HISTORY, 
    title: 'The Archives', 
    subtitle: 'History & Society',
    desc: 'Historical events, biographies, sociology, and ancient civilizations.', 
    accent: 'bg-stone-100 text-stone-600',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  { 
    type: TestType.COMEDY, 
    title: 'The Lounge', 
    subtitle: 'Comedy & Casual',
    desc: 'Satire, humorous essays, stand-up routines, and light-hearted modern blogs.', 
    accent: 'bg-pink-50 text-pink-600',
    icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  },
];

const TestSelector: React.FC<TestSelectorProps> = ({ onSelect, selectedLevel, onLevelChange }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4">Browse the Bookstore</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
          Walk through our aisles and pick a genre. We'll generate a unique reading experience for you.
        </p>

        {/* Difficulty Selector */}
        <div className="inline-flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
          {Object.values(DifficultyLevel).map((level) => (
            <button
              key={level}
              onClick={() => onLevelChange(level)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedLevel === level
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {BOOKSHELF.map((book) => (
          <button
            key={book.type}
            onClick={() => onSelect(book.type)}
            className="group relative p-6 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left flex flex-col h-full"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 rounded-lg ${book.accent}`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={book.icon} />
                </svg>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded">
                {selectedLevel}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
              {book.title}
            </h3>
            <div className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">
              {book.subtitle}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed flex-grow">
              {book.desc}
            </p>
            
            <div className="mt-6 flex items-center text-indigo-600 font-medium text-sm">
              Open Book
              <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </button>
        ))}
      </div>
      
      {/* Subtle decorative background - keeping it very minimal this time */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/40 via-white to-white pointer-events-none" />
    </div>
  );
};

export default TestSelector;