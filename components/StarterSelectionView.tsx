import React, { useState } from 'react';
import { Monster } from '../types';
import { MonsterCard } from './MonsterCard';
import { Button } from './Button';

interface Props {
  candidates: Monster[]; // Expects 3 monsters
  onSelect: (index: number) => void;
}

export const StarterSelectionView: React.FC<Props> = ({ candidates, onSelect }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // We have 3 known candidates + 1 Mystery Slot
  const cards = [
    { type: 'KNOWN', data: candidates[0], label: 'GRASS' },
    { type: 'KNOWN', data: candidates[1], label: 'FIRE' },
    { type: 'KNOWN', data: candidates[2], label: 'WATER' },
    { type: 'MYSTERY', label: 'MYSTERY' }
  ];

  return (
    <div className="h-full w-full bg-slate-900 flex flex-col relative text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        
        <div className="z-10 p-8 text-center">
            <h2 className="text-4xl font-toon text-indigo-400 drop-shadow-lg mb-2">CHOOSE YOUR PARTNER</h2>
            <p className="text-slate-400 font-mono text-sm">Select a bio-digital companion to begin your journey.</p>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
                {cards.map((card, idx) => (
                    <div 
                        key={idx}
                        className="group relative flex flex-col items-center"
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        {card.type === 'KNOWN' && card.data ? (
                            <div 
                                onClick={() => onSelect(idx)}
                                className={`transform transition-all duration-300 cursor-pointer ${hoveredIndex === idx ? 'scale-105 -translate-y-2' : 'grayscale opacity-80 hover:grayscale-0 hover:opacity-100'}`}
                            >
                                <MonsterCard monster={card.data} />
                                <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500">SELECT {card.data.name}</Button>
                            </div>
                        ) : (
                            <div 
                                onClick={() => onSelect(3)}
                                className={`w-full h-full min-h-[300px] bg-slate-800 border-4 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-700 hover:border-indigo-500 transition-all ${hoveredIndex === idx ? 'scale-105 -translate-y-2' : ''}`}
                            >
                                <div className="text-6xl mb-4 animate-bounce">🎁</div>
                                <h3 className="text-2xl font-black text-slate-300">MYSTERY BOX</h3>
                                <p className="text-xs text-slate-500 px-4 text-center mt-2">
                                    High Risk / High Reward? <br/>
                                    Contains a random generated monster. <br/>
                                    <span className="text-red-500">Warning: May be a meme.</span>
                                </p>
                                <Button variant="danger" className="mt-8">TAKE THE RISK</Button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
        
        <div className="p-4 bg-slate-800 text-center text-xs font-mono text-slate-500">
            Dr. Phao Xi Labs &copy; 2025
        </div>
    </div>
  );
};