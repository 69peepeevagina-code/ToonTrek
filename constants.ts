import { MonsterType } from './types';

export const TYPE_COLORS: Record<MonsterType, string> = {
  [MonsterType.FIRE]: 'bg-red-500 text-white',
  [MonsterType.WATER]: 'bg-blue-500 text-white',
  [MonsterType.GRASS]: 'bg-green-500 text-white',
  [MonsterType.EARTH]: 'bg-amber-700 text-white',
  [MonsterType.DARK]: 'bg-gray-900 text-white',
  [MonsterType.CYBER]: 'bg-cyan-400 text-black',
  [MonsterType.MAGIC]: 'bg-purple-500 text-white',
  [MonsterType.MELEE]: 'bg-orange-700 text-white',
  [MonsterType.MUTANT]: 'bg-lime-400 text-black',
  [MonsterType.MENTAL]: 'bg-pink-500 text-white',
  [MonsterType.WIND]: 'bg-sky-300 text-black',
  [MonsterType.ICE]: 'bg-cyan-100 text-blue-900',
  [MonsterType.DRAGON]: 'bg-indigo-700 text-white',
};

// Key is Attacker, Value is list of types it is Strong Against (2.0x)
export const EFFECTIVENESS_CHART: Record<MonsterType, MonsterType[]> = {
    [MonsterType.FIRE]: [MonsterType.GRASS, MonsterType.ICE, MonsterType.CYBER],
    [MonsterType.WATER]: [MonsterType.FIRE, MonsterType.EARTH, MonsterType.MUTANT],
    [MonsterType.GRASS]: [MonsterType.WATER, MonsterType.EARTH, MonsterType.MENTAL],
    [MonsterType.EARTH]: [MonsterType.FIRE, MonsterType.CYBER, MonsterType.MELEE],
    [MonsterType.DARK]: [MonsterType.MAGIC, MonsterType.MENTAL],
    [MonsterType.CYBER]: [MonsterType.WATER, MonsterType.MENTAL, MonsterType.MAGIC],
    [MonsterType.MAGIC]: [MonsterType.MELEE, MonsterType.MUTANT, MonsterType.DRAGON],
    [MonsterType.MELEE]: [MonsterType.CYBER, MonsterType.ICE, MonsterType.DARK],
    [MonsterType.MUTANT]: [MonsterType.GRASS, MonsterType.MAGIC, MonsterType.MENTAL],
    [MonsterType.MENTAL]: [MonsterType.MELEE, MonsterType.MELEE], // Strong vs brawn
    [MonsterType.WIND]: [MonsterType.GRASS, MonsterType.EARTH, MonsterType.FIRE],
    [MonsterType.ICE]: [MonsterType.WIND, MonsterType.DRAGON, MonsterType.GRASS],
    [MonsterType.DRAGON]: [MonsterType.FIRE, MonsterType.WATER, MonsterType.GRASS, MonsterType.EARTH] // Classic boss type
};
