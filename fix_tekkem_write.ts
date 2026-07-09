import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc, initializeFirestore } from "firebase/firestore";
import fs from "fs";

const firebaseConfigData = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));
const app = initializeApp({
  apiKey: firebaseConfigData.apiKey,
  projectId: firebaseConfigData.projectId
});
const db = initializeFirestore(app, {}, firebaseConfigData.firestoreDatabaseId);

async function fix() {
  console.log("Checking sliders...");
  const slidersSnap = await getDocs(collection(db, "sliders"));
  for (const docSnap of slidersSnap.docs) {
    const data = docSnap.data();
    let updated = false;
    if (data.slides && Array.isArray(data.slides)) {
      const newSlides = data.slides.map((slide: any) => {
        if (slide.title && slide.title.includes("Tekkem 8")) {
          slide.title = slide.title.replace("Tekkem 8", "Tekken 8");
          updated = true;
        }
        return slide;
      });
      if (updated) {
        await updateDoc(doc(db, "sliders", docSnap.id), { slides: newSlides });
        console.log("Fixed slider:", docSnap.id);
      }
    }
  }

  console.log("Done");
  process.exit(0);
}
fix().catch((e) => { console.error(e); process.exit(1); });
