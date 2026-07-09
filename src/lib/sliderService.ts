import { db } from './firebase';
import { collection, getDocs, addDoc, setDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

export interface Slide {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
}

export interface Slider {
  id: string;
  title: string;
  status: 'draft' | 'published';
  slides: Slide[];
}

const SLIDERS_COLLECTION = 'sliders';

export async function getSliders(): Promise<Slider[]> {
  const q = query(collection(db, SLIDERS_COLLECTION), orderBy('title'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data() as Slider;
    if (data.slides) {
      data.slides = data.slides.map(slide => ({
        ...slide,
        title: slide.title ? slide.title.replace('Tekkem 8', 'Tekken 8') : slide.title
      }));
    }
    return { id: doc.id, ...data };
  });
}

export async function addSlider(slider: Omit<Slider, 'id'>) {
  return await addDoc(collection(db, SLIDERS_COLLECTION), slider);
}

export async function updateSlider(id: string, slider: Partial<Slider>) {
  await setDoc(doc(db, SLIDERS_COLLECTION, id), slider, { merge: true });
}

export async function deleteSlider(id: string) {
  await deleteDoc(doc(db, SLIDERS_COLLECTION, id));
}
