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
  let nextId = 0;

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const char = event.key;
      if (char.length === 1) { 
        const x = Math.random() * window.innerWidth;
        setLetters(prev => [...prev, {
          id: nextId++,
          char,
          x,
          delay: Math.random() * 0.2,
          speed: 2 + Math.random()
        }]);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, []);

  useEffect(() => {
    const cleanup = setInterval(() => {
      setLetters(prev => prev.filter(letter => 
        document.documentElement.clientHeight > letter.x
      ));
    }, 8000);

    return () => clearInterval(cleanup);
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
            animationDelay: `${letter.delay}s`
          }}
        >
          {letter.char}
        </div>
      ))}
    </div>
  );
};
