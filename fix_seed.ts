import fs from 'fs';

let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

const replacement = `  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      // Create random seeding arrays
      const games = [
        { gameId: 'tekken-8', game: 'Tekken 8', platform: 'PS5', color: '#E50914', icon: '🥊' },
        { gameId: 'pubg-mobile', game: 'PUBG Mobile', platform: 'Mobile', color: '#FF9900', icon: '📱' },
        { gameId: 'valorant', game: 'Valorant', platform: 'PC', color: '#FF4655', icon: '🔫' },
        { gameId: 'cs2', game: 'CS2', platform: 'PC', color: '#F4B41A', icon: '💣' }
      ];

      const cities = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad"];
      const firstNames = ["Ali", "Hassan", "Ahmed", "Usman", "Umar", "Zain", "Saad", "Bilal", "Hamza", "Faizan"];
      const lastNames = ["Khan", "Malik", "Shah", "Raza", "Hussain", "Iqbal", "Butt", "Qureshi", "Sheikh", "Chaudhry"];
      const nicknames = ["Demon", "Ghost", "Sniper", "Viper", "Ninja", "Slayer", "Shadow", "King", "Beast", "Falcon"];

      // Generate 10 Players
      for (let i = 0; i < 10; i++) {
        const game = games[Math.floor(Math.random() * games.length)];
        const city = cities[Math.floor(Math.random() * cities.length)];
        const nick = nicknames[Math.floor(Math.random() * nicknames.length)] + Math.floor(Math.random() * 100);
        
        const player = {
          userId: 'system_seed',
          isApproved: true,
          name: nick,
          game: game.game,
          gameId: game.gameId,
          platform: game.platform,
          city: city,
          bio: \`Professional \${game.game} player from \${city}.\`,
          icon: game.icon,
          color: game.color,
          availability: ['Lft', 'Signed', 'Open'][Math.floor(Math.random() * 3)],
          avatarUrl: \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${nick}\`,
          createdAt: new Date().toISOString()
        };
        await addDoc(collection(db, 'players'), player);
      }

      // Generate 5 Tournaments
      const tourneyStatus = ['upcoming', 'ongoing', 'completed'];
      for (let i = 0; i < 5; i++) {
        const game = games[Math.floor(Math.random() * games.length)];
        const status = tourneyStatus[Math.floor(Math.random() * tourneyStatus.length)];
        const maxTeams = [16, 32, 64][Math.floor(Math.random() * 3)];
        
        const tournament = {
          name: \`Pakistan \${game.game} Championship \${2026 - i}\`,
          game: game.game,
          gameId: game.gameId,
          platform: game.platform,
          prize: \`Rs. \${Math.floor(Math.random() * 10) * 100000 + 100000}\`,
          entryFee: Math.random() > 0.5 ? 'Free' : \`Rs. \${Math.floor(Math.random() * 5) * 500 + 500}\`,
          date: \`Dec \${10 + i} - Dec \${15 + i}, 2026\`,
          registeredCount: Math.floor(Math.random() * maxTeams),
          maxTeams: maxTeams,
          status: status,
          icon: game.icon,
          color: game.color,
          bannerUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80',
          createdAt: new Date().toISOString()
        };
        await addDoc(collection(db, 'tournaments'), tournament);
      }

      showNotification('success', 'Successfully populated 10 players and 5 tournaments!');
      fetchStats();
      loadActiveTabData();
    } catch (err: any) {
      showNotification('error', 'Seeding failed: ' + err.message);
    } finally {
      setIsSeeding(false);
    }
  };`;

content = content.replace(/  const handleSeedDatabase = async \(\) => \{[\s\S]*?setIsSeeding\(false\);\n    \}\n  \};/, replacement);
fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
