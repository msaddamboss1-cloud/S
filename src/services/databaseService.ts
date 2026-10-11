import {
  ref,
  set,
  get,
  push,
  remove,
  update,
  onValue,
  off,
  query,
  orderByChild
} from "firebase/database";
import { database } from "../firebase";
import { UserProfile, Post, PostComment, NotificationItem, ReportItem, AdminAuditLog } from "../types";

// User profile
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = ref(database, `users/${uid}`);
  const snap = await get(userRef);
  if (snap.exists()) {
    return snap.val() as UserProfile;
  }
  return null;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  const userRef = ref(database, `users/${uid}`);
  await update(userRef, data);
}

// Admin check
export async function isUserAdmin(uid: string): Promise<boolean> {
  if (!uid) return false;
  try {
    const adminRef = ref(database, `admins/${uid}`);
    const snap = await get(adminRef);
    return snap.exists() && snap.val() === true;
  } catch {
    return false;
  }
}

// Posts
export async function createPost(
  authorId: string,
  authorName: string,
  authorUsername: string,
  authorAvatar: string | undefined,
  imageUrl: string,
  caption: string,
  hashtags: string[]
): Promise<string> {
  const postsRef = ref(database, 'posts');
  const newPostRef = push(postsRef);
  const postId = newPostRef.key!;

  const newPost: Post = {
    id: postId,
    authorId,
    authorName,
    authorUsername,
    authorAvatar: authorAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${authorUsername}`,
    imageUrl,
    caption,
    hashtags,
    createdAt: Date.now(),
    likeCount: 0,
    commentCount: 0
  };

  await set(newPostRef, newPost);
  return postId;
}

export async function deletePost(postId: string, currentUserId: string, isAdmin: boolean): Promise<void> {
  const postRef = ref(database, `posts/${postId}`);
  const snap = await get(postRef);
  if (!snap.exists()) return;

  const post = snap.val() as Post;
  if (post.authorId !== currentUserId && !isAdmin) {
    throw new Error("Unauthorized: You can only delete your own posts unless you are an administrator.");
  }

  // Remove post
  await remove(postRef);
  // Clean up likes and comments
  await remove(ref(database, `likes/${postId}`));
  await remove(ref(database, `comments/${postId}`));

  if (isAdmin && post.authorId !== currentUserId) {
    await addAdminAuditLog({
      id: '',
      adminUid: currentUserId,
      adminEmail: 'admin@photonest.com',
      action: 'DELETE_POST',
      targetId: postId,
      details: `Removed post by ${post.authorName} (${post.authorId})`,
      timestamp: Date.now()
    });
  }
}

// Realtime listeners
export function listenToPosts(callback: (posts: Post[]) => void) {
  const postsRef = query(ref(database, 'posts'), orderByChild('createdAt'));
  const listener = onValue(postsRef, (snap) => {
    if (!snap.exists()) {
      callback([]);
      return;
    }
    const val = snap.val();
    const list: Post[] = Object.keys(val).map((key) => ({
      ...val[key],
      id: key
    }));
    // descending
    list.sort((a, b) => b.createdAt - a.createdAt);
    callback(list);
  }, (err) => {
    console.error("Error fetching posts:", err);
    callback([]);
  });

  return () => off(postsRef, 'value', listener);
}

// Likes
export async function toggleLike(
  postId: string,
  userId: string,
  authorId: string,
  senderName: string,
  senderAvatar: string | undefined,
  postImage: string
): Promise<boolean> {
  const likeRef = ref(database, `likes/${postId}/${userId}`);
  const snap = await get(likeRef);
  const currentlyLiked = snap.exists();

  if (currentlyLiked) {
    await remove(likeRef);
    return false;
  } else {
    await set(likeRef, true);
    // Send notification if not liking own post
    if (authorId !== userId) {
      const notifRef = push(ref(database, `notifications/${authorId}`));
      const notif: NotificationItem = {
        id: notifRef.key!,
        userId: authorId,
        senderId: userId,
        senderName,
        senderAvatar,
        type: 'like',
        postId,
        postImage,
        text: 'liked your photo',
        createdAt: Date.now(),
        read: false
      };
      await set(notifRef, notif);
    }
    return true;
  }
}

export function listenToPostLikes(postId: string, callback: (uids: string[]) => void) {
  const postLikesRef = ref(database, `likes/${postId}`);
  const listener = onValue(postLikesRef, (snap) => {
    if (!snap.exists()) {
      callback([]);
      return;
    }
    callback(Object.keys(snap.val()));
  });

  return () => off(postLikesRef, 'value', listener);
}

// Comments
export async function addComment(
  postId: string,
  authorId: string,
  authorName: string,
  authorAvatar: string | undefined,
  text: string,
  postAuthorId: string,
  postImage: string
): Promise<void> {
  const commentsRef = ref(database, `comments/${postId}`);
  const newCommentRef = push(commentsRef);
  const commentId = newCommentRef.key!;

  const comment: PostComment = {
    id: commentId,
    postId,
    authorId,
    authorName,
    authorAvatar: authorAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${authorName}`,
    text: text.trim(),
    createdAt: Date.now()
  };

  await set(newCommentRef, comment);

  // Notify post author if not self
  if (postAuthorId !== authorId) {
    const notifRef = push(ref(database, `notifications/${postAuthorId}`));
    const notif: NotificationItem = {
      id: notifRef.key!,
      userId: postAuthorId,
      senderId: authorId,
      senderName,
      senderAvatar,
      type: 'comment',
      postId,
      postImage,
      text: `commented: "${text.length > 40 ? text.slice(0, 37) + '...' : text}"`,
      createdAt: Date.now(),
      read: false
    };
    await set(notifRef, notif);
  }
}

export function listenToPostComments(postId: string, callback: (comments: PostComment[]) => void) {
  const commentsRef = ref(database, `comments/${postId}`);
  const listener = onValue(commentsRef, (snap) => {
    if (!snap.exists()) {
      callback([]);
      return;
    }
    const val = snap.val();
    const list: PostComment[] = Object.keys(val).map((k) => ({
      ...val[k],
      id: k
    }));
    list.sort((a, b) => a.createdAt - b.createdAt);
    callback(list);
  });

  return () => off(commentsRef, 'value', listener);
}

// Saved Posts
export async function toggleSavedPost(userId: string, post: Post): Promise<boolean> {
  const savedRef = ref(database, `savedPosts/${userId}/${post.id}`);
  const snap = await get(savedRef);
  if (snap.exists()) {
    await remove(savedRef);
    return false;
  } else {
    await set(savedRef, post);
    return true;
  }
}

export function listenToSavedPosts(userId: string, callback: (posts: Post[]) => void) {
  const savedRef = ref(database, `savedPosts/${userId}`);
  const listener = onValue(savedRef, (snap) => {
    if (!snap.exists()) {
      callback([]);
      return;
    }
    const val = snap.val();
    callback(Object.values(val));
  });

  return () => off(savedRef, 'value', listener);
}

// Notifications
export function listenToNotifications(userId: string, callback: (notifications: NotificationItem[]) => void) {
  const notifRef = ref(database, `notifications/${userId}`);
  const listener = onValue(notifRef, (snap) => {
    if (!snap.exists()) {
      callback([]);
      return;
    }
    const val = snap.val();
    const list: NotificationItem[] = Object.keys(val).map((k) => ({
      ...val[k],
      id: k
    }));
    list.sort((a, b) => b.createdAt - a.createdAt);
    callback(list);
  });

  return () => off(notifRef, 'value', listener);
}

export async function markNotificationRead(userId: string, notifId: string): Promise<void> {
  await update(ref(database, `notifications/${userId}/${notifId}`), { read: true });
}

// Reports
export async function reportPost(
  postId: string,
  postImageUrl: string,
  reportedByUid: string,
  reportedByEmail: string,
  reason: string,
  details?: string
): Promise<void> {
  const reportsRef = ref(database, 'reports');
  const newReportRef = push(reportsRef);
  const report: ReportItem = {
    id: newReportRef.key!,
    postId,
    postImageUrl,
    reportedByUid,
    reportedByEmail,
    reason,
    details: details || '',
    createdAt: Date.now(),
    status: 'pending'
  };
  await set(newReportRef, report);
}

// Admin Operations
export async function getAdminReports(): Promise<ReportItem[]> {
  const reportsRef = ref(database, 'reports');
  const snap = await get(reportsRef);
  if (!snap.exists()) return [];
  const val = snap.val();
  const list: ReportItem[] = Object.keys(val).map((k) => ({
    ...val[k],
    id: k
  }));
  list.sort((a, b) => b.createdAt - a.createdAt);
  return list;
}

export async function updateReportStatus(
  reportId: string,
  status: 'resolved' | 'dismissed',
  adminUid: string
): Promise<void> {
  await update(ref(database, `reports/${reportId}`), { status });
  await addAdminAuditLog({
    id: '',
    adminUid,
    adminEmail: 'admin@photonest.com',
    action: `REPORT_${status.toUpperCase()}`,
    targetId: reportId,
    details: `Moderated report ${reportId} with status ${status}`,
    timestamp: Date.now()
  });
}

export async function addAdminAuditLog(log: AdminAuditLog): Promise<void> {
  const logsRef = ref(database, 'adminAuditLogs');
  const newLogRef = push(logsRef);
  await set(newLogRef, {
    ...log,
    id: newLogRef.key!
  });
}

export async function getAdminAuditLogs(): Promise<AdminAuditLog[]> {
  const logsRef = ref(database, 'adminAuditLogs');
  const snap = await get(logsRef);
  if (!snap.exists()) return [];
  const val = snap.val();
  const list: AdminAuditLog[] = Object.keys(val).map((k) => ({
    ...val[k],
    id: k
  }));
  list.sort((a, b) => b.timestamp - a.timestamp);
  return list;
}

export async function getAllUsersForAdmin(): Promise<UserProfile[]> {
  const usersRef = ref(database, 'users');
  const snap = await get(usersRef);
  if (!snap.exists()) return [];
  const val = snap.val();
  return Object.values(val);
}
