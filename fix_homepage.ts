import fs from 'fs';
let content = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

content = content.replace(
  /<Slider \s*items=\{dynamicSliderItems\}[\s\S]*?showFullscreen=\{false\}\s*\/>/m,
  `<Slider 
          items={dynamicSliderItems}
          autoPlay={true}
          autoPlayInterval={7000}
          transitionType="glitch"
          transitionDuration={0.8}
          className="w-full h-full rounded-none"
          overlayClassName="from-[#0A0A0F] via-[#0A0A0F]/60 to-transparent"
          showFullscreen={false}
          showDots={false}
          showProgressBar={false}
        />
        
        {/* Game Activity Hub (Marquee Row) */}
        <div className="absolute top-0 left-0 w-full z-20 pointer-events-none">
          <style>{\`
            .game-card-hover:hover { border-color: var(--hover-color) !important; box-shadow: 0 0 20px var(--hover-color); }
            .mask-edges { mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); }
          \`}</style>
          <div className="w-full overflow-hidden mask-edges py-0 pointer-events-auto">
            <motion.div 
              className="flex gap-4 w-max px-4"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 40, ease: "linear", repeat: Infinity }}
            >
              {(() => {
                const displayGames = games.length > 0 ? games : SUPPORTED_GAMES;
                return [...displayGames, ...displayGames, ...displayGames].map((game, i) => (
                  <Link 
                    to={\`/game/\${game.id}\`} 
                    key={\`\${game.id}-\${i}\`} 
                    className="w-[180px] h-[240px] shrink-0 premium-gaming-card relative overflow-hidden group transition-all duration-300 cursor-pointer game-card-hover border border-white/10 rounded-xl flex items-end p-5" 
                    style={{ '--hover-color': game.color } as React.CSSProperties}
                  >
                    <img 
                      src={game.image} 
                      alt={game.name} 
                      className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale-[50%] group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
                    <div className="relative z-20 w-full transform group-hover:-translate-y-2 transition-transform duration-300"> 
                       <div className="flex items-center gap-2 mb-2">
                          <span className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: game.color, color: game.color }}></span>
                          <span className="text-[8px] font-mono font-bold text-white/70 uppercase tracking-widest">{game.category.replace('_', ' ')}</span>
                       </div>
                       <span className="font-display font-black text-sm uppercase tracking-tight text-white leading-tight group-hover:text-white transition-colors drop-shadow-md">{game.name}</span>
                       {game.matchFormat && (
                         <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                           <span className="text-[8px] font-mono text-[#A0A0AB] uppercase tracking-widest border border-white/10 px-1.5 py-0.5 rounded bg-black/50">{game.matchFormat}</span>
                         </div>
                       )}
                    </div>
                  </Link>
                ));
              })()}
            </motion.div>
          </div>
        </div>`
);

// Remove the old marquee section
const marqueeSectionRegex = /\{\/\* Game Activity Hub \(Marquee Row\) \*\/\}\s*<section className="w-full py-12 relative z-10 bg-black\/40 border-y border-white\/5">[\s\S]*?<\/section>/m;
content = content.replace(marqueeSectionRegex, '');

fs.writeFileSync('src/pages/HomePage.tsx', content);
