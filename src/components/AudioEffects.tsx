
import React, { useEffect, useRef, useState } from 'react';
import { RiskLevel } from '@/types/avalanche';

interface AudioEffectsProps {
  isPlaying?: boolean;
  riskLevel?: RiskLevel | null;
  snowIntensity?: 'light' | 'medium' | 'heavy';
}

export const AudioEffects: React.FC<AudioEffectsProps> = ({ 
  isPlaying = true, 
  riskLevel = null,
  snowIntensity = 'medium'
}) => {
  const [muted, setMuted] = useState(true);
  const ambientRef = useRef<HTMLAudioElement | null>(null);
  const effectRef = useRef<HTMLAudioElement | null>(null);
  const initializedRef = useRef(false);

  // Initialize audio on first interaction
  const initializeAudio = () => {
    if (initializedRef.current) return;
    
    setMuted(false);
    initializedRef.current = true;
    
    // Start ambient sound
    if (ambientRef.current) {
      ambientRef.current.volume = 0.3;
      ambientRef.current.play().catch(err => console.log('Audio playback prevented:', err));
    }
    
    // Play a subtle wind effect to confirm audio is working
    if (effectRef.current) {
      effectRef.current.src = '/sounds/wind-light.mp3';
      effectRef.current.volume = 0.2;
      effectRef.current.play().catch(err => console.log('Effect playback prevented:', err));
    }
  };

  // Handle mute toggle
  const toggleMute = () => {
    if (!initializedRef.current) {
      initializeAudio();
      return;
    }
    
    setMuted(!muted);
    
    if (ambientRef.current) {
      if (muted) {
        ambientRef.current.volume = 0.3;
      } else {
        ambientRef.current.volume = 0;
      }
    }
  };

  // Set appropriate ambient sound based on snow intensity
  useEffect(() => {
    if (!ambientRef.current || muted) return;
    
    let soundFile = '/sounds/wind-light.mp3';
    let volume = 0.3;
    
    switch (snowIntensity) {
      case 'heavy':
        soundFile = '/sounds/blizzard.mp3';
        volume = 0.4;
        break;
      case 'medium':
        soundFile = '/sounds/wind-medium.mp3';
        volume = 0.3;
        break;
      case 'light':
        soundFile = '/sounds/wind-light.mp3';
        volume = 0.2;
        break;
    }
    
    ambientRef.current.src = soundFile;
    ambientRef.current.volume = volume;
    ambientRef.current.loop = true;
    
    if (isPlaying && initializedRef.current) {
      ambientRef.current.play().catch(err => console.log('Audio playback prevented:', err));
    }
  }, [snowIntensity, muted, isPlaying]);

  // Play risk level specific sounds
  useEffect(() => {
    if (!effectRef.current || muted || !riskLevel || !initializedRef.current) return;
    
    let soundFile = '';
    let volume = 0.4;
    
    switch (riskLevel) {
      case 'extreme':
        soundFile = '/sounds/avalanche.mp3';
        volume = 0.5;
        break;
      case 'high':
        soundFile = '/sounds/cracking-ice.mp3';
        volume = 0.45;
        break;
      case 'considerable':
        soundFile = '/sounds/snow-movement.mp3';
        volume = 0.4;
        break;
      case 'moderate':
        soundFile = '/sounds/soft-snow.mp3';
        volume = 0.35;
        break;
      case 'low':
        soundFile = '/sounds/gentle-wind.mp3';
        volume = 0.3;
        break;
    }
    
    if (soundFile) {
      effectRef.current.src = soundFile;
      effectRef.current.volume = volume;
      effectRef.current.play().catch(err => console.log('Effect playback prevented:', err));
    }
  }, [riskLevel, muted]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleMute}
        className={`p-3 rounded-full bg-snow-800/60 backdrop-blur-sm hover:bg-snow-700/70 transition-all ${
          muted ? 'text-snow-400' : 'text-snow-200'
        }`}
        aria-label={muted ? "Enable sound" : "Disable sound"}
      >
        {muted ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 6 9H2v6h4l5 4V5z"></path>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 6 9H2v6h4l5 4V5z"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
        )}
      </button>
      
      {/* Hidden audio elements */}
      <audio ref={ambientRef} preload="none" />
      <audio ref={effectRef} preload="none" />
    </div>
  );
};
