import React, { useState } from 'react';
import { Monster } from '../types';
import { MonsterCard } from './MonsterCard';
import { Button } from './Button';

interface Props {
  playerParty: Monster[];
  onConfirmTrade: (playerMonId: string, offeredMon: Monster) => void;
  onCancel: () => void;
  generateOffer: (mon: Monster) => Promise<Monster>;
}

export const TradeView: React.FC<Props> = ({ playerParty, onConfirmTrade, onCancel, generateOffer }) => {
  const [selectedPlayerMon, setSelectedPlayerMon] = useState<string | null>(null);
  const [offeredMonster, setOfferedMonster] = useState<Monster | null>(null);
  const [status, setStatus] = useState<'SELECT' | 'CONNECTING' | 'OFFER' | 'CONFIRMING'>('SELECT');

  const handleSelect = async (monId: string) => {
      setSelectedPlayerMon(monId);
      setStatus('CONNECTING');
      
      // Simulate network delay
      setTimeout(async () => {
          const pMon = playerParty.find(m => m.id === monId)!;
          try {
             const offer = await generateOffer(pMon);
             offer.isPlayerOwned = true; // Will be
             setOfferedMonster(offer);
             setStatus('OFFER');
          } catch (e) {
             setStatus('SELECT');
          }
      }, 2000);
  };

  return (
    <div className="h-full w-full bg-slate-900 flex flex-col p-4 relative text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-10"></div>
        
        <div className="z-10 bg-slate-800 border-b border-slate-600 p-4 flex justify-between items-center">
            <h2 className="text-2xl font-toon text-cyan-400">GLOBAL TRADE LINK</h2>
            <Button variant="danger" onClick={onCancel} className="py-1 text-xs">EXIT [X]</Button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row gap-4 p-4 items-center justify-center">
            {/* Player Side */}
            <div className="flex-1 w-full max-w-md bg-slate-800/80 p-4 rounded-xl border-2 border-indigo-500 flex flex-col h-full">
                <h3 className="text-center font-bold mb-4 text-indigo-300">YOUR PARTY</h3>
                <div className="flex-1 overflow-y-auto grid gap-2">
                    {playerParty.map(mon => (
                        <div key={mon.id} onClick={() => status === 'SELECT' && handleSelect(mon.id)} className={`transition-all ${status !== 'SELECT' && selectedPlayerMon !== mon.id ? 'opacity-30 pointer-events-none' : ''}`}>
                             <MonsterCard monster={mon} compact isPlayer selected={selectedPlayerMon === mon.id} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Connection Visual */}
            <div className="flex flex-col items-center justify-center p-4">
                 {status === 'SELECT' && <div className="text-4xl animate-bounce">⬅️</div>}
                 {status === 'CONNECTING' && (
                     <div className="flex flex-col items-center">
                         <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                         <span className="text-xs font-mono text-cyan-400 animate-pulse">SEARCHING SIGNAL...</span>
                     </div>
                 )}
                 {status === 'OFFER' && <div className="text-4xl">🤝</div>}
            </div>

            {/* NPC Side */}
            <div className="flex-1 w-full max-w-md bg-slate-800/80 p-4 rounded-xl border-2 border-emerald-500 flex flex-col h-full items-center justify-center">
                <h3 className="text-center font-bold mb-4 text-emerald-300">INCOMING OFFER</h3>
                
                {offeredMonster ? (
                     <div className="w-full">
                         <p className="text-center text-xs mb-2 font-mono text-emerald-200">TRAINER_GUEST_99 offers:</p>
                         <MonsterCard monster={offeredMonster} />
                         <div className="mt-4 flex gap-2">
                             <Button 
                                onClick={() => {
                                    if(selectedPlayerMon) onConfirmTrade(selectedPlayerMon, offeredMonster);
                                }} 
                                className="w-full bg-emerald-600 hover:bg-emerald-500"
                             >
                                 ACCEPT TRADE [Z]
                             </Button>
                             <Button onClick={() => {
                                 setStatus('SELECT');
                                 setSelectedPlayerMon(null);
                                 setOfferedMonster(null);
                             }} variant="danger">REJECT</Button>
                         </div>
                     </div>
                ) : (
                    <div className="text-slate-500 font-mono text-sm text-center">
                        WAITING FOR CONNECTION...
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};