
import React, { useMemo } from 'react';

interface SnowflakeProps {
  left: string;
  size: string;
  opacity: string;
  delay: string;
  duration: string;
}

const Snowflake: React.FC<SnowflakeProps> = ({ left, size, opacity, delay, duration }) => {
  return (
    <div 
      className={`absolute top-0 z-0 rounded-full bg-white ${duration}`}
      style={{ 
        left, 
        width: size, 
        height: size, 
        opacity, 
        animationDelay: delay
      }}
    />
  );
};

interface SnowBackgroundProps {
  intensity?: 'light' | 'medium' | 'heavy';
}

export const SnowBackground: React.FC<SnowBackgroundProps> = ({ intensity = 'light' }) => {
  const snowflakeCount = intensity === 'light' ? 20 : intensity === 'medium' ? 40 : 60;
  
  const snowflakes = useMemo(() => {
    return Array.from({ length: snowflakeCount }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 8 + 2}px`,
      opacity: `${Math.random() * 0.6 + 0.2}`,
      delay: `${Math.random() * 15}s`,
      duration: [
        'animate-snow-fall-slow',
        'animate-snow-fall-medium',
        'animate-snow-fall-fast'
      ][Math.floor(Math.random() * 3)]
    }));
  }, [snowflakeCount]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {snowflakes.map((snowflake) => (
        <Snowflake
          key={snowflake.id}
          left={snowflake.left}
          size={snowflake.size}
          opacity={snowflake.opacity}
          delay={snowflake.delay}
          duration={snowflake.duration}
        />
      ))}
    </div>
  );
};
