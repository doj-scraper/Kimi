import React, { useEffect, useState } from 'react';

export const AnalogClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  // Calculate degrees
  const secondDeg = (seconds / 60) * 360;
  const minuteDeg = ((minutes + seconds / 60) / 60) * 360;
  const hourDeg = ((hours % 12 + minutes / 60) / 12) * 360;

  return (
    <div className="relative w-10 h-10 rounded-full border border-white/20 bg-black/40 shadow-inner flex items-center justify-center">
      {/* Markers */}
      {[...Array(12)].map((_, i) => (
        <div 
          key={i}
          className="absolute w-[1px] h-[3px] bg-white/40"
          style={{ transform: `rotate(${i * 30}deg) translateY(-14px)` }}
        />
      ))}

      {/* Hour Hand */}
      <div 
        className="absolute w-[2px] h-[8px] bg-white rounded-full origin-bottom bottom-1/2"
        style={{ transform: `rotate(${hourDeg}deg)` }}
      />
      
      {/* Minute Hand */}
      <div 
        className="absolute w-[1.5px] h-[12px] bg-white/80 rounded-full origin-bottom bottom-1/2"
        style={{ transform: `rotate(${minuteDeg}deg)` }}
      />

      {/* Second Hand */}
      <div 
        className="absolute w-[1px] h-[14px] bg-red-500 rounded-full origin-bottom bottom-1/2 shadow-sm"
        style={{ transform: `rotate(${secondDeg}deg)` }}
      />
      
      {/* Center Dot */}
      <div className="absolute w-1.5 h-1.5 bg-white rounded-full z-10 shadow-sm" />
    </div>
  );
};
