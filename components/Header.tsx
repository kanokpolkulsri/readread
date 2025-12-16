import React from 'react';

interface HeaderProps {
  onHomeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHomeClick }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={onHomeClick}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-2">
              <span className="text-white font-serif font-bold text-xl">L</span>
            </div>
            <span className="font-serif text-2xl font-bold text-slate-800 tracking-tight">Lexicon</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8">
            <button onClick={onHomeClick} className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Library</button>
            <button className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Progress</button>
            <button className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Resources</button>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <button className="text-slate-600 hover:text-slate-900 font-medium hidden sm:block">Log in</button>
            <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">
              Sign up free
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
