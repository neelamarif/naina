import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Heart } from 'lucide-react';

import { Background } from './components/Background';
import { CursorTrail } from './components/CursorTrail';
import { MusicPlayer } from './components/MusicPlayer';
import { SuccessModal } from './components/SuccessModal';

export default function App() {
  const [noBtnPosition, setNoBtnPosition] = useState({ x: 0, y: 0 });
  const [isNoBtnAbsolute, setIsNoBtnAbsolute] = useState(false);
  const [noHoverCount, setNoHoverCount] = useState(0);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Messages for the "No" button
  const noMessages = [
    "NO 🙈",
    "Are you sure? 🥺",
    "Think again... 💕",
    "Don't break my heart 💔",
    "Not an option! 😤",
    "Try the other one! 💖"
  ];

  const currentNoText = noMessages[Math.min(noHoverCount, noMessages.length - 1)];

  const moveNoButton = useCallback(() => {
    // Calculate random position within viewport, keeping padding
    const x = Math.random() * (window.innerWidth - 150); // width of button approx
    const y = Math.random() * (window.innerHeight - 100); // height of button approx
    
    setIsNoBtnAbsolute(true);
    setNoBtnPosition({ x, y });
    setNoHoverCount(prev => prev + 1);
  }, []);

  const handleYesClick = () => {
    // Trigger confetti
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ffccd5', '#ffb3c1', '#ff8fa3', '#fff0f3']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ffccd5', '#ffb3c1', '#ff8fa3', '#fff0f3']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    setIsSuccessOpen(true);
    // Auto play music if not already playing (with user gesture this usually works)
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-pink-200 via-rose-100 to-orange-100 flex items-center justify-center">
      {/* Background Effects */}
      <Background />
      <CursorTrail />
      
      {/* Music Control */}
      <div className="absolute top-4 right-4 z-50">
        <MusicPlayer isPlaying={isPlaying} onToggle={() => setIsPlaying(!isPlaying)} />
      </div>

      {/* Main Card */}
      <AnimatePresence>
        {!isSuccessOpen && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="z-10 relative bg-white/40 backdrop-blur-md border border-white/60 p-8 md:p-12 rounded-3xl shadow-xl max-w-lg w-full text-center m-4"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex justify-center mb-6">
                <Heart className="w-16 h-16 text-rose-500 fill-rose-500 drop-shadow-lg" />
              </div>
            </motion.div>

            <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-8 drop-shadow-sm leading-tight">
              Naina, will you be my Valentine?
            </h1>

            <div className="flex flex-col md:flex-row gap-6 justify-center items-center h-24 relative">
              {/* YES Button */}
              <motion.button
                whileHover={{ scale: 1.1, boxShadow: "0px 0px 20px rgba(244, 63, 94, 0.6)" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleYesClick}
                className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-8 rounded-full text-xl transition-colors duration-300 shadow-lg"
              >
                YES 💖
              </motion.button>

              {/* NO Button */}
              <motion.button
                onMouseEnter={moveNoButton}
                onClick={moveNoButton} // For mobile touch support
                animate={isNoBtnAbsolute ? { 
                  position: 'fixed',
                  left: noBtnPosition.x, 
                  top: noBtnPosition.y 
                } : {}}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-full text-xl shadow-lg whitespace-nowrap z-50"
              >
                {currentNoText}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Popup */}
      <AnimatePresence>
        {isSuccessOpen && (
          <SuccessModal onClose={() => setIsSuccessOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}