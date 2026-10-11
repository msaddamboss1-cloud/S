import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  MoreVertical, 
  Trash2, 
  Flag,
  Check,
  Calendar
} from 'lucide-react';
import { Post, UserProfile } from '../types';
import { 
  toggleLike, 
  listenToPostLikes, 
  listenToPostComments, 
  toggleSavedPost, 
  deletePost 
} from '../services/databaseService';

interface PostCardProps {
  post: Post;
  currentUser: UserProfile | null;
  isAdmin: boolean;
  onOpenComments: (post: Post) => void;
  onOpenReport: (post: Post) => void;
  onOpenAuth: () => void;
  isSaved?: boolean;
  onToggleSave?: (post: Post) => void;
  onUserClick?: (username: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  isAdmin,
  onOpenComments,
  onOpenReport,
  onOpenAuth,
  isSaved: initialIsSaved = false,
  onToggleSave,
  onUserClick
}) => {
  const [likes, setLikes] = useState<string[]>([]);
  const [commentsCount, setCommentsCount] = useState<number>(0);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(initialIsSaved);
  const [likeAnimating, setLikeAnimating] = useState<boolean>(false);

  // Listen to likes realtime
  useEffect(() => {
    const unsub = listenToPostLikes(post.id, (uids) => {
      setLikes(uids);
    });
    return () => unsub();
  }, [post.id]);

  // Listen to comment count realtime
  useEffect(() => {
    const unsub = listenToPostComments(post.id, (comments) => {
      setCommentsCount(comments.length);
    });
    return () => unsub();
  }, [post.id]);

  const isLiked = currentUser ? likes.includes(currentUser.uid) : false;
  const isOwner = currentUser?.uid === post.authorId;

  const handleLike = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 500);
    try {
      await toggleLike(
        post.id,
        currentUser.uid,
        post.authorId,
        currentUser.displayName,
        currentUser.avatarUrl,
        post.imageUrl
      );
    } catch (err) {
      console.error("Like error", err);
    }
  };

  const handleSave = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    try {
      const state = await toggleSavedPost(currentUser.uid, post);
      setSaved(state);
      if (onToggleSave) onToggleSave(post);
    } catch (err) {
      console.error("Save error", err);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/#post-${post.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (!currentUser) return;
    try {
      await deletePost(post.id, currentUser.uid, isAdmin);
      setConfirmDelete(false);
      setMenuOpen(false);
    } catch (err) {
      alert("Failed to delete post: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const formatDate = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <article className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden mb-6 transition-all hover:shadow-md">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div 
          onClick={() => onUserClick && onUserClick(post.authorUsername)}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img
            src={post.authorAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${post.authorUsername}`}
            alt={post.authorName}
            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 group-hover:scale-105 transition-transform"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {post.authorName}
              </span>
              <span className="text-xs text-slate-400">@{post.authorUsername}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Options Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 w-44 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-20 animate-in fade-in zoom-in-95">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleShare();
                }}
                className="w-full px-4 py-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenReport(post);
                }}
                className="w-full px-4 py-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-2"
              >
                <Flag className="w-4 h-4 text-amber-500" />
                <span>Report Post</span>
              </button>

              {(isOwner || isAdmin) && (
                <button
                  onClick={() => {
                    setConfirmDelete(true);
                    setMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isAdmin && !isOwner ? 'Delete (Admin)' : 'Delete Post'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog for Delete */}
      {confirmDelete && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border-y border-rose-200 dark:border-rose-900/50 flex items-center justify-between">
          <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">
            Are you sure you want to permanently delete this photo?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-1 rounded-lg text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1 rounded-lg text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* Post Photo */}
      <div 
        onDoubleClick={handleLike}
        className="relative bg-slate-950 w-full overflow-hidden select-none cursor-pointer flex items-center justify-center min-h-[300px] max-h-[600px]"
      >
        <img
          src={post.imageUrl}
          alt={post.caption || "PhotoNest picture"}
          loading="lazy"
          className="w-full h-auto object-contain max-h-[600px] transition-transform duration-300 hover:scale-[1.01]"
        />
        {likeAnimating && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-ping">
            <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-2xl" />
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              aria-label={isLiked ? "Unlike photo" : "Like photo"}
              className={`flex items-center gap-1.5 transition-transform active:scale-125 ${
                isLiked ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300 hover:text-rose-500'
              }`}
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-rose-500' : ''}`} />
              <span className="text-xs font-semibold">{likes.length}</span>
            </button>

            <button
              onClick={() => onOpenComments(post)}
              aria-label="View comments"
              className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs font-semibold">{commentsCount}</span>
            </button>

            <button
              onClick={handleShare}
              aria-label="Share photo"
              className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title="Copy share link"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Share2 className="w-6 h-6" />}
            </button>
          </div>

          <button
            onClick={handleSave}
            aria-label={saved ? "Unsave photo" : "Save photo"}
            className={`transition-colors ${
              saved ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600'
            }`}
          >
            <Bookmark className={`w-6 h-6 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Caption and Hashtags */}
        {post.caption && (
          <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
            <span className="font-bold mr-2">@{post.authorUsername}</span>
            {post.caption}
          </p>
        )}

        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {post.hashtags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                #{tag.replace(/^#/, '')}
              </span>
            ))}
          </div>
        )}

        {/* View all comments button */}
        {commentsCount > 0 && (
          <button
            onClick={() => onOpenComments(post)}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 block pt-1 font-medium"
          >
            View all {commentsCount} comments
          </button>
        )}
      </div>
    </article>
  );
};
