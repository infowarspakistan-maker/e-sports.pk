import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'motion/react';
import { ChevronLeft, ChevronRight, Play, Pause, Maximize2, Minimize2 } from 'lucide-react';

export interface SliderItem {
  id: string | number;
  image: string;
  title?: string;
  subtitle?: string;
  description?: string;
  link?: string;
  buttonText?: string;
  customContent?: React.ReactNode;
}

export interface SliderProps {
  items: SliderItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  showProgressBar?: boolean;
  showPlayPause?: boolean;
  showFullscreen?: boolean;
  transitionType?: 'slide' | 'fade' | 'scale' | 'blur' | 'glitch';
  transitionDuration?: number;
  className?: string;
  itemClassName?: string;
  overlayClassName?: string;
  onSlideChange?: (index: number) => void;
}

export const Slider: React.FC<SliderProps> = ({
  items,
  autoPlay = true,
  autoPlayInterval = 6000,
  showArrows = true,
  showDots = true,
  showProgressBar = true,
  showPlayPause = true,
  showFullscreen = true,
  transitionType = 'slide',
  transitionDuration = 0.6,
  className = '',
  itemClassName = '',
  overlayClassName = '',
  onSlideChange
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const progressAnimation = useAnimation();

  const slideVariants = {
    slide: {
      enter: (direction: number) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0,
        scale: 0.95
      }),
      center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
        scale: 1
      },
      exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? '100%' : '-100%',
        opacity: 0,
        scale: 0.95
      })
    },
    fade: {
      enter: { opacity: 0 },
      center: { zIndex: 1, opacity: 1 },
      exit: { zIndex: 0, opacity: 0 }
    },
    scale: {
      enter: { scale: 1.1, opacity: 0 },
      center: { zIndex: 1, scale: 1, opacity: 1 },
      exit: { zIndex: 0, scale: 0.9, opacity: 0 }
    },
    blur: {
      enter: { filter: 'blur(10px)', opacity: 0, scale: 1.05 },
      center: { zIndex: 1, filter: 'blur(0px)', opacity: 1, scale: 1 },
      exit: { zIndex: 0, filter: 'blur(10px)', opacity: 0, scale: 0.95 }
    },
    glitch: {
      enter: { x: direction > 0 ? 50 : -50, skewX: direction > 0 ? 10 : -10, opacity: 0 },
      center: { zIndex: 1, x: 0, skewX: 0, opacity: 1 },
      exit: { zIndex: 0, x: direction < 0 ? 50 : -50, skewX: direction < 0 ? 10 : -10, opacity: 0 }
    }
  };

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => {
      const next = (prev + 1) % items.length;
      if (onSlideChange) onSlideChange(next);
      return next;
    });
    setProgress(0);
  }, [items.length, onSlideChange]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => {
      const next = (prev - 1 + items.length) % items.length;
      if (onSlideChange) onSlideChange(next);
      return next;
    });
    setProgress(0);
  }, [items.length, onSlideChange]);

  const goToSlide = (index: number) => {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    if (onSlideChange) onSlideChange(index);
    setProgress(0);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let startTime = Date.now();
    let animationFrame: number;

    const updateProgress = () => {
      if (!isPlaying) return;
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / autoPlayInterval) * 100, 100);
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        nextSlide();
        startTime = Date.now();
      } else {
        animationFrame = requestAnimationFrame(updateProgress);
      }
    };

    if (isPlaying && items.length > 1) {
      animationFrame = requestAnimationFrame(updateProgress);
    }

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isPlaying, currentIndex, autoPlayInterval, nextSlide, items.length]);

  if (!items || items.length === 0) return null;

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden group bg-[#0A0A0F] ${isFullscreen ? 'w-full h-screen rounded-none' : 'rounded'} ${className}`}
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => autoPlay && setIsPlaying(true)}
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants[transitionType]}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: transitionDuration },
            scale: { duration: transitionDuration },
            filter: { duration: transitionDuration },
            skewX: { duration: transitionDuration * 0.5, type: "spring" }
          }}
          className={`absolute inset-0 w-full h-full ${itemClassName}`}
        >
          <img 
            src={items[currentIndex].image} 
            alt={items[currentIndex].title || `Slide ${currentIndex + 1}`}
            className="w-full h-full object-cover"
          />
          
          <div className={`absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/50 to-transparent flex flex-col justify-end p-8 md:p-16 ${overlayClassName}`}>
            {items[currentIndex].customContent ? (
              items[currentIndex].customContent
            ) : (
              <div className="max-w-4xl relative z-10">
                {items[currentIndex].subtitle && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: transitionDuration * 0.3 }}
                    className="flex items-center gap-2 mb-4"
                  >
                    <span className="px-3 py-1 bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30 rounded text-[10px] font-mono font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(0,212,255,0.2)]">
                      {items[currentIndex].subtitle}
                    </span>
                  </motion.div>
                )}
                {items[currentIndex].title && (
                  <motion.h2 
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: transitionDuration * 0.4, type: 'spring', damping: 20 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-display font-extrabold text-white mb-4 leading-none tracking-tighter uppercase [text-shadow:_0_4px_30px_rgba(0,0,0,0.8)]"
                  >
                    {items[currentIndex].title}
                  </motion.h2>
                )}
                {items[currentIndex].description && (
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: transitionDuration * 0.5 }}
                    className="text-lg md:text-xl text-[#A0A0AB] mb-8 font-body max-w-2xl leading-relaxed"
                  >
                    {items[currentIndex].description}
                  </motion.p>
                )}
                {items[currentIndex].link && (
                  <motion.a 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: transitionDuration * 0.6 }}
                    href={items[currentIndex].link}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-[#121B2A] hover:bg-[#00D4FF] text-white hover:text-black border-none text-sm font-mono font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(0,212,255,0.1)] hover:shadow-[0_0_25px_rgba(0,212,255,0.5)] group cyber-button"
                  >
                    {items[currentIndex].buttonText || 'Learn More'} 
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.a>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Advanced Controls Layer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col gap-6 pointer-events-none z-20">
        
        {/* Top bar of controls: Arrows, Play/Pause, Fullscreen */}
        <div className="flex items-end justify-between pointer-events-auto">
          {/* Navigation Arrows */}
          {showArrows && items.length > 1 && (
            <div className="flex items-center gap-3">
              <button 
                onClick={prevSlide}
                className="w-12 h-12 rounded bg-black/40 hover:bg-[#00D4FF] border border-white/10 hover:border-[#00D4FF] text-white hover:text-black flex items-center justify-center backdrop-blur-md transition-all shadow-[0_4px_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(0,212,255,0.4)]"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={nextSlide}
                className="w-12 h-12 rounded bg-black/40 hover:bg-[#00D4FF] border border-white/10 hover:border-[#00D4FF] text-white hover:text-black flex items-center justify-center backdrop-blur-md transition-all shadow-[0_4px_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(0,212,255,0.4)]"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-4">
            {/* Play/Pause & Fullscreen Tools */}
            <div className="flex items-center gap-2 bg-black/40 border border-white/10 p-1 rounded backdrop-blur-md shadow-[0_4px_15px_rgba(0,0,0,0.5)]">
              {showPlayPause && items.length > 1 && (
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 flex items-center justify-center text-[#A0A0AB] hover:text-[#00D4FF] hover:bg-white/5 rounded transition-all"
                  title={isPlaying ? "Pause autoplay" : "Start autoplay"}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-1" />}
                </button>
              )}
              {showFullscreen && (
                <button 
                  onClick={toggleFullscreen}
                  className="w-10 h-10 flex items-center justify-center text-[#A0A0AB] hover:text-[#00D4FF] hover:bg-white/5 rounded transition-all"
                  title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              )}
            </div>
            
            {/* Dots */}
            {showDots && items.length > 1 && (
              <div className="hidden md:flex gap-3 bg-black/40 px-4 py-3 rounded backdrop-blur-md border border-white/10 shadow-[0_4px_15px_rgba(0,0,0,0.5)]">
                {items.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    className="relative group py-1"
                    aria-label={`Go to slide ${idx + 1}`}
                  >
                    <span className={`block transition-all duration-500 rounded ${
                      idx === currentIndex 
                        ? 'w-8 h-1.5 bg-[#00D4FF] shadow-[0_0_10px_rgba(0,212,255,0.5)]' 
                        : 'w-4 h-1 bg-white/20 group-hover:bg-white/50'
                    }`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Linear Progress Bar for Autoplay */}
        {showProgressBar && items.length > 1 && (
          <div className="w-full h-1 bg-white/10 rounded overflow-hidden mt-2 pointer-events-auto shadow-[0_0_10px_rgba(0,0,0,0.5)]">
            <div 
              className="h-full bg-gradient-to-r from-[#00D4FF] to-[#7B61FF]"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

