import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import firebaseConfigData from "../../firebase-applet-config.json";

export interface CustomStorageConfig {
  useCustom: boolean;
  type: 'bucket_only' | 'full_credentials';
  bucketName: string;
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

// Extract default properties
const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true
}, firebaseConfigData.firestoreDatabaseId);

// ----------------------------------------------------
// Dynamic / Cross-Account Firebase Storage Integration
// ----------------------------------------------------

const CACHE_KEY = "esports_pk_custom_storage_v1";

// Helper to instantiate storage from a custom config
function createStorageInstance(config: CustomStorageConfig) {
  if (!config || !config.useCustom) {
    return getStorage(app);
  }

  try {
    if (config.type === 'bucket_only' && config.bucketName) {
      // Return storage connected to a custom bucket URL on the default app.
      // Robustly strip gs:// and any path suffixes (e.g. /e-sports/Games) to prevent invalid bucket errors.
      const cleanBucket = config.bucketName.trim().replace(/^gs:\/\//, '').split('/')[0];
      return getStorage(app, `gs://${cleanBucket}`);
    } else if (config.type === 'full_credentials') {
      const secondaryAppName = "esports_pk_secondary_storage_app";
      let secondaryApp;
      const cleanBucket = (config.storageBucket || '').trim().replace(/^gs:\/\//, '').split('/')[0];
      try {
        secondaryApp = getApp(secondaryAppName);
      } catch (e) {
        secondaryApp = initializeApp({
          apiKey: config.apiKey || '',
          authDomain: config.authDomain || '',
          projectId: config.projectId || '',
          storageBucket: cleanBucket,
          messagingSenderId: config.messagingSenderId || '',
          appId: config.appId || '',
        }, secondaryAppName);
      }
      return getStorage(secondaryApp);
    }
  } catch (err) {
    console.error("Failed to initialize custom Firebase storage:", err);
  }

  return getStorage(app);
}

// 1. Synchronous loading from localStorage cache for instant UI responsiveness
let cachedConfig: CustomStorageConfig | null = null;
if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      cachedConfig = JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to read cached storage config:", e);
  }
}

// Export storage as a live binding
export let storage = cachedConfig ? createStorageInstance(cachedConfig) : getStorage(app);

// Keep track of any active subscription callbacks when storage is swapped
const storageChangeListeners: Array<(newStorage: any) => void> = [];

export function subscribeToStorageChange(callback: (newStorage: any) => void) {
  storageChangeListeners.push(callback);
  return () => {
    const idx = storageChangeListeners.indexOf(callback);
    if (idx > -1) storageChangeListeners.splice(idx, 1);
  };
}

// Helper to update custom storage config programmatically (e.g., from Admin dashboard)
export async function updateCustomStorageConfig(config: CustomStorageConfig) {
  // Update local binding
  storage = createStorageInstance(config);
  
  // Cache in localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem(CACHE_KEY, JSON.stringify(config));
  }

  // Save to Firestore for persistent database sync (Cloud persistence)
  try {
    const settingsRef = doc(db, "system_settings", "storage");
    await setDoc(settingsRef, {
      ...config,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error("Failed to save storage config to cloud Firestore:", err);
  }

  // Notify listeners
  storageChangeListeners.forEach(cb => cb(storage));
}

// 2. Asynchronous cloud synchronization to fetch updates from Firestore
async function syncStorageConfigFromCloud() {
  try {
    const settingsRef = doc(db, "system_settings", "storage");
    const snap = await getDoc(settingsRef);
    if (snap.exists()) {
      const cloudConfig = snap.data() as CustomStorageConfig;
      
      // Compare with cached config to avoid unnecessary re-init
      const cachedStr = cachedConfig ? JSON.stringify(cachedConfig) : "";
      // Strip any Firestore metadata fields like updatedAt before comparing
      const cloudConfigClean = { ...cloudConfig };
      delete (cloudConfigClean as any).updatedAt;
      const cloudStr = JSON.stringify(cloudConfigClean);

      if (cachedStr !== cloudStr) {
        console.log("Syncing updated Firebase Storage configuration from cloud database...");
        storage = createStorageInstance(cloudConfig);
        cachedConfig = cloudConfig;
        if (typeof window !== "undefined") {
          localStorage.setItem(CACHE_KEY, JSON.stringify(cloudConfigClean));
        }
        storageChangeListeners.forEach(cb => cb(storage));
      }
    }
  } catch (err) {
    console.warn("Failed to sync Firebase Storage configuration from Cloud:", err);
  }
}

// Trigger background cloud sync after thread clears
if (typeof window !== "undefined") {
  setTimeout(() => {
    syncStorageConfigFromCloud();
  }, 1000);
}
