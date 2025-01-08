import { useEffect, useState } from "react";

interface FallingLetter {
  id: number;
  char: string;
  x: number;
  delay: number;
  speed: number;
}

export const MatrixEffect = () => {
  const [letters, setLetters] = useState<FallingLetter[]>([]);
  const [isMobile] = useState(() => window.innerWidth < 768);
  let nextId = 0;

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const char = event.key;
      if (char.length === 1) {
        // Limit number of particles on mobile
        if (isMobile && letters.length > 15) return;
        
        const x = Math.random() * window.innerWidth;
        setLetters(prev => [...prev, {
          id: nextId++,
          char,
          x,
          delay: Math.random() * 0.1, // Reduced delay
          speed: isMobile ? 1.5 + Math.random() : 2 + Math.random() // Faster on mobile
        }]);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [isMobile, letters.length]);

  // Cleanup more frequently on mobile
  useEffect(() => {
    const cleanup = setInterval(() => {
      setLetters(prev => prev.filter(letter => 
        document.documentElement.clientHeight > letter.x
      ));
    }, isMobile ? 4000 : 8000);

    return () => clearInterval(cleanup);
  }, [isMobile]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {letters.map((letter) => (
        <div
          key={letter.id}
          className="absolute text-[#00ff80] font-mono text-xl matrix-letter"
          style={{
            left: `${letter.x}px`,
            animation: `fall ${letter.speed}s linear forwards`,
            animationDelay: `${letter.delay}s`,
            willChange: 'transform', // Performance optimization
            transform: 'translateZ(0)' // Enable hardware acceleration
          }}
        >
          {letter.char}
        </div>
      ))}
    </div>
  );
};
