import React, { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { Post, PostComment, UserProfile } from '../types';
import { listenToPostComments, addComment } from '../services/databaseService';

interface CommentModalProps {
  post: Post | null;
  currentUser: UserProfile | null;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const CommentModal: React.FC<CommentModalProps> = ({
  post,
  currentUser,
  onClose,
  onOpenAuth
}) => {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [text, setText] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!post) return;
    const unsub = listenToPostComments(post.id, (list) => {
      setComments(list);
    });
    return () => unsub();
  }, [post]);

  if (!post) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    try {
      setSubmitting(true);
      await addComment(
        post.id,
        currentUser.uid,
        currentUser.displayName,
        currentUser.avatarUrl,
        text,
        post.authorId,
        post.imageUrl
      );
      setText('');
    } catch (err) {
      console.error("Comment submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Comments</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
              {comments.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comment list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Original Post Caption as head note */}
          {post.caption && (
            <div className="flex items-start gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <img
                src={post.authorAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${post.authorUsername}`}
                alt={post.authorName}
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
              <div>
                <p className="text-xs">
                  <span className="font-bold text-slate-900 dark:text-slate-100 mr-1.5">
                    {post.authorName}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">{post.caption}</span>
                </p>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Author</span>
              </div>
            </div>
          )}

          {comments.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500">
              <p className="text-sm">No comments yet.</p>
              <p className="text-xs mt-1">Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex items-start gap-3 group">
                <img
                  src={c.authorAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${c.authorName}`}
                  alt={c.authorName}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
                <div className="flex-1 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {c.authorName}
                    </span>
                    <span className="text-[10px] text-slate-400">{formatDate(c.createdAt)}</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                    {c.text}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2">
          {currentUser ? (
            <>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-4 py-2.5 rounded-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!text.trim() || submitting}
                className="p-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition-opacity"
              >
                <Send className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="w-full py-2.5 text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 rounded-full"
            >
              Sign in to join the conversation
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
