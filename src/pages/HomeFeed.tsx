import React from 'react';
import { Sparkles, Camera, RefreshCw } from 'lucide-react';
import { Post, UserProfile } from '../types';
import { PostCard } from '../components/PostCard';

interface HomeFeedProps {
  posts: Post[];
  loading: boolean;
  currentUser: UserProfile | null;
  isAdmin: boolean;
  onOpenComments: (post: Post) => void;
  onOpenReport: (post: Post) => void;
  onOpenAuth: () => void;
  onNavigateToCreate: () => void;
  onRefresh: () => void;
  onUserClick?: (username: string) => void;
}

export const HomeFeed: React.FC<HomeFeedProps> = ({
  posts,
  loading,
  currentUser,
  isAdmin,
  onOpenComments,
  onOpenReport,
  onOpenAuth,
  onNavigateToCreate,
  onRefresh,
  onUserClick
}) => {
  return (
    <div className="max-w-xl mx-auto py-6 px-4">
      {/* Top Welcome / Feed Hero */}
      <div className="mb-6 p-4 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-amber-500/10 border border-indigo-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Community Lens
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Fresh moments captured across the nest
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          title="Refresh feed"
          className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 rounded-xl hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-2 flex-1">
                  <div className="w-32 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="w-20 h-2.5 bg-slate-100 dark:bg-slate-800/60 rounded" />
                </div>
              </div>
              <div className="w-full h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl mb-4" />
              <div className="w-3/4 h-3 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
              <div className="w-1/2 h-3 bg-slate-100 dark:bg-slate-800/60 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && posts.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
            No photos yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-6">
            Be the pioneer to publish the very first memory on PhotoNest!
          </p>
          <button
            onClick={onNavigateToCreate}
            className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-transform active:scale-95"
          >
            Share First Photo
          </button>
        </div>
      )}

      {/* Posts Feed */}
      {!loading && posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUser={currentUser}
          isAdmin={isAdmin}
          onOpenComments={onOpenComments}
          onOpenReport={onOpenReport}
          onOpenAuth={onOpenAuth}
          onUserClick={onUserClick}
        />
      ))}
    </div>
  );
};
