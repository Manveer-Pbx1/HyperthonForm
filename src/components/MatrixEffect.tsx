import { useEffect, useState, useRef } from "react";

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
  const inputRef = useRef<HTMLInputElement>(null);
  let nextId = 0;

  const addLetter = (char: string) => {
    if (char.length === 1) {
      if (isMobile && letters.length > 15) {
        setLetters(prev => [...prev.slice(-15)]);
      }
      
      const x = Math.random() * (window.innerWidth - 20); // Prevent letters too close to edges
      setLetters(prev => [...prev, {
        id: nextId++,
        char,
        x,
        delay: Math.random() * 0.1,
        speed: isMobile ? 1.5 + Math.random() : 2 + Math.random()
      }]);
    }
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      addLetter(event.key);
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [letters.length]);

  useEffect(() => {
    const cleanup = setInterval(() => {
      setLetters(prev => prev.filter(letter => 
        document.documentElement.clientHeight > letter.x
      ));
    }, isMobile ? 4000 : 8000);

    return () => clearInterval(cleanup);
  }, [isMobile]);

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
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
        onTouchStart={focusInput} // Handle touch events for Android
      >
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
      {isMobile && (
        <input
          ref={inputRef}
          type="text"
          className="opacity-0 fixed bottom-0 left-0 w-full h-12 z-50"
          onInput={(e) => {
            const lastChar = (e.target as HTMLInputElement).value.slice(-1);
            addLetter(lastChar);
            (e.target as HTMLInputElement).value = ''; // Clear input after each character
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
