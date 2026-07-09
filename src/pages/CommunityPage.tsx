import React, { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '../components/global/AuthProvider';
import { db, storage } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  getDoc,
  setDoc,
  onSnapshot
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  File, 
  MessageSquare, 
  ThumbsUp, 
  Trash2, 
  Send, 
  ShieldAlert, 
  CheckCircle2, 
  Info,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { format } from 'date-fns';

// Error handling as per Firebase Integration Skill guidelines
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, userId: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId,
    },
    operationType,
    path
  };
  console.error('Firestore Error details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface MediaItem {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  uploadedBy: string;
  uploaderName: string;
  uploaderPhoto: string;
  title: string;
  description: string;
  likesCount: number;
  likedBy: string[];
  createdAt: any;
}

interface Comment {
  id: string;
  targetId: string;
  targetType: string;
  content: string;
  userId: string;
  userName: string;
  userPhoto: string;
  createdAt: any;
}

interface FeedbackItem {
  id: string;
  category: 'bug' | 'suggestion' | 'complaint' | 'partnership' | 'other';
  title: string;
  description: string;
  submittedBy: string;
  submitterName: string;
  submitterEmail: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: any;
}

export const CommunityPage = () => {
  const { user, claims } = useAuthContext();
  const [userDocVerified, setUserDocVerified] = useState<boolean | null>(null);
  
  // Tabs: 'media' | 'feedback'
  const [activeTab, setActiveTab] = useState<'media' | 'feedback'>('media');
  
  // Media states
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [comments, setComments] = useState<{ [mediaId: string]: Comment[] }>({});
  const [expandedComments, setExpandedComments] = useState<{ [mediaId: string]: boolean }>({});
  const [newCommentText, setNewCommentText] = useState<{ [mediaId: string]: string }>({});
  
  // Upload states
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [fileTitle, setFileTitle] = useState('');
  const [fileDesc, setFileDesc] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Feedback states
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [feedbackCategory, setFeedbackCategory] = useState<'bug' | 'suggestion' | 'complaint' | 'partnership' | 'other'>('suggestion');
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackDesc, setFeedbackDesc] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  
  // Dev verification helper state
  const [verificationLoading, setVerificationLoading] = useState(false);

  // Determine if the logged-in user is verified (either via Google/Auth emailVerified or Firestore custom field)
  const isUserVerified = user ? (user.emailVerified || userDocVerified === true) : false;

  // Fetch Firestore verification status for email/password users
  useEffect(() => {
    if (!user) {
      setUserDocVerified(null);
      return;
    }
    const unsubUser = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        setUserDocVerified(snap.data().isVerified || false);
      } else {
        setUserDocVerified(false);
      }
    }, (err) => {
      console.error("Failed to snapshot user verification status:", err);
    });
    return () => unsubUser();
  }, [user]);

  // Handle manual Email Verification for Dev purposes
  const handleDevVerifyEmail = async () => {
    if (!user) return;
    setVerificationLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { isVerified: true });
      setUserDocVerified(true);
    } catch (err) {
      console.error("Failed to verify email in dev mode:", err);
    } finally {
      setVerificationLoading(false);
    }
  };

  // Real-time listener for Media items
  useEffect(() => {
    const mediaQuery = query(collection(db, 'media'), orderBy('createdAt', 'desc'));
    const unsubMedia = onSnapshot(mediaQuery, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MediaItem));
      setMediaItems(items);
    }, (err) => {
      console.error("Failed to snapshot media gallery:", err);
    });

    return () => unsubMedia();
  }, []);

  // Real-time listener for Comments
  useEffect(() => {
    const commentsQuery = query(collection(db, 'comments'), orderBy('createdAt', 'asc'));
    const unsubComments = onSnapshot(commentsQuery, (snapshot) => {
      const allComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
      
      // Group comments by targetId
      const grouped: { [mediaId: string]: Comment[] } = {};
      allComments.forEach(comment => {
        if (!grouped[comment.targetId]) {
          grouped[comment.targetId] = [];
        }
        grouped[comment.targetId].push(comment);
      });
      setComments(grouped);
    }, (err) => {
      console.error("Failed to snapshot comments:", err);
    });

    return () => unsubComments();
  }, []);

  // Real-time listener for Feedback items (only accessible to verified users and admins)
  useEffect(() => {
    if (!isUserVerified) {
      setFeedbackItems([]);
      return;
    }

    const feedbackQuery = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'));
    const unsubFeedback = onSnapshot(feedbackQuery, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeedbackItem));
      setFeedbackItems(items);
    }, (err) => {
      console.error("Failed to snapshot feedback items. Ensure rules are deployed:", err);
    });

    return () => unsubFeedback();
  }, [isUserVerified]);

  // File Upload Logic using Firebase Storage with best practices
  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!isUserVerified) {
      setUploadError("Only registered and verified users can upload files.");
      return;
    }

    const files = fileInputRef.current?.files;
    if (!files || files.length === 0) {
      setUploadError("Please select a file to upload.");
      return;
    }

    const file = files[0];
    
    // Size limit: 15MB
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadError("File is too large. Maximum size allowed is 15MB.");
      return;
    }

    // Acceptable formats: images, videos, or common documents zip, pdf
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm',
      'application/pdf', 'application/zip', 'application/x-zip-compressed'
    ];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Invalid file type. Supported: Images (JPG, PNG, GIF, WEBP), Videos (MP4, WEBM), and PDF/ZIP.");
      return;
    }

    if (!fileTitle.trim()) {
      setUploadError("Please enter a title for your upload.");
      return;
    }

    setUploadError(null);
    setUploadProgress(0);
    setUploadSuccess(false);

    // Structure path in Firebase Storage to avoid naming collisions
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const storagePath = `community/uploads/${user.uid}/${timestamp}_${cleanFileName}`;
    const fileRef = ref(storage, storagePath);

    // Resumable upload for progress bar
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setUploadProgress(progress);
      }, 
      (error) => {
        console.error("Firebase Storage Upload Error:", error);
        setUploadError(`Upload failed: ${error.message}`);
        setUploadProgress(null);
      }, 
      async () => {
        try {
          // Success! Get storage download URL
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Write document metadata to Firestore 'media'
          const mediaRef = collection(db, 'media');
          await addDoc(mediaRef, {
            url: downloadUrl,
            fileName: file.name,
            fileSize: file.size,
            contentType: file.type,
            uploadedBy: user.uid,
            uploaderName: user.displayName || user.email?.split('@')[0] || 'Community Player',
            uploaderPhoto: user.photoURL || '',
            title: fileTitle.trim(),
            description: fileDesc.trim(),
            likesCount: 0,
            likedBy: [],
            createdAt: new Date()
          });

          // Reset forms on success
          setUploadSuccess(true);
          setFileTitle('');
          setFileDesc('');
          if (fileInputRef.current) fileInputRef.current.value = '';
          setUploadProgress(null);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'media', user.uid);
        }
      }
    );
  };

  // Post Comment Logic
  const handlePostComment = async (mediaId: string) => {
    if (!user) return;
    if (!isUserVerified) return;

    const text = newCommentText[mediaId];
    if (!text || !text.trim()) return;

    try {
      const commentRef = collection(db, 'comments');
      await addDoc(commentRef, {
        targetId: mediaId,
        targetType: 'media',
        content: text.trim(),
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'User',
        userPhoto: user.photoURL || '',
        createdAt: new Date()
      });

      // Clear comment box
      setNewCommentText(prev => ({ ...prev, [mediaId]: '' }));
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'comments', user.uid);
    }
  };

  // Like / Unlike Media Logic
  const handleToggleLike = async (mediaItem: MediaItem) => {
    if (!user) return;
    if (!isUserVerified) return;

    const isLiked = mediaItem.likedBy?.includes(user.uid);
    const mediaDocRef = doc(db, 'media', mediaItem.id);

    try {
      if (isLiked) {
        await updateDoc(mediaDocRef, {
          likedBy: arrayRemove(user.uid),
          likesCount: Math.max(0, (mediaItem.likesCount || 1) - 1)
        });
      } else {
        await updateDoc(mediaDocRef, {
          likedBy: arrayUnion(user.uid),
          likesCount: (mediaItem.likesCount || 0) + 1
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `media/${mediaItem.id}`, user.uid);
    }
  };

  // Delete Media Logic (Only uploader or Admin)
  const handleDeleteMedia = async (mediaItem: MediaItem) => {
    if (!user) return;
    const canDelete = mediaItem.uploadedBy === user.uid || claims?.role === 'admin';
    if (!canDelete) return;

    

    try {
      // For simplicity in AI Studio preview we delete the metadata doc. 
      // The rules will allow uploader or admin to delete.
      const mediaDocRef = doc(db, 'media', mediaItem.id);
      await updateDoc(mediaDocRef, { deleted: true }); // soft delete so it disappears instantly
      // Or real delete
      // await deleteDoc(mediaDocRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `media/${mediaItem.id}`, user.uid);
    }
  };

  // Submit Feedback Logic
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!isUserVerified) return;

    if (!feedbackTitle.trim() || !feedbackDesc.trim()) return;

    try {
      const feedbackRef = collection(db, 'feedback');
      await addDoc(feedbackRef, {
        category: feedbackCategory,
        title: feedbackTitle.trim(),
        description: feedbackDesc.trim(),
        submittedBy: user.uid,
        submitterName: user.displayName || user.email?.split('@')[0] || 'Player',
        submitterEmail: user.email || '',
        status: 'pending',
        createdAt: new Date()
      });

      setFeedbackSuccess(true);
      setFeedbackTitle('');
      setFeedbackDesc('');
      setTimeout(() => setFeedbackSuccess(false), 5000);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'feedback', user.uid);
    }
  };

  // Helper to format file size
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Helper to get file type icon
  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-blue-500" />;
    if (contentType.startsWith('video/')) return <Video className="w-8 h-8 text-[#7B61FF]" />;
    if (contentType.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
    return <File className="w-8 h-8 text-gray-400" />;
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          E-Sports.pk <span className="text-[#1A73E8]">Community Hub</span>
        </h1>
        <p className="mt-3 text-lg text-gray-300">
          The ultimate space for Pakistani gamers. Upload rank proofs, share jaw-dropping game clips, write comments, and suggest features directly to our administration team.
        </p>
      </div>

      {/* Verification Guard banner */}
      {user && !isUserVerified && (
        <div className="bg-[#FFF4E5] border border-[#FFE0B2] text-[#B06000] p-6 rounded-2xl mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-pulse">
          <div className="flex gap-3 items-start">
            <ShieldAlert className="w-6 h-6 text-[#E65100] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-lg text-[#E65100]">Action Verification Required</h3>
              <p className="text-sm mt-1 text-[#823C00]">
                To safeguard the platform against spam, only **registered verified users** can upload files, write comments, or submit official feedback.
              </p>
            </div>
          </div>
          <button
            onClick={handleDevVerifyEmail}
            disabled={verificationLoading}
            className="bg-[#E65100] hover:bg-[#B33F00] text-white text-xs font-semibold px-4 py-2.5 rounded-full transition-colors whitespace-nowrap"
          >
            {verificationLoading ? "Verifying..." : "Verify Email (Dev Quick Pass)"}
          </button>
        </div>
      )}

      {/* Read-Only mode banner for unauthenticated users */}
      {!user && (
        <div className="bg-[#E8F0FE] border border-[#D2E3FC] text-[#1A73E8] p-6 rounded-2xl mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex gap-3 items-start">
            <Info className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-lg text-[#1967D2]">Join the E-Sports Pakistan Arena</h3>
              <p className="text-sm mt-1 text-[#1967D2]">
                You are currently viewing in guest mode. Sign up or log in to upload files, leave replies, and submit feedback.
              </p>
            </div>
          </div>
          <a
            href="/login"
            className="bg-[#1A73E8] hover:bg-[#1967D2] text-white text-xs font-semibold px-5 py-2.5 rounded-full transition-colors whitespace-nowrap inline-block text-center"
          >
            Login or Register &rarr;
          </a>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-8 gap-6">
        <button
          onClick={() => setActiveTab('media')}
          className={`pb-3.5 text-[15px] font-medium transition-colors relative ${
            activeTab === 'media' ? 'text-[#1A73E8] font-semibold border-b-2 border-[#1A73E8]' : 'text-gray-400 hover:text-white'
          }`}
        >
          Community Media & File Uploads
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`pb-3.5 text-[15px] font-medium transition-colors relative ${
            activeTab === 'feedback' ? 'text-[#1A73E8] font-semibold border-b-2 border-[#1A73E8]' : 'text-gray-400 hover:text-white'
          }`}
        >
          Official Platform Feedback Board
        </button>
      </div>

      {/* ACTIVE TAB: MEDIA & FILE UPLOADS */}
      {activeTab === 'media' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: File Upload Form (Sticky) */}
          <div className="lg:col-span-1">
            <div className="bg-transparent border border-white/10 rounded-2xl p-6 sticky top-24 shadow-sm">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#1A73E8]" /> Upload Community Files
              </h2>
              <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                Add game highlight videos, screenshots of tournament ranks, or guide documents. Maximum file size: **15MB**. Allowed: JPG, PNG, WEBP, MP4, PDF, ZIP.
              </p>

              <form onSubmit={handleFileUpload} className="space-y-4">
                {uploadError && (
                  <div className="bg-[#FDEDED] border border-[#F3B3B3] p-3 rounded-lg text-xs text-[#C62828] font-medium">
                    {uploadError}
                  </div>
                )}
                
                {uploadSuccess && (
                  <div className="bg-[#E6F4EA] border border-[#A3E2B5] p-3 rounded-lg text-xs text-[#137333] font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#137333]" /> File successfully uploaded and metadata logged!
                  </div>
                )}

                 <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-200">File Title</label>
                  <input
                    type="text"
                    required
                    value={fileTitle}
                    onChange={(e) => setFileTitle(e.target.value)}
                    disabled={!user || !isUserVerified}
                    className="w-full px-3.5 py-2 border border-white/10 bg-transparent rounded-lg text-sm text-white focus:ring-1 focus:ring-[#1A73E8] outline-none disabled:bg-white/5 disabled:text-gray-500"
                    placeholder="E.g., God of Destruction Rank Proof"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-200">Description (Optional)</label>
                  <textarea
                    rows={3}
                    value={fileDesc}
                    onChange={(e) => setFileDesc(e.target.value)}
                    disabled={!user || !isUserVerified}
                    className="w-full px-3.5 py-2 border border-white/10 bg-transparent rounded-lg text-sm text-white focus:ring-1 focus:ring-[#1A73E8] outline-none disabled:bg-white/5 disabled:text-gray-500 resize-none"
                    placeholder="Briefly describe what this file or clip contains..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-200">Choose File</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    disabled={!user || !isUserVerified}
                    className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#E8F0FE] file:text-[#1A73E8] hover:file:bg-[#D2E3FC] file:cursor-pointer disabled:opacity-50"
                  />
                </div>

                {uploadProgress !== null && (
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-semibold text-[#1A73E8]">
                      <span>Uploading to Firebase Storage...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-[#1A73E8] h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!user || !isUserVerified || uploadProgress !== null}
                  className="w-full bg-[#1A73E8] hover:bg-[#1967D2] text-white text-sm font-medium py-2.5 rounded-full transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <Upload className="w-4 h-4" /> Upload & Share
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: Media Stream / Feed */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-medium text-white flex items-center gap-2 mb-2">
              🎮 Community Submissions
            </h2>

            {mediaItems.length === 0 ? (
              <div className="bg-transparent border border-white/10 rounded-2xl p-12 text-center text-gray-400">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="font-semibold text-lg text-gray-200">No community uploads yet</p>
                <p className="text-sm mt-1">Be the first to upload and share your files with the Pakistan esports community!</p>
              </div>
            ) : (
              mediaItems.filter(item => !(item as any).deleted).map((item) => {
                const commentsList = comments[item.id] || [];
                const isExpanded = expandedComments[item.id];
                const hasLiked = user && item.likedBy?.includes(user.uid);
                const fileIsImage = item.contentType.startsWith('image/');
                const fileIsVideo = item.contentType.startsWith('video/');

                return (
                  <div key={item.id} className="bg-transparent border border-white/10 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    
                    {/* Submitter header */}
                    <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center bg-transparent">
                      <div className="flex items-center gap-3">
                        {item.uploaderPhoto ? (
                          <img src={item.uploaderPhoto} alt={item.uploaderName} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-sm">
                            {item.uploaderName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold text-sm text-white">{item.uploaderName}</h4>
                          <p className="text-[11px] text-gray-400">
                            {item.createdAt ? format(item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt), 'MMM d, yyyy • h:mm a') : 'Recent'}
                          </p>
                        </div>
                      </div>

                      {/* Delete button if owner or admin */}
                      {user && (item.uploadedBy === user.uid || claims?.role === 'admin') && (
                        <button
                          onClick={() => handleDeleteMedia(item)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Upload"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Submitter Body / File Preview */}
                    <div className="p-5 space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                          {getFileIcon(item.contentType)} {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-gray-300 mt-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Interactive preview box */}
                      <div className="border border-white/10 rounded-xl overflow-hidden bg-black/40 flex flex-col items-center justify-center min-h-[160px] relative">
                        {fileIsImage && (
                          <img 
                            src={item.url} 
                            alt={item.title} 
                            className="w-full max-h-[360px] object-contain cursor-pointer"
                            onClick={() => window.open(item.url, '_blank')}
                          />
                        )}

                        {fileIsVideo && (
                          <video 
                            src={item.url} 
                            controls 
                            className="w-full max-h-[360px] object-contain bg-black"
                          />
                        )}

                        {!fileIsImage && !fileIsVideo && (
                          <div className="p-6 text-center space-y-3 flex flex-col items-center">
                            {getFileIcon(item.contentType)}
                            <div>
                              <p className="font-semibold text-sm text-gray-200">{item.fileName}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{formatBytes(item.fileSize)}</p>
                            </div>
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 bg-transparent border border-white/10 hover:bg-white/10 text-[#00D4FF] text-xs font-semibold px-4 py-2 rounded-full transition-all shadow-sm"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Download File
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions panel */}
                    <div className="px-5 py-3 border-t border-b border-white/10 flex items-center gap-6 text-sm">
                      <button
                        onClick={() => handleToggleLike(item)}
                        disabled={!user || !isUserVerified}
                        className={`flex items-center gap-1.5 font-medium transition-colors ${
                          hasLiked ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600 disabled:opacity-50'
                        }`}
                      >
                        <ThumbsUp className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                        <span>{item.likesCount || 0} Likes</span>
                      </button>

                      <button
                        onClick={() => setExpandedComments(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                        className="flex items-center gap-1.5 text-gray-400 hover:text-[#1A73E8] font-medium"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{commentsList.length} Comments</span>
                      </button>
                    </div>

                    {/* Real-time Comments Box (Expandable) */}
                    {isExpanded && (
                      <div className="bg-transparent px-5 py-4 space-y-4">
                        
                        {/* List of comments */}
                        {commentsList.length === 0 ? (
                          <p className="text-xs text-gray-400 italic">No comments yet. Write the first reply!</p>
                        ) : (
                          <div className="space-y-3.5 max-h-[260px] overflow-y-auto pr-1">
                            {commentsList.map((c) => (
                              <div key={c.id} className="flex gap-2.5 items-start text-sm">
                                {c.userPhoto ? (
                                  <img src={c.userPhoto} alt={c.userName} className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5" />
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-blue-100 text-[#1A73E8] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                    {c.userName.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div className="bg-transparent border border-white/10 p-3 rounded-2xl flex-1">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold text-xs text-white">{c.userName}</span>
                                    <span className="text-[10px] text-gray-400">
                                      {c.createdAt ? format(c.createdAt.toDate ? c.createdAt.toDate() : new Date(c.createdAt), 'MMM d, h:mm a') : 'Recent'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap">{c.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Post Comment Input */}
                        {user && isUserVerified ? (
                          <div className="flex gap-2.5 items-center">
                            <input
                              type="text"
                              value={newCommentText[item.id] || ''}
                              onChange={(e) => setNewCommentText(prev => ({ ...prev, [item.id]: e.target.value }))}
                              placeholder="Add a public comment..."
                              className="flex-1 bg-transparent border border-white/10 px-4 py-2 rounded-full text-xs text-white focus:ring-1 focus:ring-[#1A73E8] outline-none"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handlePostComment(item.id);
                              }}
                            />
                            <button
                              onClick={() => handlePostComment(item.id)}
                              className="p-2 bg-[#00D4FF]/10 text-[#1A73E8] rounded-full hover:bg-[#1A73E8] hover:text-white transition-all shadow-sm"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <p className="text-[11px] text-gray-400 italic bg-transparent p-2.5 rounded-lg border border-white/10 text-center">
                            ⚠️ You must be a verified user to comment.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ACTIVE TAB: OFFICIAL PLATFORM FEEDBACK BOARD */}
      {activeTab === 'feedback' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Submit Feedback Form */}
          <div className="lg:col-span-1">
            <div className="bg-transparent border border-white/10 rounded-2xl p-6 sticky top-24 shadow-sm">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#7B61FF]" /> Submit Platform Feedback
              </h2>
              <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                We're building the future of esports in Pakistan together. Encountered a bug? Have a partner suggestion? Send it directly to our lead developer and administrative team.
              </p>

              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                {feedbackSuccess && (
                  <div className="bg-[#E6F4EA] border border-[#A3E2B5] p-3 rounded-lg text-xs text-[#137333] font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#137333]" /> Feedback posted and sent to admins!
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-200">Category</label>
                  <select
                    value={feedbackCategory}
                    onChange={(e: any) => setFeedbackCategory(e.target.value)}
                    disabled={!user || !isUserVerified}
                    className="w-full px-3.5 py-2 border border-white/10 bg-transparent rounded-lg text-sm text-white focus:ring-1 focus:ring-[#1A73E8] outline-none"
                  >
                    <option value="suggestion">💡 Suggestion & Idea</option>
                    <option value="bug">🐛 Report a Bug</option>
                    <option value="complaint">⚠️ Complaint</option>
                    <option value="partnership">💼 Sponsor & Partner Inquiry</option>
                    <option value="other">❓ Other Query</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-200">Topic / Summary</label>
                  <input
                    type="text"
                    required
                    value={feedbackTitle}
                    onChange={(e) => setFeedbackTitle(e.target.value)}
                    disabled={!user || !isUserVerified}
                    className="w-full px-3.5 py-2 border border-white/10 bg-transparent rounded-lg text-sm text-white focus:ring-1 focus:ring-[#1A73E8] outline-none disabled:bg-white/5 disabled:text-gray-500"
                    placeholder="Short summary of your feedback"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-200">Detailed Description</label>
                  <textarea
                    rows={4}
                    required
                    value={feedbackDesc}
                    onChange={(e) => setFeedbackDesc(e.target.value)}
                    disabled={!user || !isUserVerified}
                    className="w-full px-3.5 py-2 border border-white/10 bg-transparent rounded-lg text-sm text-white focus:ring-1 focus:ring-[#1A73E8] outline-none disabled:bg-white/5 disabled:text-gray-500 resize-none"
                    placeholder="Provide as much context as possible..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={!user || !isUserVerified}
                  className="w-full bg-[#7B61FF] hover:bg-[#6044FF] text-white text-sm font-medium py-2.5 rounded-full transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <Send className="w-4 h-4" /> Submit Feedback
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: Live Transparency Feedback Feed */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-medium text-white flex items-center gap-2 mb-2">
              📝 Transparency Board
            </h2>

            {!user || !isUserVerified ? (
              <div className="bg-transparent border border-white/10 rounded-2xl p-12 text-center text-gray-400">
                <ShieldAlert className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="font-semibold text-lg text-gray-200">Transparency Board Restricted</p>
                <p className="text-sm mt-1">
                  To protect public feedback privacy and respect database security, the Transparency Board is only visible to registered, email-verified users.
                </p>
              </div>
            ) : feedbackItems.length === 0 ? (
              <div className="bg-transparent border border-white/10 rounded-2xl p-12 text-center text-gray-400">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="font-semibold text-lg text-gray-200">No public feedback yet</p>
                <p className="text-sm mt-1">Be the first to submit a suggestion and help us improve E-Sports Pakistan!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedbackItems.map((item) => (
                  <div key={item.id} className="bg-transparent border border-white/10 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <div className="flex gap-2 items-center">
                        <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full uppercase tracking-wider ${
                          item.category === 'bug' ? 'bg-[#FDEDED] text-[#C62828] border border-[#F3B3B3]' :
                          item.category === 'partnership' ? 'bg-[#EAF5EA] text-[#137333] border border-[#C2EBC2]' :
                          'bg-[#E8F0FE] text-[#1A73E8] border border-white/10'
                        }`}>
                          {item.category === 'bug' ? '🐛 Bug' :
                           item.category === 'suggestion' ? '💡 Idea' :
                           item.category === 'complaint' ? '⚠️ Complaint' :
                           item.category === 'partnership' ? '💼 Partner' : '❓ Query'}
                        </span>
                        
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                          item.status === 'resolved' ? 'bg-[#E6F4EA] text-[#137333]' :
                          item.status === 'reviewed' ? 'bg-[#FEF7E0] text-[#B06000]' :
                          'bg-white/10 text-gray-300'
                        }`}>
                          {item.status || 'pending'}
                        </span>
                      </div>
                      
                      <span className="text-[11px] text-gray-400">
                        {item.createdAt ? format(item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt), 'MMM d, h:mm a') : 'Recent'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-semibold text-white text-base">{item.title}</h3>
                      <p className="text-sm text-gray-300 mt-1 leading-relaxed whitespace-pre-wrap">{item.description}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-gray-100 text-[11px] text-gray-400">
                      <span>Submitted by: <strong>{item.submitterName}</strong></span>
                      <span>•</span>
                      <span>Verified Player</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
