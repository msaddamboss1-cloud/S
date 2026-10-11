import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Post, UserProfile } from '../types';
import { reportPost } from '../services/databaseService';

interface ReportModalProps {
  post: Post | null;
  currentUser: UserProfile | null;
  onClose: () => void;
  onOpenAuth: () => void;
}

const REPORT_REASONS = [
  "Inappropriate or explicit content",
  "Spam, bot activity, or advertising",
  "Harassment, hate speech, or abuse",
  "Copyright or intellectual property infringement",
  "Misinformation or harmful content",
  "Other"
];

export const ReportModal: React.FC<ReportModalProps> = ({
  post,
  currentUser,
  onClose,
  onOpenAuth
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(REPORT_REASONS[0]);
  const [details, setDetails] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!post) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    try {
      setSubmitting(true);
      await reportPost(
        post.id,
        post.imageUrl,
        currentUser.uid,
        currentUser.email,
        selectedReason,
        details
      );
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err) {
      alert("Failed to submit report: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl p-6"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-amber-500">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Report Photo</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              ✓
            </div>
            <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">Thank you for reporting</p>
            <p className="text-xs text-slate-500">Our moderation team will review this post promptly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="pt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Why are you reporting this post?
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {REPORT_REASONS.map((reason) => (
                  <label
                    key={reason}
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs"
                  >
                    <input
                      type="radio"
                      name="reason"
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-800 dark:text-slate-200">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Additional context (optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Help us understand the issue..."
                rows={2}
                className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
