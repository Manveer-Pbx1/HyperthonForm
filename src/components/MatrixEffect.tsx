import { useEffect, useState, useCallback, useRef } from "react";

interface FallingLetter {
  id: number;
  char: string;
  x: number;
  delay: number;
  speed: number;
}

const MOBILE_MAX_LETTERS = 20;
const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export const MatrixEffect = () => {
  const [letters, setLetters] = useState<FallingLetter[]>([]);
  const [isMobile] = useState(() => window.innerWidth < 768);
  const idCounter = useRef(0);
  const isActive = useRef(true);

  const addLetter = useCallback((char?: string) => {
    if (!isActive.current) return;
    
    const randomChar = char || CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
    const x = Math.random() * window.innerWidth;
    
    setLetters(prev => {
      if (isMobile && prev.length >= MOBILE_MAX_LETTERS) {
        return [...prev.slice(1), {
          id: idCounter.current++,
          char: randomChar,
          x,
          delay: Math.random() * 0.1,
          speed: isMobile ? 1.5 + Math.random() : 2 + Math.random()
        }];
      }
      
      return [...prev, {
        id: idCounter.current++,
        char: randomChar,
        x,
        delay: Math.random() * 0.1,
        speed: isMobile ? 1.5 + Math.random() : 2 + Math.random()
      }];
    });
  }, [isMobile]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.length === 1) {
        addLetter(event.key);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [addLetter]);

  // Handle touch events and auto-generation for mobile
  useEffect(() => {
    if (!isMobile) return;

    const touchHandler = () => addLetter();
    const interval = setInterval(() => addLetter(), 500);
    
    document.addEventListener('touchstart', touchHandler);
    
    return () => {
      document.removeEventListener('touchstart', touchHandler);
      clearInterval(interval);
    };
  }, [isMobile, addLetter]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      isActive.current = false;
    };
  }, []);

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
            willChange: 'transform',
            transform: 'translateZ(0)'
          }}
        >
          {letter.char}
        </div>
      ))}
    </div>
  );
};
