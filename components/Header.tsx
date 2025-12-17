import React from 'react';

interface HeaderProps {
  onHomeClick: () => void;
  onAdminClick: () => void;
  currentView: 'home' | 'reading' | 'admin';
}

const Header: React.FC<HeaderProps> = ({ onHomeClick, onAdminClick, currentView }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center cursor-pointer group" onClick={onHomeClick}>
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-md group-hover:bg-indigo-700 transition-colors">
              {/* Book icon for readerline */}
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-serif text-2xl font-bold text-slate-800 tracking-tight">readerline</span>
          </div>

          {/* Desktop Nav */}
          <nav className="flex space-x-8">
            <button 
              onClick={onHomeClick} 
              className={`font-medium transition-colors ${currentView === 'home' || currentView === 'reading' ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
            >
              Library
            </button>
            <button 
              onClick={onAdminClick}
              className={`font-medium transition-colors ${currentView === 'admin' ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
            >
              Admin Dashboard
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;