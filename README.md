# PhotoNest — “Your photos. Your story.”

PhotoNest is a modern, responsive photo-sharing social platform built with React, TypeScript, Tailwind CSS, Firebase Authentication, Firebase Realtime Database, and ImgBB image hosting.

---

## 🚀 Key Features

1. **Authentication & User Management**
   - Firebase Authentication with Email & Password.
   - User registration with unique username claiming (`/usernames/{username}`).
   - Password reset workflow via verified Firebase emails.
   - Persistent user sessions and user profile synchronization.

2. **ImgBB Image Upload Integration**
   - High-resolution photo upload using ImgBB API (`https://api.imgbb.com/1/upload`).
   - Image format validation (JPEG, PNG, WEBP, GIF, up to 32MB).
   - Live upload progress bar using XHR upload stream.
   - Retry handling and detailed error reporting.

3. **Realtime Community Feed**
   - Live synchronization of community photo posts via Firebase Realtime Database.
   - Instant like / unlike with optimistic animation and notification delivery.
   - Real-time comment threads with timestamps and user avatars.
   - Bookmark / Save photo functionality (`/savedPosts/{uid}`).
   - Direct link sharing with clipboard feedback.

4. **Explore & Discovery**
   - Search across captions, creator display names, @usernames, and hashtags.
   - Trending hashtag chips for instant topic filtering.
   - Responsive multi-column photo grid.

5. **Notification Hub**
   - Real-time notifications for likes, comments, and moderation notices.
   - Unread badges and one-tap navigation to relevant posts.

6. **Admin Dashboard (Owner Protection via `/admins/{uid}`)**
   - Total system metrics (users, posts, active reports, audit trails).
   - Content review and post deletion with audit log recording.
   - Reports queue with Dismiss or Remove actions.
   - Full security enforcement in `database.rules.json`.

---

## 🔑 Firebase Setup & Authorization

### 1. Enable Firebase Email/Password Authentication
1. Go to the [Firebase Console](https://console.firebase.google.com/) and select project **`saddam-premium-hub`**.
2. Navigate to **Build > Authentication** > **Sign-in method**.
3. Click on **Email/Password**, toggle **Enable**, and click **Save**.

### 2. Publish Database Security Rules
1. In Firebase Console, go to **Build > Realtime Database** > **Rules**.
2. Copy and paste the contents of `database.rules.json` into the editor.
3. Click **Publish**.

### 3. Authorize the Owner's Admin UID
To unlock the Admin Dashboard:
1. Register or sign in with your owner account on PhotoNest.
2. In the Admin Panel (or your Profile), copy your Firebase UID (e.g. `c0XyZ123...`).
3. In Firebase Console, navigate to **Realtime Database > Data**.
4. Click the `+` icon on root or add child:
   - Path: `admins`
   - Child Key: `<your-user-uid>`
   - Value: `true` (as a boolean)
5. Refresh PhotoNest — the Admin Dashboard is now fully unlocked for your account!

---

## 🛠️ Local Development & Build

### Install Dependencies
```bash
npm install
```

### Run Dev Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

---

## 🔒 Security Notes
- **ImgBB Client-Side API Key:** In client-side builds, the ImgBB API key is included in network requests. For enterprise production deployments, consider routing uploads through a server-side proxy or Firebase Cloud Function to keep API keys confidential.
- **Rules Protection:** Only users authenticated in `/admins/{uid}` can read reports, audit logs, or remove other users' posts.
