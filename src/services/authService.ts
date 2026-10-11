import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { auth, database } from "../firebase";
import { UserProfile } from "../types";

export function subscribeToAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function registerUser(
  email: string,
  pass: string,
  username: string,
  displayName: string
): Promise<UserProfile> {
  const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (cleanUsername.length < 3) {
    throw new Error("Username must be at least 3 alphanumeric characters or underscores.");
  }

  // Check if username is already taken in /usernames
  const usernameRef = ref(database, `usernames/${cleanUsername}`);
  const snap = await get(usernameRef);
  if (snap.exists()) {
    throw new Error(`Username @${cleanUsername} is already taken. Please pick another.`);
  }

  // Create Firebase Auth user
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;

  // Update Firebase Auth profile
  await updateProfile(user, {
    displayName: displayName.trim() || cleanUsername,
    photoURL: `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanUsername}`
  });

  const profileData: UserProfile = {
    uid: user.uid,
    email: user.email || email,
    username: cleanUsername,
    displayName: displayName.trim() || cleanUsername,
    avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanUsername}`,
    bio: "Passionate photographer on PhotoNest.",
    createdAt: Date.now()
  };

  // Save to /users/{uid} and /usernames/{username}
  await set(ref(database, `users/${user.uid}`), profileData);
  await set(usernameRef, user.uid);

  return profileData;
}

export async function loginUser(email: string, pass: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  return userCredential.user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export function formatAuthError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const err = error as { code: string; message: string };
    switch (err.code) {
      case 'auth/invalid-email':
        return 'Please provide a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/user-not-found':
        return 'No user found with this email.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password. Please verify your credentials.';
      case 'auth/email-already-in-use':
        return 'This email address is already in use by another account.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/too-many-requests':
        return 'Too many failed login attempts. Please try again later or reset password.';
      default:
        return err.message || 'Authentication failed. Please try again.';
    }
  }
  return String(error || 'An unexpected authentication error occurred.');
}
