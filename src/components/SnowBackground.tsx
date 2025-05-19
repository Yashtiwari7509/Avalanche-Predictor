
import React, { useMemo, useEffect, useState } from 'react';

interface SnowflakeProps {
  left: string;
  size: string;
  opacity: string;
  delay: string;
  duration: string;
  blur?: string;
}

const Snowflake: React.FC<SnowflakeProps> = ({ left, size, opacity, delay, duration, blur }) => {
  return (
    <div 
      className={`absolute top-0 z-0 rounded-full bg-white ${duration}`}
      style={{ 
        left, 
        width: size, 
        height: size, 
        opacity, 
        animationDelay: delay,
        filter: blur ? `blur(${blur})` : 'none'
      }}
    />
  );
};

interface SnowBackgroundProps {
  intensity?: 'light' | 'medium' | 'heavy';
}

export const SnowBackground: React.FC<SnowBackgroundProps> = ({ intensity = 'medium' }) => {
  const [isMoving, setIsMoving] = useState(false);
  
  // Trigger movement effect on mount and periodically
  useEffect(() => {
    setIsMoving(true);
    const interval = setInterval(() => {
      setIsMoving(prev => !prev);
      setTimeout(() => setIsMoving(true), 100);
    }, 12000);
    
    return () => clearInterval(interval);
  }, []);
  
  const snowflakeCount = intensity === 'light' ? 30 : intensity === 'medium' ? 60 : 100;
  
  const snowflakes = useMemo(() => {
    return Array.from({ length: snowflakeCount }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 10 + 2}px`,
      opacity: `${Math.random() * 0.7 + 0.2}`,
      delay: `${Math.random() * 20}s`,
      duration: [
        'animate-snow-fall-slow',
        'animate-snow-fall-medium',
        'animate-snow-fall-fast'
      ][Math.floor(Math.random() * 3)],
      blur: Math.random() > 0.7 ? `${Math.random() * 2}px` : undefined
    }));
  }, [snowflakeCount, isMoving]);

  // Create some larger, blurred background snowflakes for depth
  const backgroundSnowflakes = useMemo(() => {
    return Array.from({ length: Math.floor(snowflakeCount / 3) }).map((_, i) => ({
      id: i + 1000, // Ensure unique IDs
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 25 + 15}px`,
      opacity: `${Math.random() * 0.2 + 0.1}`,
      delay: `${Math.random() * 30}s`,
      duration: 'animate-snow-fall-slow',
      blur: `${Math.random() * 4 + 2}px`
    }));
  }, [snowflakeCount, isMoving]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Background snowflakes (larger, blurred) */}
      {backgroundSnowflakes.map((snowflake) => (
        <Snowflake
          key={snowflake.id}
          left={snowflake.left}
          size={snowflake.size}
          opacity={snowflake.opacity}
          delay={snowflake.delay}
          duration={snowflake.duration}
          blur={snowflake.blur}
        />
      ))}
      
      {/* Foreground snowflakes */}
      {snowflakes.map((snowflake) => (
        <Snowflake
          key={snowflake.id}
          left={snowflake.left}
          size={snowflake.size}
          opacity={snowflake.opacity}
          delay={snowflake.delay}
          duration={snowflake.duration}
          blur={snowflake.blur}
        />
      ))}
    </div>
  );
};
