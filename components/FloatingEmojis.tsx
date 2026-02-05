import React, { useEffect, useState } from 'react';
import { FloatingItem } from '../types';

interface Props {
  isActive: boolean;
}

const EMOJIS = ['🥁', '👏', '🔥', '💃', '🕺', '❤️', '🌟', '🎉'];

const FloatingEmojis: React.FC<Props> = ({ isActive }) => {
  const [items, setItems] = useState<FloatingItem[]>([]);

  useEffect(() => {
    if (!isActive) {
      setItems([]);
      return;
    }

    const interval = setInterval(() => {
      const newItem: FloatingItem = {
        id: Date.now(),
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        left: Math.random() * 90, // percent
        animationDuration: 2 + Math.random() * 3, // seconds
      };

      setItems((prev) => [...prev, newItem].slice(-15)); // Keep max 15 items
    }, 300);

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute bottom-0 text-4xl animate-float opacity-70"
          style={{
            left: `${item.left}%`,
            animation: `floatUp ${item.animationDuration}s linear forwards`,
          }}
        >
          {item.emoji}
        </div>
      ))}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default FloatingEmojis;
