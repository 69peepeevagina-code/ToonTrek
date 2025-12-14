import React from 'react';
import { Route } from '../types';
import { Button } from './Button';

interface Props {
  currentLocation: string;
  routes: Route[];
  onSelectRoute: (route: Route) => void;
  onCancel: () => void;
}

export const RouteSelectView: React.FC<Props> = ({ currentLocation, routes, onSelectRoute, onCancel }) => {
  return (
    <div className="h-full w-full bg-slate-900 text-white p-8 relative overflow-hidden">
        {/* Map Background Aesthetics */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-slate-900"></div>

        <div className="z-10 relative h-full flex flex-col">
            <h1 className="text-4xl font-toon text-center mb-2 text-yellow-400">WORLD MAP</h1>
            <p className="text-center font-mono text-slate-400 mb-8">Departing from: <span className="text-white font-bold">{currentLocation}</span></p>

            <div className="flex-1 flex flex-col gap-4 overflow-y-auto max-w-2xl mx-auto w-full">
                {routes.map(route => (
                    <div 
                        key={route.id} 
                        onClick={() => onSelectRoute(route)}
                        className="bg-slate-800 border-2 border-slate-600 rounded-xl p-6 hover:border-yellow-400 hover:bg-slate-700 cursor-pointer transition-all group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-2 bg-black/30 rounded-bl-xl text-xs font-mono font-bold">
                             DIFFICULTY: {Array(route.difficulty).fill('★').join('')}
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="text-4xl group-hover:scale-125 transition-transform">
                                🛣️
                            </div>
                            <div>
                                <h2 className="text-xl font-black uppercase text-indigo-400 group-hover:text-yellow-400">{route.name}</h2>
                                <p className="text-sm font-mono text-slate-500 mb-2">To: {route.destination}</p>
                                <p className="text-sm text-slate-300 italic">"{route.description}"</p>
                            </div>
                        </div>

                        {route.dangerLevel === 'HIGH' && (
                            <div className="mt-4 text-xs font-bold text-red-500 uppercase tracking-widest border border-red-500/30 p-1 inline-block rounded">
                                ⚠️ High Danger Zone
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-8 text-center">
                <Button onClick={onCancel} variant="secondary">Back to Hub</Button>
            </div>
        </div>
    </div>
  );
};