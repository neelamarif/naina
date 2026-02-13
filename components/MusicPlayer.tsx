import React, { useRef, useEffect } from 'react';
import { Music, Pause } from 'lucide-react';

interface MusicPlayerProps {
  isPlaying: boolean;
  onToggle: () => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ isPlaying, onToggle }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio object once
    // Using a reliable royalty-free source for romantic piano music
    const audio = new Audio("https://cdn.pixabay.com/download/audio/2022/10/25/audio_249e0c5240.mp3?filename=romantic-piano-124978.mp3");
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => {
            console.log("Autoplay blocked, waiting for user interaction", e);
            // This component expects parent to handle state, but browser might block autoplay
            // if no interaction happened yet. 
        });
        
        // Fade in
        let vol = 0;
        audioRef.current.volume = 0;
        const fadeIn = setInterval(() => {
            if (vol < 0.5) {
                vol += 0.05;
                audioRef.current!.volume = vol;
            } else {
                clearInterval(fadeIn);
            }
        }, 200);

      } else {
        // Fade out then pause
        let vol = audioRef.current.volume;
        const fadeOut = setInterval(() => {
            if (vol > 0.05) {
                vol -= 0.05;
                audioRef.current!.volume = vol;
            } else {
                audioRef.current!.pause();
                clearInterval(fadeOut);
            }
        }, 200);
      }
    }
  }, [isPlaying]);

  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 bg-white/50 hover:bg-white/80 backdrop-blur-sm border border-white px-4 py-2 rounded-full shadow-sm transition-all text-gray-700 font-medium text-sm md:text-base"
    >
      {isPlaying ? <Pause size={18} /> : <Music size={18} />}
      {isPlaying ? "Pause Music" : "Play Music"}
    </button>
  );
};