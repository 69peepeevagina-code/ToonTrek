import React, { useState } from 'react';
import { Button } from './Button';

interface Props {
  currentLocation: string;
  gas: number;
  maxGas: number;
  onTravel: (destination: string) => void;
  onCancel: () => void;
}

// Simplified List of US Destinations for "SatNav" theme
const DESTINATIONS = [
    { id: 'nyc', name: 'New York City, NY', coords: { x: 90, y: 30 } },
    { id: 'la', name: 'Los Angeles, CA', coords: { x: 10, y: 60 } },
    { id: 'chi', name: 'Chicago, IL', coords: { x: 65, y: 35 } },
    { id: 'mia', name: 'Miami, FL', coords: { x: 85, y: 90 } },
    { id: 'sea', name: 'Seattle, WA', coords: { x: 10, y: 10 } },
    { id: 'aus', name: 'Austin, TX', coords: { x: 50, y: 80 } },
    { id: 'den', name: 'Denver, CO', coords: { x: 35, y: 45 } },
    { id: 'nola', name: 'New Orleans, LA', coords: { x: 60, y: 85 } },
    { id: 'vegas', name: 'Las Vegas, NV', coords: { x: 15, y: 55 } },
    { id: 'dc', name: 'Washington D.C.', coords: { x: 88, y: 40 } },
];

export const RVTravelView: React.FC<Props> = ({ currentLocation, gas, maxGas, onTravel, onCancel }) => {
  const [selectedDest, setSelectedDest] = useState<string | null>(null);

  return (
    <div className="h-full w-full bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* CRT Effect Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 pointer-events-none bg-[length:100%_2px,3px_100%]"></div>
        
        <div className="bg-slate-800 border-8 border-slate-600 rounded-3xl p-6 shadow-2xl w-full max-w-4xl flex flex-col md:flex-row gap-6 z-10 relative">
            
            {/* Map Screen */}
            <div className="flex-1 bg-blue-900/50 rounded-xl border-4 border-slate-700 relative h-96 overflow-hidden group shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
                <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Blank_US_Map_%28states_only%29.svg/1280px-Blank_US_Map_%28states_only%29.svg.png" 
                    className="w-full h-full object-contain opacity-50 grayscale group-hover:grayscale-0 transition-all duration-1000"
                    alt="US Map"
                />
                
                {/* Pins */}
                {DESTINATIONS.map(dest => (
                    <button
                        key={dest.id}
                        onClick={() => setSelectedDest(dest.name)}
                        className={`absolute w-4 h-4 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2 hover:scale-150 transition-all
                            ${dest.name === currentLocation ? 'bg-green-500 animate-ping' : dest.name === selectedDest ? 'bg-yellow-400 scale-125' : 'bg-red-500'}
                        `}
                        style={{ left: `${dest.coords.x}%`, top: `${dest.coords.y}%` }}
                        title={dest.name}
                    >
                    </button>
                ))}

                <div className="absolute top-2 left-2 font-mono text-green-400 text-xs">
                    GPS SIGNAL: STRONG <br/>
                    CURRENT: {currentLocation}
                </div>
            </div>

            {/* Controls */}
            <div className="w-full md:w-64 flex flex-col gap-4">
                <div className="bg-black/40 p-4 rounded-xl border border-slate-500">
                    <h2 className="text-xl font-toon text-yellow-400 mb-2">RV Dashboard</h2>
                    <div className="flex justify-between text-sm text-slate-300 font-mono mb-2">
                        <span>GAS TANK</span>
                        <span className={gas < 100 ? "text-red-500 animate-pulse" : "text-green-400"}>{gas} / {maxGas} L</span>
                    </div>
                    <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full" style={{ width: `${(gas/maxGas)*100}%` }}></div>
                    </div>
                </div>

                <div className="bg-black/40 p-4 rounded-xl border border-slate-500 flex-1">
                    <label className="text-xs text-slate-400 font-mono uppercase">Destination</label>
                    <div className="text-lg text-white font-bold truncate mb-4 border-b border-slate-600 pb-2">
                        {selectedDest || "Select on Map"}
                    </div>
                    
                    {selectedDest && (
                        <div className="text-xs text-slate-400 mb-4 font-mono">
                            TRIP COST: <span className="text-yellow-400">100 GAS</span><br/>
                            DISTANCE: CALCULATING...
                        </div>
                    )}

                    <Button 
                        disabled={!selectedDest || gas < 100 || selectedDest === currentLocation}
                        onClick={() => selectedDest && onTravel(selectedDest)}
                        className="w-full mb-2 bg-emerald-600 hover:bg-emerald-500"
                    >
                        START ENGINE
                    </Button>
                    <Button variant="secondary" onClick={onCancel} className="w-full">
                        CANCEL
                    </Button>
                </div>
            </div>
        </div>
    </div>
  );
};
