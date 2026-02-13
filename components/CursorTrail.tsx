import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TrailPoint {
  id: number;
  x: number;
  y: number;
  color: string;
}

const colors = ['#ffccd5', '#ffb3c1', '#ff8fa3', '#ff758f', '#fb6f92'];

export const CursorTrail: React.FC = () => {
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const idCounter = useRef(0);
  const requestRef = useRef<number>();
  const mousePos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      if (mousePos.current) {
        // Add new point occasionally
        if (Math.random() > 0.5) { // Throttling slightly
            const newId = idCounter.current++;
            const newPoint: TrailPoint = {
              id: newId,
              x: mousePos.current.x,
              y: mousePos.current.y,
              color: colors[Math.floor(Math.random() * colors.length)]
            };
    
            setTrail(prev => [...prev.slice(-15), newPoint]); // Keep last 15 points
        }
      }
      // Remove old points automatically handled by React state updates logic if we wanted, 
      // but simpler to let AnimatePresence handle the "exit" visual and we just cap the array size.
      
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <AnimatePresence>
        {trail.map((point) => (
          <motion.div
            key={point.id}
            initial={{ opacity: 0.8, scale: 0.5, x: point.x, y: point.y }}
            animate={{ opacity: 0, scale: 1.5, y: point.y + 20 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute text-xl"
            style={{ color: point.color }}
          >
            ❤️
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};