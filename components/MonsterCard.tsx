import React from 'react';
import { Monster } from '../types';
import { TYPE_COLORS } from '../constants';

interface Props {
  monster: Monster;
  isPlayer?: boolean;
  compact?: boolean;
  onClick?: () => void;
  selected?: boolean;
}

export const MonsterCard: React.FC<Props> = ({ monster, isPlayer = false, compact = false, onClick, selected = false }) => {
  const hpPercent = (monster.currentHp / monster.maxHp) * 100;
  const isHighBudget = monster.isHighBudget;

  return (
    <div 
      onClick={onClick}
      className={`relative bg-slate-900 border-4 rounded-none p-2 shadow-lg transform transition-all group overflow-hidden
      ${selected ? 'border-yellow-400 scale-105 z-10' : 'border-indigo-600'}
      ${onClick ? 'cursor-pointer hover:skew-x-[-2deg] hover:border-pink-500' : ''}
      ${compact ? 'flex flex-row gap-2 h-20' : 'flex flex-col gap-2'}
      `}
    >
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.05)_75%,transparent_75%,transparent)] bg-[size:20px_20px] pointer-events-none"></div>

      {/* Image Container */}
      <div className={`relative ${compact ? 'w-16 h-full' : 'w-full h-48'} bg-black border-2 border-slate-700 overflow-hidden shrink-0`}>
          {monster.imageUrl ? (
            <img src={monster.imageUrl} className="w-full h-full object-contain hover:scale-110 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600 animate-pulse">NO DATA</div>
          )}
          {monster.fusionCount > 0 && (
              <div className="absolute top-0 right-0 bg-pink-600 text-white text-[8px] font-bold px-1 skew-x-[-10deg]">FUSION</div>
          )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between relative z-10">
          <div>
              <div className="flex justify-between items-baseline">
                  <h3 className="font-black text-white italic text-lg leading-none drop-shadow-md truncate">{monster.name}</h3>
                  <span className="text-[10px] text-yellow-400 font-mono">Lv.{monster.level}</span>
              </div>
              <div className="flex gap-1 mt-1">
                  {monster.dominantTypes.map(t => (
                      <span key={t} className={`text-[8px] font-bold px-1 bg-white text-black uppercase transform skew-x-[-10deg]`}>{t}</span>
                  ))}
              </div>
          </div>

          {!compact && (
              <div className="grid grid-cols-2 text-[10px] font-mono text-slate-400 mt-2 bg-black/50 p-1 border border-slate-700">
                  <span>ATK {monster.attack}</span>
                  <span>DEF {monster.defense}</span>
                  <span>SPD {monster.speed}</span>
                  <span className="text-yellow-400">AP {monster.currentCombatAp || 10}</span>
              </div>
          )}

          <div className="mt-1">
              <div className="w-full h-2 bg-slate-800 skew-x-[-20deg] border border-slate-600">
                  <div className="h-full bg-gradient-to-r from-green-400 to-emerald-600" style={{ width: `${hpPercent}%` }}></div>
              </div>
              <div className="text-right text-[8px] text-slate-500 font-bold mt-0.5">{monster.currentHp}/{monster.maxHp}</div>
          </div>
      </div>
    </div>
  );
};