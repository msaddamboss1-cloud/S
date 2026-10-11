import React from 'react';
import { Home, Compass, PlusCircle, Bell, User } from 'lucide-react';
import { TabType, UserProfile } from '../types';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  currentUser: UserProfile | null;
  unreadCount: number;
  onOpenAuth: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  unreadCount,
  onOpenAuth
}) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Feed', icon: Home },
    { id: 'explore' as TabType, label: 'Explore', icon: Compass },
    { id: 'create' as TabType, label: 'Post', icon: PlusCircle, isPrimary: true },
    { id: 'notifications' as TabType, label: 'Alerts', icon: Bell, badge: unreadCount },
    { id: 'profile' as TabType, label: 'Profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (!currentUser && (tab.id === 'create' || tab.id === 'notifications' || tab.id === 'profile')) {
                  onOpenAuth();
                  return;
                }
                onSelectTab(tab.id);
              }}
              className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all ${
                tab.isPrimary
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                {tab.isPrimary ? (
                  <div className="w-10 h-10 -mt-2 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-full flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                    <Icon className="w-6 h-6" />
                  </div>
                ) : (
                  <Icon className="w-5 h-5" />
                )}
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              {!tab.isPrimary && (
                <span className="text-[10px] mt-1">{tab.label}</span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
