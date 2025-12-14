import React, { useState, useEffect } from 'react';
import { PlayerProfile } from '../types';
import { Button } from './Button';

interface Props {
  onComplete: (profile: PlayerProfile) => void;
}

// --- DATA POOLS (200+ Choices) ---
const NAMES = [
  "Ace", "Axel", "Ash", "Arc", "Bit", "Bolt", "Blaze", "Bix", "Cade", "Cy", "Chip", "Dash", "Dex", "Drax", "Echo", "Edge", "Flux", "Finn", "Fox", "Gage", "Gio", "Hex", "Huck", "Ion", "Jax", "Jett", "Jinx", "Kai", "Kip", "Kit", "Leo", "Lux", "Max", "Neo", "Nix", "Nova", "Ozz", "Pax", "Pike", "Quin", "Ray", "Rex", "Rif", "Rio", "Sky", "Sly", "Taz", "Tex", "Ty", "Vex", "Vip", "Wes", "Xan", "Xen", "Zak", "Zed", "Zip", "Zoe", "Zane", "Zeke", "Rogue", "Glitch", "Byte", "Pixel", "Vector", "Sonic", "Tails", "Knuckles", "Shadow", "Link", "Zelda", "Cloud", "Tifa", "Sora", "Riku"
];

const SKINS = [
  "Pale Peach", "Warm Ivory", "Golden Sand", "Rich Honey", "Deep Bronze", "Espresso", "Obsidian", "Cyber-Blue", "Neon Pink", "Radioactive Green", "Ghostly White", "Chrome Silver", "Matte Grey", "Circuit Board", "Transparent", "Glitch Pattern", "Paper Texture", "Clay", "Furry (Orange)", "Furry (Blue)", "Scaly (Green)", "Scaly (Red)", "Metallic Gold", "Holographic", "Inked", "Tattooed", "Scarred", "Pixelated", "Void Black", "Cosmic Stardust", "Wooden", "Stone", "Liquid Metal", "Slime Green", "Candy Red", "Ice Blue", "Magma", "Shadow", "Light", "Rainbow"
];

const HAIRS = [
  "Spiky Blue", "Pink Bob", "Bald", "Green Mohawk", "Silver Long", "Messy Brown", "Blonde Ponytail", "Red Afro", "Purple Braids", "Cyber Dreads", "Neon Spikes", "Water Flow", "Fire Flame", "Cloud Puff", "Cable Wires", "Tentacles", "Crystal Shards", "Hat (Cowboy)", "Hat (Backwards)", "Helmet (Visor)", "Goggles Up", "Bandana", "Top Knot", "Undercut", "Mullet", "Bowl Cut", "Pompadour", "Liberty Spikes", "Curtains", "Buzz Cut", "Faux Hawk", "Twin Tails", "Drill Curls", "Bedhead", "Slicked Back", "Emo Fringe", "Anime Protagonist", "Saiyan Spikes", "Leafy", "Floral", "Feathered", "Horned", "Halo", "Glitch Static"
];

const EXPRESSIONS = [
  "Determined", "Bored", "Hyped", "Smug", "Confused", "Rage", "Zen", "Panic", "Derp", "Cool", "Sadge", "Wink", "Tongue Out", "Skeptical", "Awestruck", "Sleepy", "Manic", "Stoic", "Nervous", "Confident", "Shy", "Flirty", "Deadpan", "Heroic", "Villainous", "Goofy", "Serious", "Tired", "Crying", "Laughing", "Screaming", "Pouting", "Grinning", "Frowning", "Blank", "Glitching", "Pixelated", "Loading...", "Error 404", "Ascended"
];

const GENDERS: PlayerProfile['gender'][] = ['BOY', 'GIRL', 'NON_BINARY', 'DONT_CARE'];

export const CharacterCreator: React.FC<Props> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<PlayerProfile['gender']>('DONT_CARE');
  const [skin, setSkin] = useState('Pale Peach');
  const [hair, setHair] = useState('Spiky Blue');
  const [expression, setExpression] = useState('Determined');
  const [idNumber, setIdNumber] = useState('000-000-000');

  useEffect(() => {
      randomizeId();
      randomizeAll();
  }, []);

  const randomizeId = () => {
      const seg1 = Math.floor(Math.random() * 900) + 100;
      const seg2 = Math.floor(Math.random() * 900) + 100;
      const seg3 = Math.floor(Math.random() * 900) + 100;
      setIdNumber(`${seg1}-${seg2}-${seg3}`);
  };

  const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  const randomizeAll = () => {
      setName(getRandom(NAMES));
      setSkin(getRandom(SKINS));
      setHair(getRandom(HAIRS));
      setExpression(getRandom(EXPRESSIONS));
      setGender(GENDERS[Math.floor(Math.random() * GENDERS.length)]);
      randomizeId();
  };

  const handleSubmit = () => {
      if (!name.trim()) {
          alert("ID Card requires a name!");
          return;
      }
      onComplete({
          name, gender, skinTone: skin, hairStyle: hair, expression
      });
  };

  return (
    <div className="h-full w-full bg-slate-900 flex flex-col md:flex-row p-4 gap-8 relative overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900/20 to-slate-900 pointer-events-none"></div>

        {/* --- LEFT: CONTROLS --- */}
        <div className="flex-1 bg-slate-800/90 p-6 rounded-2xl border border-slate-600 shadow-2xl z-10 flex flex-col gap-6 overflow-y-auto backdrop-blur-sm">
            <div className="flex justify-between items-center border-b border-slate-600 pb-4">
                <h2 className="text-2xl font-toon text-yellow-400 tracking-wide">ID REGISTRATION</h2>
                <Button variant="secondary" onClick={randomizeAll} className="text-xs py-1 px-3">🎲 RANDOMIZE ALL</Button>
            </div>

            <div className="space-y-6">
                {/* NAME INPUT */}
                <div className="group">
                    <label className="flex justify-between text-xs font-mono text-indigo-300 mb-1 uppercase font-bold">
                        Subject Name
                        <span onClick={() => setName(getRandom(NAMES))} className="cursor-pointer text-slate-500 hover:text-white transition-colors">[Randomize]</span>
                    </label>
                    <input 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-900 border-2 border-slate-700 rounded-lg p-3 text-white font-bold tracking-widest focus:border-yellow-400 focus:shadow-[0_0_15px_rgba(250,204,21,0.3)] outline-none transition-all uppercase placeholder-slate-600"
                        placeholder="ENTER NAME..."
                        maxLength={12}
                    />
                </div>

                {/* GENDER SELECT */}
                <div>
                     <label className="block text-xs font-mono text-indigo-300 mb-2 uppercase font-bold">Identity Type</label>
                     <div className="grid grid-cols-2 gap-2">
                         {GENDERS.map(g => (
                             <button 
                                key={g}
                                onClick={() => setGender(g)}
                                className={`text-xs py-2 rounded font-bold border-2 transition-all ${gender === g ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg scale-105' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                             >
                                 {g.replace('_', ' ')}
                             </button>
                         ))}
                     </div>
                </div>

                {/* TRAIT SELECTORS */}
                {[
                    { label: 'Skin Tone', val: skin, set: setSkin, opts: SKINS },
                    { label: 'Hair Style', val: hair, set: setHair, opts: HAIRS },
                    { label: 'Expression', val: expression, set: setExpression, opts: EXPRESSIONS }
                ].map((field) => (
                    <div key={field.label} className="relative">
                        <label className="flex justify-between text-xs font-mono text-indigo-300 mb-1 uppercase font-bold">
                            {field.label}
                            <span onClick={() => field.set(getRandom(field.opts))} className="cursor-pointer text-slate-500 hover:text-white transition-colors">[Randomize]</span>
                        </label>
                        <div className="flex gap-2">
                            <input 
                                value={field.val} 
                                onChange={e => field.set(e.target.value)} 
                                className="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-indigo-500 outline-none"
                            />
                            <button 
                                onClick={() => field.set(getRandom(field.opts))}
                                className="bg-slate-700 hover:bg-slate-600 text-white px-3 rounded border border-slate-600"
                            >
                                ↻
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-auto pt-4 border-t border-slate-700">
                <Button onClick={handleSubmit} className="w-full text-lg py-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 border-none shadow-emerald-900/50">
                    PRINT ID & START [Z]
                </Button>
            </div>
        </div>

        {/* --- RIGHT: ID CARD PREVIEW --- */}
        <div className="flex-1 flex items-center justify-center z-10 perspective-1000">
            <div className="w-full max-w-sm aspect-[1.586] bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl border-4 border-yellow-500 shadow-2xl relative overflow-hidden transform transition-transform hover:rotate-y-6 hover:rotate-x-6 duration-500 group">
                
                {/* Holographic Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0)_40%,rgba(255,255,255,0.1)_100%)] pointer-events-none z-20"></div>
                <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 translate-x-[-150%] animate-[shimmer_3s_infinite] pointer-events-none z-20"></div>

                {/* Header */}
                <div className="bg-yellow-500 p-2 flex justify-between items-center text-slate-900 relative z-10">
                    <div className="font-black text-lg tracking-tighter uppercase italic">ToonTamer™ LICENSE</div>
                    <div className="text-[10px] font-mono font-bold border border-slate-900 px-1 rounded bg-yellow-400">OFFICIAL</div>
                </div>

                {/* Content */}
                <div className="p-4 flex gap-4 h-full relative z-10">
                    {/* Avatar Placeholder */}
                    <div className="w-1/3 h-32 bg-slate-800 border-2 border-slate-600 rounded-lg relative overflow-hidden flex flex-col">
                        <div className="flex-1 bg-slate-700 flex items-center justify-center text-4xl">
                            {gender === 'GIRL' ? '👩' : gender === 'BOY' ? '👨' : gender === 'NON_BINARY' ? '🧑' : '🤖'}
                        </div>
                        <div className="bg-slate-900 text-[8px] text-center text-slate-400 p-1 font-mono">
                            PHOTO PENDING
                        </div>
                    </div>

                    {/* Data Fields */}
                    <div className="flex-1 space-y-2">
                        <div>
                            <div className="text-[8px] text-indigo-400 font-mono uppercase tracking-widest">Name</div>
                            <div className="text-xl font-black text-white uppercase leading-none truncate">{name || "UNKNOWN"}</div>
                        </div>
                        
                        <div className="flex justify-between">
                            <div>
                                <div className="text-[8px] text-indigo-400 font-mono uppercase tracking-widest">ID No.</div>
                                <div className="text-sm font-mono text-yellow-400">{idNumber}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[8px] text-indigo-400 font-mono uppercase tracking-widest">Issued</div>
                                <div className="text-sm font-mono text-white">2025</div>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-white/10">
                            <div className="text-[8px] text-slate-400 font-mono">TRAITS</div>
                            <div className="text-[10px] text-indigo-200 leading-tight">
                                {skin} / {hair} <br/>
                                {expression}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Barcode */}
                <div className="absolute bottom-2 left-4 right-4 h-8 bg-white p-1 flex items-center justify-between opacity-80">
                    <div className="h-full w-3/4 bg-[url('https://upload.wikimedia.org/wikipedia/commons/5/5d/UPC-A-036000291452.svg')] bg-cover"></div>
                    <div className="text-[8px] font-mono font-bold text-black">CLASS C</div>
                </div>
            </div>
        </div>

        <style>{`
            @keyframes shimmer {
                0% { transform: translateX(-150%) rotate(45deg); }
                100% { transform: translateX(150%) rotate(45deg); }
            }
            .perspective-1000 { perspective: 1000px; }
            .rotate-y-6 { transform: rotateY(10deg); }
            .rotate-x-6 { transform: rotateX(10deg); }
        `}</style>
    </div>
  );
};