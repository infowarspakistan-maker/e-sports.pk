import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import firebaseConfigData from "./firebase-applet-config.json" assert { type: "json" };

const app = initializeApp(firebaseConfigData);
const auth = getAuth(app);
signInAnonymously(auth).then(() => console.log("Success")).catch(console.error);
