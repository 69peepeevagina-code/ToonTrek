import React, { useEffect, useState, useCallback } from 'react';

interface Props {
  characterName: string;
  characterImage: string;
  dialogue: string;
  onAdvance: () => void;
  options?: { label: string; onClick: () => void }[];
}

export const VisualNovelOverlay: React.FC<Props> = ({ characterName, characterImage, dialogue, onAdvance, options }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [selectedOption, setSelectedOption] = useState(0);

  // Typewriter effect
  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    const interval = setInterval(() => {
      if (index < dialogue.length) {
        setDisplayedText(prev => prev + dialogue.charAt(index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 20); // Speed of typing
    return () => clearInterval(interval);
  }, [dialogue]);

  // Keyboard Navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!options) {
        if (e.key === 'z' || e.key === 'Enter') onAdvance();
        return;
    }

    if (e.key === 'ArrowDown') {
        setSelectedOption(prev => (prev + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
        setSelectedOption(prev => (prev - 1 + options.length) % options.length);
    } else if (e.key === 'z' || e.key === 'Enter') {
        options[selectedOption].onClick();
    }
  }, [options, selectedOption, onAdvance]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end pointer-events-none select-none">
       {/* Background Dim */}
       <div className="absolute inset-0 bg-black/60 pointer-events-auto" onClick={!options ? onAdvance : undefined}></div>
       
       {/* Character Portrait */}
       <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 md:left-20 md:translate-x-0 w-[400px] h-[600px] transition-all duration-500 animate-in slide-in-from-bottom fade-in">
           <img 
            src={characterImage || 'https://via.placeholder.com/400x600'} 
            className="w-full h-full object-cover object-top drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] mask-image-gradient"
            alt={characterName} 
           />
       </div>

       {/* Dialogue Box */}
       <div className="relative z-10 p-4 md:p-8 pointer-events-auto">
           <div className="bg-slate-900/90 border-2 border-indigo-500/50 backdrop-blur-md rounded-2xl p-6 shadow-2xl max-w-4xl mx-auto">
               <h3 className="text-indigo-400 font-bold text-xl mb-2 font-mono uppercase tracking-widest flex justify-between">
                   <span>{characterName}</span>
                   <span className="text-[10px] text-slate-500 font-sans normal-case">[Z] Confirm / [Arrows] Select</span>
               </h3>
               <p className="text-white text-lg leading-relaxed font-sans min-h-[80px]">
                   {displayedText}
                   <span className="animate-pulse text-indigo-400 ml-1">_</span>
               </p>

               {/* Options */}
               {displayedText.length === dialogue.length && (
                   <div className="flex flex-col gap-2 mt-4 items-end">
                       {options ? options.map((opt, i) => (
                           <button 
                             key={i} 
                             onClick={opt.onClick}
                             onMouseEnter={() => setSelectedOption(i)}
                             className={`px-6 py-3 rounded-lg font-bold shadow-lg transform transition-all w-full md:w-1/2 text-left flex justify-between items-center group
                                ${i === selectedOption ? 'bg-indigo-600 text-white translate-x-2 ring-2 ring-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                           >
                               <span>{opt.label}</span>
                               {i === selectedOption && <span className="text-sm font-mono">[Z]</span>}
                           </button>
                       )) : (
                           <button 
                             onClick={onAdvance}
                             className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-bold animate-bounce mt-4"
                           >
                               ▼ Next [Z]
                           </button>
                       )}
                   </div>
               )}
           </div>
       </div>

       <style>{`
         .mask-image-gradient {
            mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
         }
       `}</style>
    </div>
  );
};