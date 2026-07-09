import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, initializeFirestore } from 'firebase/firestore';
import firebaseConfigData from "./firebase-applet-config.json" assert { type: "json" };

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true }, firebaseConfigData.firestoreDatabaseId);

const games = [
  { gameId: 'tekken-8', game: 'Tekken 8', platform: 'PS5', color: '#E50914' },
  { gameId: 'pubg-mobile', game: 'PUBG Mobile', platform: 'Mobile', color: '#FF9900' },
  { gameId: 'valorant', game: 'Valorant', platform: 'PC', color: '#FF4655' },
  { gameId: 'cs2', game: 'CS2', platform: 'PC', color: '#F4B41A' }
];

const cities = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad"];

const firstNames = ["Ali", "Hassan", "Ahmed", "Usman", "Umar", "Zain", "Saad", "Bilal", "Hamza", "Faizan"];
const lastNames = ["Khan", "Malik", "Shah", "Raza", "Hussain", "Iqbal", "Butt", "Qureshi", "Sheikh", "Chaudhry"];
const nicknames = ["Demon", "Ghost", "Sniper", "Viper", "Ninja", "Slayer", "Shadow", "King", "Beast", "Falcon"];

async function seed() {
  console.log("Seeding started...");

  for (let i = 0; i < 10; i++) {
    const game = games[Math.floor(Math.random() * games.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const nick = nicknames[Math.floor(Math.random() * nicknames.length)];
    
    const player = {
      name: `${nick}`,
      fullName: `${fName} ${lName}`,
      isApproved: true,
      game: game.game,
      gameId: game.gameId,
      platform: game.platform,
      city: city,
      countryCode: 'pk',
      bio: `Professional ${game.game} player from ${city}.`,
      availability: ['Lft', 'Signed', 'Open'][Math.floor(Math.random() * 3)],
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${nick}${i}`,
      bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80',
      youtubeUrl: '',
      color: game.color,
      teamId: '',
      teamName: '',
      sponsors: [],
      achievements: ['Won Regional Championship', 'Top 50 Asia Server'],
      gamesList: [{
        gameId: game.gameId,
        gameName: game.game,
        rank: 'Diamond',
        matchesPlayed: Math.floor(Math.random() * 500) + 100,
        winRate: Math.floor(Math.random() * 40) + 50,
        prizeWon: Math.floor(Math.random() * 50000)
      }],
      rating: Math.floor(Math.random() * 30) + 70,
      skillStats: {
        str: Math.floor(Math.random() * 40) + 60,
        spd: Math.floor(Math.random() * 40) + 60,
        pmk: Math.floor(Math.random() * 40) + 60,
        phy: Math.floor(Math.random() * 40) + 60,
        def: Math.floor(Math.random() * 40) + 60,
        clu: Math.floor(Math.random() * 40) + 60
      },
      createdAt: new Date().toISOString()
    };
    
    await addDoc(collection(db, 'players'), player);
    console.log(`Added player: ${nick}`);
  }

  const tourneyStatus = ['upcoming', 'ongoing', 'completed'];
  for (let i = 0; i < 5; i++) {
    const game = games[Math.floor(Math.random() * games.length)];
    const status = tourneyStatus[Math.floor(Math.random() * tourneyStatus.length)];
    
    const maxTeams = [16, 32, 64][Math.floor(Math.random() * 3)];
    const regCount = status === 'completed' ? maxTeams : Math.floor(Math.random() * maxTeams);
    
    const tournament = {
      name: `Pakistan ${game.game} Championship ${2026 - i}`,
      game: game.game,
      gameId: game.gameId,
      platform: game.platform,
      prize: `Rs. ${Math.floor(Math.random() * 10) * 100000 + 100000}`,
      entryFee: Math.random() > 0.5 ? 'Free' : `Rs. ${Math.floor(Math.random() * 5) * 500 + 500}`,
      date: `Dec ${10 + i} - Dec ${15 + i}, 2026`,
      registeredCount: regCount,
      maxTeams: maxTeams,
      status: status,
      bannerUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80',
      rules: ['Standard competitive rules apply', 'Age requirement: 16+'],
      registeredTeamsList: [],
      createdAt: new Date().toISOString()
    };
    
    await addDoc(collection(db, 'tournaments'), tournament);
    console.log(`Added tournament: ${tournament.name}`);
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch(console.error);
