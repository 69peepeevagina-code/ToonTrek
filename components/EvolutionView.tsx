import React, { useEffect, useState } from 'react';
import { Monster, EvolutionOption } from '../types';
import { TYPE_COLORS } from '../constants';

interface Props {
  monster: Monster;
  options: EvolutionOption[];
  onSelect: (option: EvolutionOption) => void;
  onCancel: () => void;
}

export const EvolutionView: React.FC<Props> = ({ monster, options, onSelect, onCancel }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight') setSelectedIdx(prev => (prev + 1) % options.length);
        if (e.key === 'ArrowLeft') setSelectedIdx(prev => (prev - 1 + options.length) % options.length);
        if (e.key === 'z' || e.key === 'Enter') onSelect(options[selectedIdx]);
        if (e.key === 'x' || e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [options, selectedIdx, onSelect, onCancel]);

  return (
    <div className="h-full w-full bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden text-white select-none">
        <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/26BRGoQB59Y7D7H7G/giphy.gif')] bg-cover opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900"></div>

        <div className="z-10 text-center mb-8">
            <h1 className="text-4xl font-toon text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 animate-pulse">EVOLUTION DETECTED!</h1>
            <p className="text-slate-400 mt-2 font-mono">Subject: {monster.name} (Lv.{monster.level})</p>
        </div>

        <div className="z-10 flex flex-col md:flex-row gap-6 w-full max-w-6xl justify-center items-stretch h-96">
            {options.map((opt, i) => (
                <div 
                    key={opt.id}
                    onClick={() => setSelectedIdx(i)}
                    className={`flex-1 relative border-4 rounded-xl p-6 transition-all duration-300 cursor-pointer flex flex-col group
                        ${i === selectedIdx ? 'border-indigo-400 bg-slate-800 scale-105 shadow-[0_0_30px_rgba(99,102,241,0.5)] z-20' : 'border-slate-700 bg-slate-900/80 grayscale hover:grayscale-0 hover:border-slate-500'}
                    `}
                >
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-slate-900 px-4 text-xs font-bold font-mono border border-slate-700 rounded-full">
                        PATH {i + 1}
                    </div>

                    <h2 className={`text-2xl font-bold mb-2 ${i === selectedIdx ? 'text-white' : 'text-slate-500'}`}>{opt.name}</h2>
                    
                    <div className="flex gap-2 mb-4">
                        {opt.typeHint && (
                            <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${TYPE_COLORS[opt.typeHint]}`}>
                                {opt.typeHint} Hint
                            </span>
                        )}
                        <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase border 
                            ${opt.riskLevel === 'HIGH' ? 'border-red-500 text-red-500' : opt.riskLevel === 'MEDIUM' ? 'border-yellow-500 text-yellow-500' : 'border-green-500 text-green-500'}`}>
                            Risk: {opt.riskLevel}
                        </span>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed font-sans flex-1">
                        {opt.description}
                    </p>

                    {i === selectedIdx && (
                        <div className="mt-4 text-center">
                            <span className="inline-block px-6 py-2 bg-indigo-600 text-white font-bold rounded-full animate-bounce">
                                Press [Z] to Evolve
                            </span>
                        </div>
                    )}
                </div>
            ))}
        </div>
        
        <div className="z-10 mt-12 text-slate-500 font-mono text-xs flex gap-8">
            <span>[←/→] Select Path</span>
            <span>[Z] Confirm Evolution</span>
            <span>[X] Cancel (Hold Item)</span>
        </div>
    </div>
  );
};