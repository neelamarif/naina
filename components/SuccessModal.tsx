import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface SuccessModalProps {
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);
  
  // Animation Triggers
  const [isHugging, setIsHugging] = useState(false);
  const [showFlower, setShowFlower] = useState(false);

  // Refs for manual DOM manipulation (Performance)
  const containerRef = useRef<HTMLDivElement>(null);
  const leftTeddyRef = useRef<HTMLImageElement>(null);
  const rightTeddyRef = useRef<HTMLImageElement>(null);
  const maleTeddyRef = useRef<HTMLImageElement>(null);
  
  // Mutable state for animation frame loop
  const animState = useRef({
    leftX: -200,
    rightX: 1000,
    maleX: -250,
    animationId: 0
  });

  // STEP 1: WALK & HUG LOGIC
  useEffect(() => {
    if (step === 1) {
      const container = containerRef.current;
      if (!container) return;

      const width = container.clientWidth;
      
      // Initialize positions
      animState.current.leftX = -200;
      animState.current.rightX = width + 200;
      
      // Target center (approximate center minus half teddy width)
      const targetXLeft = width / 2 - 70; // Stop slightly left of center
      const targetXRight = width / 2 - 50; // Stop slightly right of center

      let lastTime = performance.now();

      const animateWalk = (time: number) => {
        // Calculate delta time in seconds
        const deltaTime = Math.min((time - lastTime) / 1000, 0.1);
        lastTime = time;

        // Frame-independent easing (Exponential decay)
        const decay = 3.0; 
        const factor = 1 - Math.exp(-decay * deltaTime);

        const currentLeft = animState.current.leftX;
        const currentRight = animState.current.rightX;

        // LERP towards target
        const newLeft = currentLeft + (targetXLeft - currentLeft) * factor;
        const newRight = currentRight + (targetXRight - currentRight) * factor;

        animState.current.leftX = newLeft;
        animState.current.rightX = newRight;

        // Apply transforms
        if (leftTeddyRef.current) {
          leftTeddyRef.current.style.transform = `translateX(${newLeft}px) scaleX(1)`;
        }
        if (rightTeddyRef.current) {
          // Right teddy is flipped locally via CSS, but we move it via X
          rightTeddyRef.current.style.transform = `translateX(${newRight}px) scaleX(-1)`;
        }

        // Check distance to target (threshold 2px)
        const distLeft = Math.abs(targetXLeft - newLeft);
        const distRight = Math.abs(targetXRight - newRight);

        if (distLeft < 2 && distRight < 2) {
           // Snap to exact target to prevent micro-jitters
           if (leftTeddyRef.current) leftTeddyRef.current.style.transform = `translateX(${targetXLeft}px) scaleX(1)`;
           if (rightTeddyRef.current) rightTeddyRef.current.style.transform = `translateX(${targetXRight}px) scaleX(-1)`;

           setIsHugging(true);
           
           // AUTO ADVANCE: Go to Step 2 after 2 seconds of hugging
           setTimeout(() => {
             setStep(2);
           }, 2000);
           
           // Stop loop
           cancelAnimationFrame(animState.current.animationId);
        } else {
           // Continue loop
           animState.current.animationId = requestAnimationFrame(animateWalk);
        }
      };

      // Start Loop
      animState.current.animationId = requestAnimationFrame(animateWalk);

      return () => cancelAnimationFrame(animState.current.animationId);
    }
  }, [step]);

  // STEP 2: MALE TEDDY & FLOWER LOGIC
  useEffect(() => {
    if (step === 2) {
      const container = containerRef.current;
      if (!container) return;

      const width = container.clientWidth;
      
      // Init Male Position
      animState.current.maleX = -250;
      
      // Target: Left side of the hugging couple
      const targetX = width / 2 - 130; 
      
      let lastTime = performance.now();

      const animateMale = (time: number) => {
        const deltaTime = Math.min((time - lastTime) / 1000, 0.1);
        lastTime = time;
        
        const decay = 2.5;
        const factor = 1 - Math.exp(-decay * deltaTime);

        const currentX = animState.current.maleX;
        const newX = currentX + (targetX - currentX) * factor;

        animState.current.maleX = newX;

        if (maleTeddyRef.current) {
          maleTeddyRef.current.style.transform = `translateX(${newX}px)`;
        }

        // Check completion
        if (Math.abs(targetX - newX) < 1) {
           // Snap final position
           if (maleTeddyRef.current) {
             maleTeddyRef.current.style.transform = `translateX(${targetX}px) rotate(10deg)`;
             maleTeddyRef.current.style.transition = "transform 0.5s ease"; // Switch to CSS transition for rotation
           }
           setShowFlower(true);
           cancelAnimationFrame(animState.current.animationId);
        } else {
           animState.current.animationId = requestAnimationFrame(animateMale);
        }
      };

      animState.current.animationId = requestAnimationFrame(animateMale);
      return () => cancelAnimationFrame(animState.current.animationId);
    }
  }, [step]);

  const handleRestart = () => {
    setIsHugging(false);
    setShowFlower(false);
    setStep(0);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <style>{`
        @keyframes bounce-hug {
          0%, 100% { transform: scale(1.1); }
          50% { transform: scale(1.15) translateY(-10px); }
        }
        @keyframes float-heart {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-100px) scale(1.2); opacity: 0; }
        }
        @keyframes flower-pop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.4); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-hug {
          animation: bounce-hug 2s infinite ease-in-out;
        }
        .animate-flower-pop {
          animation: flower-pop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-pink-900/60 backdrop-blur-md"
      />

      <div 
        ref={containerRef}
        className="relative w-full max-w-3xl h-[550px] bg-white/95 rounded-3xl shadow-2xl overflow-hidden flex flex-col items-center justify-center border-4 border-pink-200"
      >
        
        {/* STEP 0: INITIAL MESSAGE */}
        {step === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-20 bg-white/95"
          >
             <img 
                src="https://media.tenor.com/gUiu1zyxfzYAAAAi/bear-kiss-bear-kisses.gif" 
                alt="Cute kissing bears" 
                className="w-48 h-48 object-contain mb-4 rounded-2xl drop-shadow-md"
            />
            
            <h2 className="text-3xl md:text-4xl font-extrabold text-rose-600 mb-4 font-serif">
                Naina…
            </h2>
            <p className="text-gray-700 text-lg md:text-xl mb-8 font-medium leading-relaxed">
                You are my today,<br/>
                and every tomorrow I dream of.<br/>
                I don’t need perfect moments.<br/>
                I just need you in them. 💕 💖
            </p>
            
            <div className="flex items-center gap-4">
              <button
                  onClick={onClose}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2 px-6 rounded-full shadow-sm transition-all"
              >
                  <ArrowLeft size={18} />
                  Back
              </button>
              <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 px-8 rounded-full shadow-md hover:shadow-lg transition-all transform hover:scale-105"
              >
                  Surprise ✨
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 1 & 2: ANIMATION CANVAS */}
        {(step === 1 || step === 2) && (
          <div className="absolute inset-0 w-full h-full bg-pink-50 relative overflow-hidden">
             
             {/* Background Atmosphere */}
             <div className="absolute top-10 left-10 text-4xl opacity-20 animate-bounce delay-1000">☁️</div>
             <div className="absolute top-24 right-24 text-3xl opacity-20 animate-bounce delay-2000">✨</div>
             
             {/* --- MOVING WALKING TEDDIES (Visible until Hug) --- */}
             <div className={`${isHugging ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
               {/* Left Teddy */}
               <img 
                 ref={leftTeddyRef}
                 src="https://media.tenor.com/N2sH8-r22r8AAAAi/milk-and-mocha-hello.gif"
                 className="absolute bottom-24 w-32 h-32 object-contain left-0"
                 alt="Walking Bear Left"
                 style={{ transform: 'translateX(-200px)' }} // Init pos
               />
               
               {/* Right Teddy */}
               <img 
                 ref={rightTeddyRef}
                 src="https://media.tenor.com/S56Q7Xh_u4sAAAAi/milk-and-mocha-bear.gif"
                 className="absolute bottom-24 w-32 h-32 object-contain left-0"
                 alt="Walking Bear Right"
                 style={{ transform: 'translateX(1000px) scaleX(-1)' }} // Init pos
               />
             </div>

             {/* --- HUGGING SCENE (Visible after walk finishes) --- */}
             <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ${isHugging ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                 <div className="relative mb-20">
                    <img 
                        src="https://media.tenor.com/J7e9j0PlD-IAAAAi/bear-hug-mochi.gif" 
                        className="w-64 h-64 object-contain animate-bounce-hug drop-shadow-2xl"
                        alt="Hugging Bears"
                    />
                    
                    {/* Floating Hearts Particles */}
                    {isHugging && (
                      <>
                        <div className="absolute -top-10 -left-10 text-3xl animate-[float-heart_3s_linear_infinite]">💖</div>
                        <div className="absolute -top-16 left-10 text-2xl animate-[float-heart_2.5s_linear_infinite_0.5s]">💕</div>
                        <div className="absolute -top-5 right-10 text-4xl animate-[float-heart_3.5s_linear_infinite_1s]">💗</div>
                        <div className="absolute bottom-0 -right-12 text-2xl animate-[float-heart_4s_linear_infinite_1.5s]">✨</div>
                      </>
                    )}
                 </div>
             </div>

             {/* --- MALE TEDDY & FLOWER (Step 2) --- */}
             {step === 2 && (
                <>
                  <img 
                    ref={maleTeddyRef}
                    src="https://media.tenor.com/Z7kYkZc6mKAAAAAi/milk-and-mocha-bear.gif"
                    className="absolute bottom-24 w-40 h-40 object-contain left-0 z-20"
                    alt="Male Bear"
                    style={{ transform: 'translateX(-250px)' }}
                  />
                  
                  {/* Flower that appears attached to male teddy's position roughly via layout or CSS */}
                  <div 
                    className={`absolute bottom-36 z-30 transition-all ${showFlower ? 'opacity-100' : 'opacity-0'}`}
                    style={{ 
                        left: 'calc(50% - 110px)', // Calculated based on where male bear stops
                    }}
                  >
                     <div className={showFlower ? "animate-flower-pop origin-bottom-left" : ""}>
                       <span className="text-6xl drop-shadow-xl filter brightness-110">🌹</span>
                     </div>
                  </div>

                  {/* --- BIG ROSE IN CENTER (New Request) --- */}
                  {showFlower && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                         <motion.div
                             initial={{ scale: 0, opacity: 0 }}
                             animate={{ scale: 1, opacity: 1 }}
                             transition={{ 
                                 type: "spring",
                                 stiffness: 200,
                                 damping: 15,
                                 duration: 1
                             }}
                         >
                            <span className="text-[120px] md:text-[180px] drop-shadow-2xl filter brightness-110 animate-pulse block">🌹</span>
                         </motion.div>
                      </div>
                  )}
                </>
             )}

             {/* --- BUTTONS & TEXT LAYERS --- */}
             
             {/* Step 2 Final Text & Close (Back) */}
             <div className={`absolute bottom-8 w-full flex flex-col items-center transition-all duration-1000 ${showFlower ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl border border-pink-200 shadow-sm mb-4 relative z-40">
                  <h2 className="text-2xl md:text-3xl font-bold text-rose-600 font-serif text-center">
                      Naina… this is for you 🌹
                  </h2>
                </div>
                
                {/* Step 2 Back Button: Restarts the sequence (goes to Step 0) */}
                <button
                    onClick={handleRestart}
                    className="flex items-center gap-2 bg-pink-100 hover:bg-pink-200 text-pink-600 font-bold py-2 px-8 rounded-full shadow-md hover:shadow-lg transition-all transform hover:scale-105 relative z-40"
                >
                    <ArrowLeft size={20} />
                    Back
                </button>
             </div>

          </div>
        )}

      </div>
    </div>
  );
};