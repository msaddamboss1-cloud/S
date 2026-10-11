import React from 'react';
import { 
  Home, 
  Compass, 
  PlusSquare, 
  Bell, 
  User, 
  Settings, 
  ShieldCheck, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { TabType, UserProfile } from '../types';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  currentUser: UserProfile | null;
  isAdmin: boolean;
  unreadCount: number;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  isAdmin,
  unreadCount,
  onLogout,
  onOpenAuth
}) => {
  const navItems = [
    { id: 'home' as TabType, label: 'Feed', icon: Home },
    { id: 'explore' as TabType, label: 'Explore', icon: Compass },
    { id: 'create' as TabType, label: 'Create Post', icon: PlusSquare },
    { id: 'notifications' as TabType, label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    ...(isAdmin ? [{ id: 'admin' as TabType, label: 'Admin Panel', icon: ShieldCheck, highlight: true }] : []),
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 sticky top-20 h-[calc(100vh-5rem)] p-4 justify-between">
      <div className="space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (!currentUser && (item.id === 'create' || item.id === 'notifications' || item.id === 'profile')) {
                  onOpenAuth();
                  return;
                }
                onSelectTab(item.id);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-medium text-sm transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold'
                  : item.highlight
                  ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : item.highlight ? 'text-amber-500' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}

        {/* Quick Create Callout */}
        <div className="pt-4">
          <button
            onClick={() => {
              if (!currentUser) onOpenAuth();
              else onSelectTab('create');
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Share a Photo</span>
          </button>
        </div>
      </div>

      {/* Bottom Profile card or login */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        {currentUser ? (
          <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
            <div 
              onClick={() => onSelectTab('profile')}
              className="flex items-center gap-3 cursor-pointer overflow-hidden"
            >
              <img
                src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser.username}`}
                alt={currentUser.displayName}
                className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-300 dark:border-slate-700"
              />
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {currentUser.displayName}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  @{currentUser.username}
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Sign In / Register
          </button>
        )}
      </div>
    </aside>
  );
};
