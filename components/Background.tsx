import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Types for particles
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  type: 'heart' | 'sparkle';
}

export const Background: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate static initial particles to avoid hydration mismatch, or generate on mount
    const count = 25;
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100, // percentage
        y: Math.random() * 100, // percentage
        size: Math.random() * 20 + 10,
        duration: Math.random() * 10 + 10, // 10-20s float duration
        delay: Math.random() * 5,
        type: Math.random() > 0.7 ? 'sparkle' : 'heart'
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Soft gradient orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          initial={{ top: `${p.y}%`, left: `${p.x}%`, opacity: 0 }}
          animate={{
            top: [`${p.y}%`, `${p.y - 20}%`, `${p.y - 100}%`], // Drift upwards
            opacity: [0, 0.6, 0],
            rotate: [0, Math.random() * 360],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        >
          {p.type === 'heart' ? (
            <div style={{ fontSize: p.size }} className="text-pink-400 opacity-60">
              ❤️
            </div>
          ) : (
            <div style={{ fontSize: p.size }} className="text-yellow-300 opacity-60">
              ✨
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};