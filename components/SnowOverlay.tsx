import React, { useEffect, useState } from 'react';

const SnowOverlay: React.FC = () => {
  const [flakes, setFlakes] = useState<number[]>([]);

  useEffect(() => {
    // Create a fixed number of flakes
    const flakeCount = 30;
    setFlakes(Array.from({ length: flakeCount }, (_, i) => i));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {flakes.map((i) => {
        const left = Math.random() * 100;
        const animationDuration = 5 + Math.random() * 10;
        const delay = Math.random() * 5;
        const opacity = 0.3 + Math.random() * 0.7;
        const size = 0.5 + Math.random() * 1.5;

        return (
          <div
            key={i}
            className="snowflake"
            style={{
              left: `${left}%`,
              animationDuration: `${animationDuration}s`,
              animationDelay: `-${delay}s`,
              opacity: opacity,
              fontSize: `${size}rem`,
            }}
          >
            ❄
          </div>
        );
      })}
    </div>
  );
};

export default SnowOverlay;