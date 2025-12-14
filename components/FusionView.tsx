import React from 'react';
import { Monster } from '../types';
import { MonsterCard } from './MonsterCard';
import { Button } from './Button';

interface Props {
  party: Monster[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onFuse: () => void;
  onClose: () => void;
  gold: number;
}

export const FusionView: React.FC<Props> = ({ party, selectedIds, onToggleSelect, onFuse, onClose, gold }) => {
  
  const mon1 = party.find(m => m.id === selectedIds[0]);
  const mon2 = party.find(m => m.id === selectedIds[1]);

  // Calculate projected instability
  let projectedInstability = 0;
  if (mon1 && mon2) {
      const base = (mon1.instability + mon2.instability) / 2;
      const countPenalty = (Math.max(mon1.fusionCount, mon2.fusionCount) + 1) * 15;
      projectedInstability = Math.min(100, Math.floor(base + countPenalty));
  }

  const riskColor = projectedInstability < 40 ? 'text-green-400' : projectedInstability < 70 ? 'text-yellow-400' : 'text-red-500 animate-pulse';
  const riskLabel = projectedInstability < 40 ? 'STABLE' : projectedInstability < 70 ? 'UNSTABLE' : 'CRITICAL ERROR';

  return (
     <div className="h-full flex flex-col bg-slate-900 text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-transparent to-slate-900"></div>

        <div className="p-6 bg-slate-800 border-b border-slate-700 flex justify-between items-center shadow-md z-10">
            <div>
                <h2 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">GENETIC FUSION LAB</h2>
                <p className="text-xs text-indigo-300 font-mono">COST: 300c / OPERATION</p>
            </div>
            <Button onClick={onClose} variant="danger" className="py-2 px-4 text-xs uppercase font-bold bg-slate-700 hover:bg-slate-600 shadow-none">Close [X]</Button>
        </div>
        
        {/* Main Lab Area */}
        <div className="p-8 text-center bg-slate-900 relative z-10 flex flex-col items-center">
            
            {/* Tubes */}
            <div className="flex justify-center gap-12 mb-8 items-center w-full max-w-4xl">
                 <div className="relative group">
                    <div className={`w-32 h-32 border-4 ${selectedIds[0] ? 'border-indigo-500 bg-indigo-900/20' : 'border-dashed border-slate-600'} rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-300`}>
                        {mon1 ? <img src={mon1.imageUrl} className="w-full h-full object-contain p-2" /> : <span className="text-4xl opacity-20">?</span>}
                    </div>
                    {mon1 && <div className="text-xs font-mono mt-2 text-indigo-300">GENOME A</div>}
                 </div>

                 <div className="flex flex-col items-center">
                    <div className="text-4xl text-slate-600 mb-2">➔</div>
                    {mon1 && mon2 && (
                        <div className="w-64 bg-black/50 p-4 rounded-xl border border-slate-700">
                            <div className="text-xs font-mono text-slate-400 mb-1">PROJECTED INSTABILITY</div>
                            <div className="w-full bg-slate-700 h-4 rounded-full overflow-hidden mb-2">
                                <div className={`h-full ${projectedInstability < 50 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${projectedInstability}%` }}></div>
                            </div>
                            <div className={`font-black text-xl ${riskColor}`}>{projectedInstability}% [{riskLabel}]</div>
                            {projectedInstability > 50 && (
                                <div className="text-[10px] text-red-400 mt-1 uppercase font-bold">Warning: Mutation Risk High</div>
                            )}
                        </div>
                    )}
                 </div>

                 <div className="relative group">
                    <div className={`w-32 h-32 border-4 ${selectedIds[1] ? 'border-indigo-500 bg-indigo-900/20' : 'border-dashed border-slate-600'} rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-300`}>
                        {mon2 ? <img src={mon2.imageUrl} className="w-full h-full object-contain p-2" /> : <span className="text-4xl opacity-20">?</span>}
                    </div>
                     {mon2 && <div className="text-xs font-mono mt-2 text-indigo-300">GENOME B</div>}
                 </div>
            </div>

            <Button 
                disabled={selectedIds.length !== 2 || gold < 300} 
                onClick={onFuse} 
                className={`border-none text-xl w-full max-w-sm mx-auto shadow-2xl py-4 font-black tracking-widest uppercase transition-all
                    ${selectedIds.length === 2 ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105' : 'bg-slate-700 opacity-50'}
                `}
            >
                {selectedIds.length !== 2 ? 'Select 2 Subjects' : gold < 300 ? 'Insufficient Funds' : 'INITIATE FUSION'}
            </Button>
        </div>

        {/* Selection Tray */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-800/50">
            <h3 className="text-slate-400 font-bold mb-4 uppercase tracking-wider text-sm">Available Specimens</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {party.map(mon => (
                    <MonsterCard 
                        key={mon.id} 
                        monster={mon} 
                        compact={true}
                        selected={selectedIds.includes(mon.id)}
                        onClick={() => onToggleSelect(mon.id)}
                    />
                ))}
            </div>
        </div>
    </div>
  );
};