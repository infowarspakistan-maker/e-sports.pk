import { db } from './firebase';
import { 
  collection, getDocs, doc, setDoc, addDoc, updateDoc, deleteDoc, query, orderBy 
} from 'firebase/firestore';
import { SUPPORTED_GAMES } from './constants';

export interface Game {
  id: string; // Used as Slug
  name: string;
  category: string;
  icon: string; // Emoji or Icon image URL
  color: string;
  banner?: string; // Large banner image URL
  image?: string; // Medium featured card image URL
  description?: string;
  platforms?: string[];
  developer?: string;
  publisher?: string;
  releaseDate?: string;
  websiteUrl?: string;
  matchFormat?: string;
  createdAt?: any;
}

const GAMES_COLLECTION = 'games';

/**
 * Fetch all games from Firestore.
 * If the collection is empty, automatically seed it with default SUPPORTED_GAMES
 * to provide a beautiful, pre-populated out-of-the-box experience.
 */
export async function getDynamicGames(): Promise<Game[]> {
  try {
    const q = query(collection(db, GAMES_COLLECTION));
    const snap = await getDocs(q);
    
    if (snap.empty) {
      // Automatic seeding of constant games into Firestore
      const seededGames: Game[] = [];
      for (const sg of SUPPORTED_GAMES) {
        const gameData: Game = {
          id: sg.id,
          name: sg.name,
          category: sg.category,
          icon: sg.icon,
          color: sg.color,
          banner: sg.banner || `https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop`, // Polished default banner
          image: sg.image || `https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop`,  // Use game specific image if available
          description: `Active professional and grassroots competitive arena for ${sg.name} in Pakistan. Join tournaments, register rosters, and claim glory.`,
          platforms: sg.id === 'pubg-mobile' || sg.id === 'free-fire' 
            ? ['mobile', 'tablet'] 
            : sg.category === 'fighting' 
            ? ['ps5', 'ps4', 'pc'] 
            : ['pc'],
          createdAt: new Date()
        };
        await setDoc(doc(db, GAMES_COLLECTION, sg.id), gameData);
        seededGames.push(gameData);
      }
      return seededGames;
    }

    return snap.docs.map(doc => {
      const data = doc.data() as Game;
      if (data.name && data.name.includes('Tekkem 8')) {
        data.name = data.name.replace('Tekkem 8', 'Tekken 8');
      }
      return {
        id: doc.id,
        ...data
      };
    });
  } catch (err) {
    console.warn("Failed to retrieve games from Firestore, falling back to static constants:", err);
    // Fallback if anything goes wrong
    return SUPPORTED_GAMES.map(sg => ({
      id: sg.id,
      name: sg.name,
      category: sg.category,
      icon: sg.icon,
      image: sg.image,
      banner: sg.banner,
      color: sg.color,
      description: `E-Sports arena for ${sg.name}.`,
      platforms: ['pc']
    }));
  }
}

/**
 * Add a new game to the ecosystem.
 */
export async function addGame(game: Omit<Game, 'createdAt'>): Promise<void> {
  const cleanId = game.id.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
  if (!cleanId) throw new Error("Invalid game ID or slug.");
  
  await setDoc(doc(db, GAMES_COLLECTION, cleanId), {
    ...game,
    id: cleanId,
    createdAt: new Date()
  });
}

/**
 * Update an existing game.
 */
export async function updateGame(gameId: string, gameData: Partial<Game>): Promise<void> {
  const gameRef = doc(db, GAMES_COLLECTION, gameId);
  await updateDoc(gameRef, {
    ...gameData,
    updatedAt: new Date()
  });
}

/**
 * Delete a game.
 */
export async function deleteGame(gameId: string): Promise<void> {
  await deleteDoc(doc(db, GAMES_COLLECTION, gameId));
}
