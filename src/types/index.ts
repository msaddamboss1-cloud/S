export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: number;
  isAdmin?: boolean;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  createdAt: number;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar?: string;
  imageUrl: string;
  caption: string;
  hashtags: string[];
  createdAt: number;
  likeCount?: number;
  commentCount?: number;
}

export interface NotificationItem {
  id: string;
  userId: string; // recipient
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  type: 'like' | 'comment' | 'report_action';
  postId?: string;
  postImage?: string;
  text: string;
  createdAt: number;
  read: boolean;
}

export interface ReportItem {
  id: string;
  postId: string;
  postImageUrl: string;
  reportedByUid: string;
  reportedByEmail: string;
  reason: string;
  details?: string;
  createdAt: number;
  status: 'pending' | 'resolved' | 'dismissed';
}

export interface AdminAuditLog {
  id: string;
  adminUid: string;
  adminEmail: string;
  action: string;
  targetId: string;
  details: string;
  timestamp: number;
}

export type TabType = 'home' | 'explore' | 'create' | 'notifications' | 'profile' | 'admin' | 'settings';
