import React, { useState } from 'react';
import { X, Upload, Check } from 'lucide-react';
import { UserProfile } from '../types';
import { updateUserProfile } from '../services/databaseService';
import { uploadImageToImgBB } from '../services/imgbbService';

interface ProfileEditModalProps {
  currentUser: UserProfile;
  onClose: () => void;
  onProfileUpdated: (updated: UserProfile) => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  currentUser,
  onClose,
  onProfileUpdated
}) => {
  const [displayName, setDisplayName] = useState<string>(currentUser.displayName || '');
  const [bio, setBio] = useState<string>(currentUser.bio || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(currentUser.avatarUrl || '');
  const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      setError('');
      const uploadedUrl = await uploadImageToImgBB(file);
      setAvatarUrl(uploadedUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Avatar upload failed');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Display name cannot be empty');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const updates = {
        displayName: displayName.trim(),
        bio: bio.trim(),
        avatarUrl
      };
      await updateUserProfile(currentUser.uid, updates);
      onProfileUpdated({ ...currentUser, ...updates });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl p-6"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Edit Profile</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="pt-4 space-y-4">
          {/* Avatar preview & change */}
          <div className="flex items-center gap-4">
            <img
              src={avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser.username}`}
              alt={currentUser.displayName}
              className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/40 shrink-0"
            />
            <div className="space-y-1">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingAvatar ? 'Uploading...' : 'Change Avatar (ImgBB)'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFile}
                  disabled={uploadingAvatar}
                  className="hidden"
                />
              </label>
              <p className="text-[10px] text-slate-400">JPG, PNG, WebP up to 32MB</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell other photographers about yourself..."
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              disabled={saving || uploadingAvatar}
              className="flex-1 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
