import React, { useState } from 'react';
import { Inventory, Monster, Item } from '../types';
import { Button } from './Button';
import { MonsterCard } from './MonsterCard';

interface Props {
  inventory: Inventory;
  party: Monster[];
  onUseItem: (itemId: string, targetMonId: string) => void;
  onClose: () => void;
}

const ITEMS_DB: Record<string, Item> = {
    'potion': { id: 'potion', name: 'Potion', type: 'HEAL', description: 'Heals 30 HP.', value: 30, icon: '🥤' },
    'orb': { id: 'orb', name: 'Toon Orb', type: 'CAPTURE', description: 'Master capture device.', icon: '🔮' },
    'net': { id: 'net', name: 'Web Net', type: 'CAPTURE', description: 'Basic capture.', icon: '🕸️' },
    'crate': { id: 'crate', name: 'Digi-Crate', type: 'CAPTURE', description: 'Advanced capture.', icon: '📦' }
};

export const InventoryMenu: React.FC<Props> = ({ inventory, party, onUseItem, onClose }) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const availableItems = Object.keys(inventory).filter(k => inventory[k] > 0);

  const handleUse = (monId: string) => {
      if (selectedItem) {
          onUseItem(selectedItem, monId);
          setSelectedItem(null);
      }
  };

  return (
    <div className="h-full w-full bg-slate-900 text-white p-4 relative overflow-hidden flex flex-col">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-10"></div>
         
         <div className="z-10 flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
             <h2 className="text-3xl font-toon text-amber-400">BAG POCKET</h2>
             <Button variant="danger" onClick={onClose} className="text-xs">CLOSE [X]</Button>
         </div>

         <div className="flex-1 flex gap-8 overflow-hidden z-10">
             {/* Item List */}
             <div className="w-1/3 bg-slate-800 rounded-xl border border-slate-600 overflow-y-auto">
                 {availableItems.map(key => {
                     const item = ITEMS_DB[key];
                     return (
                         <div 
                            key={key} 
                            onClick={() => item.type !== 'CAPTURE' && setSelectedItem(key)}
                            className={`p-4 border-b border-slate-700 cursor-pointer hover:bg-slate-700 flex justify-between items-center ${selectedItem === key ? 'bg-indigo-900 border-l-4 border-indigo-500' : ''}`}
                         >
                             <div className="flex items-center gap-3">
                                 <span className="text-2xl">{item.icon}</span>
                                 <div>
                                     <div className="font-bold">{item.name}</div>
                                     <div className="text-[10px] text-slate-400">{item.description}</div>
                                 </div>
                             </div>
                             <div className="font-mono font-bold text-xl">x{inventory[key]}</div>
                         </div>
                     );
                 })}
             </div>

             {/* Usage Panel */}
             <div className="flex-1 flex flex-col">
                 <div className="bg-slate-800 p-4 rounded-xl border border-slate-600 mb-4 h-24 flex items-center justify-center text-slate-400 italic">
                     {selectedItem ? "Select a Party Member to use item on." : "Select an item from the left."}
                 </div>

                 <div className="flex-1 grid grid-cols-2 gap-4 overflow-y-auto">
                     {party.map(mon => (
                         <div key={mon.id} onClick={() => handleUse(mon.id)} className={`relative ${selectedItem ? 'cursor-pointer hover:scale-[1.02] transition-transform' : 'opacity-50 grayscale'}`}>
                             <MonsterCard monster={mon} compact />
                             {selectedItem && (
                                 <div className="absolute inset-0 bg-indigo-500/20 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 font-bold text-white shadow-lg">
                                     USE
                                 </div>
                             )}
                         </div>
                     ))}
                 </div>
             </div>
         </div>
    </div>
  );
};