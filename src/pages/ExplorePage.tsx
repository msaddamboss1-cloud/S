import React, { useState, useMemo } from 'react';
import { Search, Heart, MessageCircle } from 'lucide-react';
import { Post, UserProfile } from '../types';

interface ExplorePageProps {
  posts: Post[];
  currentUser: UserProfile | null;
  onSelectPost: (post: Post) => void;
  onUserClick: (username: string) => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  posts,
  onSelectPost,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Collect top tags
  const topTags = useMemo(() => {
    const counts: { [tag: string]: number } = {};
    posts.forEach((p) => {
      p.hashtags?.forEach((t) => {
        const clean = t.replace(/^#/, '').toLowerCase();
        counts[clean] = (counts[clean] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([t]) => t);
  }, [posts]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchSearch =
        p.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.authorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.authorUsername?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.hashtags?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchTag =
        selectedTag === 'all' ||
        p.hashtags?.some((t) => t.replace(/^#/, '').toLowerCase() === selectedTag.toLowerCase());

      return matchSearch && matchTag;
    });
  }, [posts, searchTerm, selectedTag]);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Search Header */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search photographers, stories, #hashtags..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedTag === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            All Photos
          </button>
          {topTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? 'all' : tag)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTag === tag
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of photos */}
      {filteredPosts.length === 0 ? (
        <div className="py-20 text-center text-slate-400 dark:text-slate-500">
          <p className="text-sm">No photos found matching your search.</p>
          <p className="text-xs mt-1">Try another keyword or explore all photos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => onSelectPost(post)}
              className="group relative aspect-square bg-slate-950 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all"
            >
              <img
                src={post.imageUrl}
                alt={post.caption}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Overlay with info on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white p-2">
                <div className="flex items-center gap-1 text-xs font-bold">
                  <Heart className="w-4 h-4 fill-white" />
                  <span>{post.likeCount || 0}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold">
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>{post.commentCount || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
