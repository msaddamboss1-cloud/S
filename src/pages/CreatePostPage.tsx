import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, X, Sparkles, RefreshCw, Info } from 'lucide-react';
import { UserProfile } from '../types';
import { uploadImageToImgBB } from '../services/imgbbService';
import { createPost } from '../services/databaseService';

interface CreatePostPageProps {
  currentUser: UserProfile;
  onPostCreated: () => void;
  onOpenAuth: () => void;
}

export const CreatePostPage: React.FC<CreatePostPageProps> = ({
  currentUser,
  onPostCreated,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>('');
  const [hashtags, setHashtags] = useState<string>('');

  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (file: File) => {
    setError(null);
    setUploadedImageUrl(null);
    setUploadProgress(0);

    // Validation
    const maxSize = 32 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File exceeds 32MB limit. Please choose a smaller photo.");
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError("Unsupported format. Please select a JPEG, PNG, WEBP, or GIF image.");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !uploadedImageUrl) {
      setError("Please select a photo to share.");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // Step 1: Upload to ImgBB if not yet uploaded
      let finalImageUrl = uploadedImageUrl;
      if (!finalImageUrl && selectedFile) {
        finalImageUrl = await uploadImageToImgBB(selectedFile, (percent) => {
          setUploadProgress(percent);
        });
        setUploadedImageUrl(finalImageUrl);
      }

      if (!finalImageUrl) {
        throw new Error("Did not receive a valid image URL from ImgBB.");
      }

      // Step 2: Extract hashtags
      const extractedTags = hashtags
        .split(/[,\s]+/)
        .map((t) => t.trim().replace(/^#/, ''))
        .filter((t) => t.length > 0);

      // Step 3: Publish to Firebase Realtime Database
      await createPost(
        currentUser.uid,
        currentUser.displayName,
        currentUser.username,
        currentUser.avatarUrl,
        finalImageUrl,
        caption.trim(),
        extractedTags
      );

      // Reset & navigate
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption('');
      setHashtags('');
      onPostCreated();
    } catch (err) {
      console.error("Publishing error:", err);
      setError(err instanceof Error ? err.message : "Failed to publish photo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadedImageUrl(null);
    setUploadProgress(0);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-xl mx-auto py-6 px-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-slate-100">Create New Post</h2>
              <p className="text-[11px] text-slate-400">Share your story with the PhotoNest community</p>
            </div>
          </div>
          {previewUrl && (
            <button
              onClick={clearSelection}
              disabled={isUploading}
              className="text-xs text-slate-400 hover:text-rose-500 font-medium"
            >
              Clear
            </button>
          )}
        </div>

        {/* ImgBB client key security notice */}
        <div className="mb-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>ImgBB Hosting:</strong> Photos are securely sent to ImgBB. For production, routing through a serverless backend proxy is recommended to safeguard client credentials.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={handlePublish} className="space-y-5">
          {/* File drop or preview */}
          {!previewUrl ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-3xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Click or drag & drop photo here
              </p>
              <p className="text-xs text-slate-400 mt-1">
                JPEG, PNG, WEBP up to 32MB via ImgBB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 max-h-96 flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Selected preview"
                className="w-full h-auto max-h-96 object-contain"
              />
              <button
                type="button"
                onClick={clearSelection}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Upload progress indicator */}
          {isUploading && (
            <div className="space-y-2 p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-900/50">
              <div className="flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-300 font-semibold">
                <span>Uploading to ImgBB hosting...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-indigo-200 dark:bg-indigo-900 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Caption */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              placeholder="What makes this shot special?"
              className="w-full p-3 rounded-2xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Hashtags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Hashtags (separated by space or comma)
            </label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="photography nature portrait goldenhour"
              className="w-full px-3.5 py-2.5 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Publish action */}
          <button
            type="submit"
            disabled={(!selectedFile && !uploadedImageUrl) || isUploading}
            className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            {isUploading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Publishing to PhotoNest...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Publish Photo</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
