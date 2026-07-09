import React, { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '../global/AuthProvider';
import { db, storage } from '../../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Upload, CheckCircle2, ShieldAlert, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  label: string;
  storagePath: string; // e.g., 'players/avatars'
  currentUrl?: string;
  onUploadComplete: (url: string) => void;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  storagePath,
  currentUrl,
  onUploadComplete,
  maxSizeMB = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
}) => {
  const { user } = useAuthContext();
  const [userDocVerified, setUserDocVerified] = useState<boolean | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine verification status
  const isUserVerified = user ? (user.emailVerified || userDocVerified === true) : false;

  useEffect(() => {
    if (!user) {
      setUserDocVerified(null);
      return;
    }
    const unsubUser = onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => {
        if (snap.exists()) {
          setUserDocVerified(snap.data().isVerified || false);
        } else {
          setUserDocVerified(false);
        }
      },
      (err) => {
        console.error('Failed to retrieve verification status in ImageUpload:', err);
      }
    );
    return () => unsubUser();
  }, [user]);

  useEffect(() => {
    setPreviewUrl(currentUrl);
  }, [currentUrl]);

  const processFile = (file: File) => {
    if (!user) {
      setUploadError('You must be signed in to upload files.');
      return;
    }

    if (!isUserVerified) {
      setUploadError('Only registered and verified users can perform uploads.');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setUploadError(`Invalid file format. Supported: ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}`);
      return;
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setUploadError(`File is too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }

    setUploadError(null);
    setProgress(0);

    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const path = `${storagePath}/${user.uid}/${timestamp}_${cleanFileName}`;
    const storageRef = ref(storage, path);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const percentage = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(percentage);
      },
      (error) => {
        console.error('Firebase Storage Upload Error:', error);
        setUploadError(`Upload failed: ${error.message}`);
        setProgress(null);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setPreviewUrl(downloadUrl);
          onUploadComplete(downloadUrl);
          setProgress(null);
        } catch (err: any) {
          setUploadError(`Failed to fetch secure download URL: ${err.message}`);
          setProgress(null);
        }
      }
    );
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const clearUpload = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(undefined);
    onUploadComplete('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <span className="block text-xs font-bold text-gray-700 uppercase tracking-wide">{label}</span>
      
      {!user ? (
        <div className="p-4 border border-dashed border-gray-200 rounded-2xl bg-white/5 flex items-center gap-2.5 text-xs text-gray-500">
          <ShieldAlert className="w-4 h-4 text-gray-400" />
          <span>Please sign in to upload assets.</span>
        </div>
      ) : !isUserVerified ? (
        <div className="p-4 border border-dashed border-amber-200 rounded-2xl bg-amber-50/50 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-amber-700 font-medium">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Verification Required to Upload Custom Media</span>
          </div>
          <p className="text-[10px] text-amber-600 leading-normal">
            Only verified users can host files. You can use the "Verify Email (Dev Quick Pass)" on the Community page to instantly verify your profile.
          </p>
        </div>
      ) : (
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-5 transition-all text-center flex flex-col items-center justify-center min-h-[140px] cursor-pointer ${
            dragActive 
              ? 'border-[#1A73E8] bg-[#00D4FF]/10/30 scale-[1.01]' 
              : previewUrl 
                ? 'border-green-300 bg-green-50/10' 
                : 'border-[#DADCE0] hover:border-[#1A73E8] hover:bg-white/5/50'
          }`}
          onClick={onButtonClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={allowedTypes.join(',')}
            onChange={handleChange}
            disabled={progress !== null}
          />

          {progress !== null ? (
            <div className="w-full space-y-3 px-4">
              <Upload className="w-6 h-6 text-[#1A73E8] animate-bounce mx-auto" />
              <div className="flex justify-between text-[11px] font-bold text-[#1A73E8]">
                <span>Uploading Asset...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div 
                  className="bg-[#1A73E8] h-1.5 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          ) : previewUrl ? (
            <div className="relative group w-full flex flex-col items-center">
              <div className="relative max-w-full h-24 rounded-lg overflow-hidden border border-gray-100 bg-white/5 shadow-sm">
                <img 
                  src={previewUrl} 
                  alt="Asset Preview" 
                  className="w-full h-full object-contain" 
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  onClick={clearUpload}
                  className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
                  title="Remove Upload"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[10px] text-green-600 font-semibold mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Custom asset uploaded successfully!
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="p-2.5 bg-[#00D4FF]/10 text-[#1A73E8] rounded-full inline-block mx-auto mb-1">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700">Drag & drop or <span className="text-[#1A73E8] underline">browse files</span></p>
                <p className="text-[10px] text-gray-400 mt-1">Supported: JPG, PNG, WEBP, GIF (Max {maxSizeMB}MB)</p>
              </div>
            </div>
          )}

          {uploadError && (
            <div className="absolute inset-x-0 -bottom-10 bg-red-50 border border-red-200 text-red-600 text-[10px] font-semibold py-1.5 px-3 rounded-lg text-left flex items-center gap-1.5 z-10 animate-fade-in shadow-sm">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
