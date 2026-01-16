
import React from 'react';
import { AppView } from '../types';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  unreadCount?: number;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, unreadCount = 0 }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pb-6 pt-2 px-6 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)] z-[200]">
      <div className="flex justify-between items-center max-w-md mx-auto">
        <button 
          onClick={() => onNavigate(AppView.HOME)}
          className={`flex flex-col items-center gap-1 p-2 transition-all active:scale-90 ${currentView === AppView.HOME ? 'text-primary scale-110' : 'text-gray-400'}`}
        >
          <span className={`material-symbols-outlined text-[28px] ${currentView === AppView.HOME ? 'filled' : ''}`}>home</span>
          <span className={`text-[10px] ${currentView === AppView.HOME ? 'font-black' : 'font-bold'}`}>首頁</span>
        </button>
        
        <button 
          onClick={() => onNavigate(AppView.EXPLORE)}
          className={`flex flex-col items-center gap-1 p-2 transition-all active:scale-90 ${currentView === AppView.EXPLORE ? 'text-primary scale-110' : 'text-gray-400'}`}
        >
          <span className={`material-symbols-outlined text-[28px] ${currentView === AppView.EXPLORE ? 'filled' : ''}`}>search</span>
          <span className={`text-[10px] ${currentView === AppView.EXPLORE ? 'font-black' : 'font-bold'}`}>探索</span>
        </button>

        <div className="relative -top-8">
          <button 
            onClick={() => onNavigate(AppView.POST)}
            className={`h-14 w-14 rounded-full shadow-lg flex items-center justify-center transform hover:scale-105 transition-all active:scale-95 ${currentView === AppView.POST ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-text-main text-white shadow-text-main/30'}`}
          >
            <span className="material-symbols-outlined text-[32px]">add</span>
          </button>
        </div>

        <button 
          onClick={() => onNavigate(AppView.FAVORITES)}
          className={`flex flex-col items-center gap-1 p-2 transition-all active:scale-90 ${currentView === AppView.FAVORITES ? 'text-primary scale-110' : 'text-gray-400'}`}
        >
          <span className={`material-symbols-outlined text-[28px] ${currentView === AppView.FAVORITES ? 'filled' : ''}`}>favorite</span>
          <span className={`text-[10px] ${currentView === AppView.FAVORITES ? 'font-black' : 'font-bold'}`}>收藏</span>
        </button>

        <button 
          onClick={() => onNavigate(AppView.PROFILE)}
          className={`flex flex-col items-center gap-1 p-2 transition-all active:scale-90 relative ${currentView === AppView.PROFILE ? 'text-primary scale-110' : 'text-gray-400'}`}
        >
          <span className={`material-symbols-outlined text-[28px] ${currentView === AppView.PROFILE ? 'filled' : ''}`}>person</span>
          <span className={`text-[10px] ${currentView === AppView.PROFILE ? 'font-black' : 'font-bold'}`}>個人</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-2.5 h-3 w-3 bg-red-500 border-2 border-white dark:border-gray-900 rounded-full animate-bounce"></span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Navbar;
