import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfigData from "./firebase-applet-config.json" assert { type: "json" };

try {
  const app = initializeApp({
    projectId: firebaseConfigData.projectId
  });
  const db = getFirestore(app, firebaseConfigData.firestoreDatabaseId);
  db.collection('test').add({ test: true }).then(() => console.log('success')).catch(e => console.error(e));
} catch (e) {
  console.error(e);
}
