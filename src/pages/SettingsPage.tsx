import React, { useState } from 'react';
import { 
  Settings, 
  Moon, 
  Sun, 
  Lock, 
  ShieldCheck, 
  Cloud, 
  LogOut, 
  Check, 
  Info,
  Key
} from 'lucide-react';
import { UserProfile } from '../types';
import { resetPassword } from '../services/authService';

interface SettingsPageProps {
  currentUser: UserProfile | null;
  isDark: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
  onOpenAuth: () => void;
  isAdmin: boolean;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  currentUser,
  isDark,
  onToggleTheme,
  onLogout,
  onOpenAuth,
  isAdmin
}) => {
  const [resetSent, setResetSent] = useState<boolean>(false);
  const [resetLoading, setResetLoading] = useState<boolean>(false);

  const handlePasswordReset = async () => {
    if (!currentUser?.email) return;
    try {
      setResetLoading(true);
      await resetPassword(currentUser.email);
      setResetSent(true);
    } catch (err) {
      alert("Password reset error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
          <Settings className="w-4 h-4" />
        </div>
        <h2 className="font-bold text-base text-slate-900 dark:text-slate-100">Settings & Preferences</h2>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Appearance</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDark ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </p>
              <p className="text-[11px] text-slate-400">Adjust the interface theme for high contrast or battery savings</p>
            </div>
          </div>
          <button
            onClick={onToggleTheme}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
          >
            Switch to {isDark ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>

      {/* Security & Account */}
      {currentUser ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Account & Security</h3>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs space-y-1">
            <p className="text-slate-500">Signed in as:</p>
            <p className="font-bold text-slate-900 dark:text-slate-100">{currentUser.displayName} (@{currentUser.username})</p>
            <p className="text-slate-400 font-mono text-[11px]">{currentUser.email}</p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Password Reset</p>
                <p className="text-[11px] text-slate-400">Send password recovery link to your email</p>
              </div>
            </div>
            {resetSent ? (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                <Check className="w-3.5 h-3.5" /> Sent!
              </span>
            ) : (
              <button
                onClick={handlePasswordReset}
                disabled={resetLoading}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
              >
                {resetLoading ? 'Sending...' : 'Reset Password'}
              </button>
            )}
          </div>

          {isAdmin && (
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
              <ShieldCheck className="w-4 h-4 shrink-0 text-amber-500" />
              <span>You have administrative rights configured for this database.</span>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm text-center space-y-3">
          <p className="text-xs text-slate-500">You are currently using PhotoNest as a guest.</p>
          <button
            onClick={onOpenAuth}
            className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20"
          >
            Sign In or Register
          </button>
        </div>
      )}

      {/* Cloud & Hosting Information */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Cloud Infrastructure</h3>
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-start gap-2">
            <Cloud className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <p>
              <strong>ImgBB Integration:</strong> Uploads are delivered to the ImgBB REST API. Images are hosted at high resolution and distributed globally.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Key className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p>
              <strong>Firebase Realtime Database:</strong> Real-time subscriptions power instant likes, comments, and notifications with zero refresh latency.
            </p>
          </div>
        </div>
      </div>

      {/* Logout */}
      {currentUser && (
        <button
          onClick={onLogout}
          className="w-full py-3 rounded-2xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out from PhotoNest</span>
        </button>
      )}
    </div>
  );
};
