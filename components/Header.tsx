import React from 'react';
import { User } from '../types';

interface HeaderProps {
  onHomeClick: () => void;
  onAdminClick: () => void;
  currentView: 'home' | 'reading' | 'admin';
  user: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHomeClick, onAdminClick, currentView, user, onLoginClick, onLogoutClick }) => {
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
          <nav className="hidden md:flex space-x-8">
            <button 
              onClick={onHomeClick} 
              className={`font-medium transition-colors ${currentView === 'home' || currentView === 'reading' ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
            >
              Library
            </button>
            <button className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">My Progress</button>
            <button 
              onClick={onAdminClick}
              className={`font-medium transition-colors ${currentView === 'admin' ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
            >
              Admin Dashboard
            </button>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                  <div className="text-xs text-slate-500">Free Account</div>
                </div>
                <button 
                  onClick={onLogoutClick}
                  className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 overflow-hidden hover:ring-2 hover:ring-indigo-400 transition-all"
                  title="Sign out"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-indigo-700 font-bold">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </button>
              </div>
            ) : (
              <button 
                onClick={onLoginClick}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2"
              >
                Log in
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;