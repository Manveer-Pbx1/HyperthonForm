import { useEffect, useState, useRef } from "react";

interface FallingLetter {
  id: number;
  char: string;
  x: number;
  speed: number;
  y?: number; // Optional to track position for cleanup logic
}

export const MatrixEffect = () => {
  const [letters, setLetters] = useState<FallingLetter[]>([]);
  const [isMobile] = useState(() => window.innerWidth < 768);
  const inputRef = useRef<HTMLInputElement>(null);
  let nextId = 0;

  const addLetter = (char: string) => {
    if (char.length === 1) {
      const x = Math.random() * (window.innerWidth - 20); // Prevent letters too close to edges
      const speed = isMobile ? 1.5 + Math.random() : 2 + Math.random();
      
      setLetters(prev => [
        ...prev,
        {
          id: nextId++,
          char,
          x,
          speed,
          y: 0, // Start from the top
        },
      ]);
    }
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      addLetter(event.key);
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, []);

  useEffect(() => {
    const cleanup = setInterval(() => {
      setLetters(prev => 
        prev.filter(letter => letter.y! < window.innerHeight)
      );
    }, 1000);

    return () => clearInterval(cleanup);
  }, []);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (isMobile && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMobile]);

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
        onClick={focusInput}
        onTouchStart={focusInput}
      >
        {letters.map((letter) => (
          <div
            key={letter.id}
            className="absolute text-[#00ff80] font-mono text-xl matrix-letter"
            style={{
              left: `${letter.x}px`,
              animation: `fall ${letter.speed}s linear forwards`,
              WebkitAnimation: `fall ${letter.speed}s linear forwards`,
            }}
          >
            {letter.char}
          </div>
        ))}
      </div>
      {isMobile && (
        <input
          ref={inputRef}
          type="text"
          className="opacity-0 fixed bottom-0 left-0 w-full h-12 z-50"
          onInput={(e) => {
            const lastChar = (e.target as HTMLInputElement).value.slice(-1);
            addLetter(lastChar);
            (e.target as HTMLInputElement).value = ""; // Clear input after each character
          }}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
      )}
    </>
  );
};
