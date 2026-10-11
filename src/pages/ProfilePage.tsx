import React, { useState } from 'react';
import { Settings, Edit3, Image as ImageIcon, Bookmark, Heart, Grid } from 'lucide-react';
import { Post, UserProfile } from '../types';
import { ProfileEditModal } from '../components/ProfileEditModal';

interface ProfilePageProps {
  currentUser: UserProfile;
  posts: Post[];
  savedPosts: Post[];
  onSelectPost: (post: Post) => void;
  onProfileUpdated: (updated: UserProfile) => void;
  onOpenSettings: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  posts,
  savedPosts,
  onSelectPost,
  onProfileUpdated,
  onOpenSettings
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // User's own posts
  const myPosts = posts.filter((p) => p.authorId === currentUser.uid);

  // Total likes received across own posts
  const totalLikes = myPosts.reduce((acc, p) => acc + (p.likeCount || 0), 0);

  const displayList = activeTab === 'posts' ? myPosts : savedPosts;

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser.username}`}
              alt={currentUser.displayName}
              className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500/40 shadow-sm"
            />
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {currentUser.displayName}
              </h2>
              <p className="text-xs text-slate-400 font-medium">@{currentUser.username}</p>
              {currentUser.bio && (
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 max-w-md leading-relaxed">
                  {currentUser.bio}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 text-xs font-semibold transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={onOpenSettings}
              aria-label="Settings"
              className="p-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 pt-4 text-center">
          <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
            <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{myPosts.length}</p>
            <p className="text-[11px] text-slate-400 font-medium">Photos</p>
          </div>
          <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
            <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{totalLikes}</p>
            <p className="text-[11px] text-slate-400 font-medium">Likes Received</p>
          </div>
          <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
            <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{savedPosts.length}</p>
            <p className="text-[11px] text-slate-400 font-medium">Saved</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-8 border-b border-slate-200 dark:border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 pb-3 text-xs font-bold transition-colors relative ${
            activeTab === 'posts'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>My Photos</span>
          {activeTab === 'posts' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 pb-3 text-xs font-bold transition-colors relative ${
            activeTab === 'saved'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Photos</span>
          {activeTab === 'saved' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
          )}
        </button>
      </div>

      {/* Photos Grid */}
      {displayList.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold">
            {activeTab === 'posts' ? 'No photos shared yet' : 'No saved photos yet'}
          </p>
          <p className="text-xs mt-1">
            {activeTab === 'posts'
              ? 'Share a photo to start building your gallery!'
              : 'Bookmark photos from the feed or explore to see them here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {displayList.map((post) => (
            <div
              key={post.id}
              onClick={() => onSelectPost(post)}
              className="group relative aspect-square bg-slate-950 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all"
            >
              <img
                src={post.imageUrl}
                alt={post.caption}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white p-2">
                <div className="flex items-center gap-1 text-xs font-bold">
                  <Heart className="w-4 h-4 fill-white" />
                  <span>{post.likeCount || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <ProfileEditModal
          currentUser={currentUser}
          onClose={() => setIsEditing(false)}
          onProfileUpdated={onProfileUpdated}
        />
      )}
    </div>
  );
};
