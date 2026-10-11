import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { HomeFeed } from './pages/HomeFeed';
import { ExplorePage } from './pages/ExplorePage';
import { CreatePostPage } from './pages/CreatePostPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthModal } from './pages/AuthModal';
import { CommentModal } from './components/CommentModal';
import { ReportModal } from './components/ReportModal';
import { TabType, Post, UserProfile, NotificationItem } from './types';
import { 
  subscribeToAuthState, 
  logoutUser 
} from './services/authService';
import { 
  getUserProfile, 
  isUserAdmin, 
  listenToPosts, 
  listenToSavedPosts, 
  listenToNotifications 
} from './services/databaseService';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<TabType>('home');

  // Posts & Realtime State
  const [posts, setPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [commentPost, setCommentPost] = useState<Post | null>(null);
  const [reportPost, setReportPost] = useState<Post | null>(null);

  // Theme
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('photonest_theme') === 'dark';
  });

  // Apply dark class to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('photonest_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('photonest_theme', 'light');
    }
  }, [isDark]);

  // Auth subscription
  useEffect(() => {
    const unsub = subscribeToAuthState(async (user) => {
      if (user) {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setCurrentUser(profile);
        } else {
          // Fallback if record is freshly creating
          setCurrentUser({
            uid: user.uid,
            email: user.email || '',
            username: (user.email || 'user').split('@')[0],
            displayName: user.displayName || 'Photo Artist',
            avatarUrl: user.photoURL || undefined,
            createdAt: Date.now()
          });
        }
        // Check admin
        const adminStatus = await isUserAdmin(user.uid);
        setIsAdmin(adminStatus);
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
        setSavedPosts([]);
        setNotifications([]);
      }
    });

    return () => unsub();
  }, []);

  // Realtime posts subscription
  useEffect(() => {
    setLoadingPosts(true);
    const unsub = listenToPosts((data) => {
      setPosts(data);
      setLoadingPosts(false);
    });
    return () => unsub();
  }, []);

  // Saved posts & Notifications subscription when user is logged in
  useEffect(() => {
    if (!currentUser) return;

    const unsubSaved = listenToSavedPosts(currentUser.uid, (saved) => {
      setSavedPosts(saved);
    });

    const unsubNotifs = listenToNotifications(currentUser.uid, (list) => {
      setNotifications(list);
    });

    return () => {
      unsubSaved();
      unsubNotifs();
    };
  }, [currentUser]);

  const handleLogout = async () => {
    await logoutUser();
    setCurrentTab('home');
  };

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        isAdmin={isAdmin}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex pb-20 md:pb-8">
        {/* Left Desktop Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          currentUser={currentUser}
          isAdmin={isAdmin}
          unreadCount={unreadNotifCount}
          onLogout={handleLogout}
          onOpenAuth={() => setAuthModalOpen(true)}
        />

        {/* Center Dynamic Content */}
        <main className="flex-1 min-w-0">
          {currentTab === 'home' && (
            <HomeFeed
              posts={posts}
              loading={loadingPosts}
              currentUser={currentUser}
              isAdmin={isAdmin}
              onOpenComments={(p) => setCommentPost(p)}
              onOpenReport={(p) => setReportPost(p)}
              onOpenAuth={() => setAuthModalOpen(true)}
              onNavigateToCreate={() => {
                if (!currentUser) setAuthModalOpen(true);
                else setCurrentTab('create');
              }}
              onRefresh={() => {
                setLoadingPosts(true);
                setTimeout(() => setLoadingPosts(false), 400);
              }}
            />
          )}

          {currentTab === 'explore' && (
            <ExplorePage
              posts={posts}
              currentUser={currentUser}
              onSelectPost={(p) => setCommentPost(p)}
              onUserClick={() => {}}
            />
          )}

          {currentTab === 'create' && (
            currentUser ? (
              <CreatePostPage
                currentUser={currentUser}
                onPostCreated={() => setCurrentTab('home')}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            ) : (
              <div className="py-20 text-center">
                <p className="text-sm text-slate-500 mb-4">Please sign in to share a photo.</p>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-xs font-bold"
                >
                  Sign In
                </button>
              </div>
            )
          )}

          {currentTab === 'notifications' && (
            currentUser ? (
              <NotificationsPage
                notifications={notifications}
                currentUser={currentUser}
                onSelectPostById={(id) => {
                  const target = posts.find((p) => p.id === id);
                  if (target) setCommentPost(target);
                }}
              />
            ) : (
              <div className="py-20 text-center">
                <p className="text-sm text-slate-500 mb-4">Sign in to view your notifications.</p>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-xs font-bold"
                >
                  Sign In
                </button>
              </div>
            )
          )}

          {currentTab === 'profile' && (
            currentUser ? (
              <ProfilePage
                currentUser={currentUser}
                posts={posts}
                savedPosts={savedPosts}
                onSelectPost={(p) => setCommentPost(p)}
                onProfileUpdated={(updated) => setCurrentUser(updated)}
                onOpenSettings={() => setCurrentTab('settings')}
              />
            ) : (
              <div className="py-20 text-center">
                <p className="text-sm text-slate-500 mb-4">Sign in to view your profile and saved memories.</p>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-xs font-bold"
                >
                  Sign In
                </button>
              </div>
            )
          )}

          {currentTab === 'admin' && (
            currentUser ? (
              <AdminPage
                currentUser={currentUser}
                isAdmin={isAdmin}
                posts={posts}
              />
            ) : (
              <div className="py-20 text-center">
                <p className="text-sm text-slate-500 mb-4">Administrator access requires sign-in.</p>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-xs font-bold"
                >
                  Sign In
                </button>
              </div>
            )
          )}

          {currentTab === 'settings' && (
            <SettingsPage
              currentUser={currentUser}
              isDark={isDark}
              onToggleTheme={() => setIsDark(!isDark)}
              onLogout={handleLogout}
              onOpenAuth={() => setAuthModalOpen(true)}
              isAdmin={isAdmin}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        unreadCount={unreadNotifCount}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Global Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {}}
      />

      <CommentModal
        post={commentPost}
        currentUser={currentUser}
        onClose={() => setCommentPost(null)}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      <ReportModal
        post={reportPost}
        currentUser={currentUser}
        onClose={() => setReportPost(null)}
        onOpenAuth={() => setAuthModalOpen(true)}
      />
    </div>
  );
};
