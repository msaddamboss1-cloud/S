import React from 'react';
import { Bell, Heart, MessageCircle, ShieldCheck, CheckCheck } from 'lucide-react';
import { NotificationItem, UserProfile } from '../types';
import { markNotificationRead } from '../services/databaseService';

interface NotificationsPageProps {
  notifications: NotificationItem[];
  currentUser: UserProfile;
  onSelectPostById?: (postId: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  notifications,
  currentUser,
  onSelectPostById
}) => {
  const formatDate = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const handleItemClick = (item: NotificationItem) => {
    if (!item.read) {
      markNotificationRead(currentUser.uid, item.id);
    }
    if (item.postId && onSelectPostById) {
      onSelectPostById(item.postId);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <h2 className="font-bold text-base text-slate-900 dark:text-slate-100">Notifications</h2>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {notifications.filter((n) => !n.read).length} unread
        </span>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Bell className="w-6 h-6" />
          </div>
          <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">Quiet for now</p>
          <p className="text-xs text-slate-400 mt-1">
            When people like or comment on your photos, you'll see them here!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const isLike = notif.type === 'like';
            const isComment = notif.type === 'comment';

            return (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  notif.read
                    ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                    : 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/50'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="relative shrink-0">
                    <img
                      src={notif.senderAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${notif.senderName}`}
                      alt={notif.senderName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white dark:bg-slate-900">
                      {isLike ? (
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                      ) : isComment ? (
                        <MessageCircle className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                      )}
                    </div>
                  </div>

                  <div className="text-xs truncate">
                    <p className="text-slate-900 dark:text-slate-100 font-semibold truncate">
                      {notif.senderName}{' '}
                      <span className="font-normal text-slate-600 dark:text-slate-400">
                        {notif.text}
                      </span>
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {formatDate(notif.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Post thumbnail if available */}
                {notif.postImage && (
                  <img
                    src={notif.postImage}
                    alt="Post thumbnail"
                    className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-800"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
