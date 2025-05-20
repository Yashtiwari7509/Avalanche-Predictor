import React, { useMemo, useEffect, useState } from "react";

interface SnowflakeProps {
  left: string;
  size: string;
  opacity: string;
  delay: string;
  duration: string;
  blur?: string;
}

const Snowflake: React.FC<SnowflakeProps> = ({
  left,
  size,
  opacity,
  delay,
  duration,
  blur,
}) => {
  return (
    <div
      className={`absolute top-[-10%] ${duration} animate-snow-drift rounded-full bg-white pointer-events-none`}
      style={{
        left,
        width: size,
        height: size,
        opacity,
        animationDelay: delay,
        filter: blur ? `blur(${blur})` : "none",
      }}
    />
  );
};

interface SnowBackgroundProps {
  intensity?: "light" | "medium" | "heavy";
}

export const SnowBackground: React.FC<SnowBackgroundProps> = ({
  intensity = "medium",
}) => {
  const snowflakeCount =
    intensity === "light" ? 30 : intensity === "medium" ? 60 : 100;

  const generateSnowflakes = (
    count: number,
    speedClass: string,
    sizeRange: [number, number],
    opacityRange: [number, number],
    blurChance = 0.5
  ) =>
    Array.from({ length: count }).map((_, i) => ({
      id: i + Math.random(),
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0]}px`,
      opacity: `${
        Math.random() * (opacityRange[1] - opacityRange[0]) + opacityRange[0]
      }`,
      delay: `${Math.random() * 20}s`,
      duration: speedClass,
      blur:
        Math.random() < blurChance ? `${Math.random() * 2 + 1}px` : undefined,
    }));

  const foreground = useMemo(
    () =>
      generateSnowflakes(
        Math.floor(snowflakeCount * 0.5),
        "animate-snow-fall-fast",
        [2, 6],
        [0.6, 1],
        0.2
      ),
    [snowflakeCount]
  );

  const midground = useMemo(
    () =>
      generateSnowflakes(
        Math.floor(snowflakeCount * 0.3),
        "animate-snow-fall-medium",
        [4, 10],
        [0.4, 0.8],
        0.4
      ),
    [snowflakeCount]
  );

  const background = useMemo(
    () =>
      generateSnowflakes(
        Math.floor(snowflakeCount * 0.2),
        "animate-snow-fall-slow",
        [10, 20],
        [0.2, 0.4],
        0.8
      ),
    [snowflakeCount]
  );

  const allFlakes = [...background, ...midground, ...foreground];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {allFlakes.map((flake) => (
        <Snowflake
          key={flake.id}
          left={flake.left}
          size={flake.size}
          opacity={flake.opacity}
          delay={flake.delay}
          duration={flake.duration}
          blur={flake.blur}
        />
      ))}
    </div>
  );
};
