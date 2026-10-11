import React from 'react';
import { Camera, Sun, Moon, ShieldCheck, LogIn, LogOut } from 'lucide-react';
import { UserProfile, TabType } from '../types';

interface NavbarProps {
  currentUser: UserProfile | null;
  isAdmin: boolean;
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  isAdmin,
  onSelectTab,
  isDark,
  onToggleTheme,
  onOpenAuth,
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-indigo-400 dark:to-violet-300 bg-clip-text text-transparent">
              PhotoNest
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium -mt-1 hidden sm:block">
              Your photos. Your story.
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin badge if authorized */}
          {isAdmin && (
            <button
              onClick={() => onSelectTab('admin')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
              title="Admin Dashboard"
            >
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span className="hidden md:inline">Admin</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* User or Auth Button */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectTab('profile')}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <img
                  src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser.username}`}
                  alt={currentUser.displayName}
                  className="w-8 h-8 rounded-full object-cover border border-indigo-500/30"
                />
                <span className="text-xs font-semibold hidden md:inline truncate max-w-[120px]">
                  @{currentUser.username}
                </span>
              </button>
              <button
                onClick={onLogout}
                aria-label="Log out"
                title="Log out"
                className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-sm shadow-indigo-600/30 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
