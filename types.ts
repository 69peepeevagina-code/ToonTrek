export enum MonsterType {
  FIRE = 'FIRE',
  WATER = 'WATER',
  GRASS = 'GRASS',
  EARTH = 'EARTH',
  DARK = 'DARK',
  CYBER = 'CYBER',
  MAGIC = 'MAGIC',
  MELEE = 'MELEE',
  MUTANT = 'MUTANT',
  MENTAL = 'MENTAL',
  WIND = 'WIND',
  ICE = 'ICE',
  DRAGON = 'DRAGON'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  GENDERLESS = 'GENDERLESS',
  INTERSEX = 'INTERSEX'
}

export enum HazardType {
  NONE = 'NONE',
  FOG = 'FOG',     // Accuracy Down
  WIND = 'WIND',   // Throw Accuracy Down
  QUAKE = 'QUAKE', // Random Stumble (Turn skip)
  HEAT = 'HEAT',   // BP Costs Up
  STATIC = 'STATIC'// BP Regen Down
}

export enum StatusEffect {
  POISON = 'POISON',      // DOT
  SLEEP = 'SLEEP',        // Skip turn, wake on hit
  SHOOK = 'SHOOK',        // Whiff chance up
  DRUNK = 'DRUNK',        // Random inputs
  HORNY = 'HORNY',        // Defense down, AI reckless
  BURN = 'BURN',          // BP Drain
  FROZEN = 'FROZEN',      // Delayed action
  PARALYZED = 'PARALYZED',// Chance lose turn
  CONFUSED = 'CONFUSED',  // Self hit risk
  BLEED = 'BLEED',        // Dmg on action
  STUNNED = 'STUNNED',    // Guaranteed whiff
  PANICKED = 'PANICKED',  // Forced random action
  CHARMED = 'CHARMED',    // Can't attack source
  ROTTED = 'ROTTED',      // Healing reduced
  HYPED = 'HYPED',        // AP Gain boosted
  EXHAUSTED = 'EXHAUSTED',// AP Regen slowed
  FOCUSED = 'FOCUSED',    // Perfect dodge window up
  CURSED = 'CURSED',      // BP Costs increased
  SLICKED = 'SLICKED',    // Throw acc reduced
  ENRAGED = 'ENRAGED'     // Dmg up, Whiff up
}

export interface ActiveStatus {
  type: StatusEffect;
  stacks: number;
  duration: number;
}

export interface Move {
  name: string;
  type: MonsterType;
  power: number;
  accuracy: number;
  description: string;
  bpCost: number;
  tier: 'LIGHT' | 'MEDIUM' | 'HEAVY' | 'SPECIAL' | 'TACTICAL';
  isFakeout?: boolean;
  statusChance?: number;
  statusEffect?: StatusEffect;
}

export interface Monster {
  id: string;
  name: string;
  dominantTypes: MonsterType[]; 
  recessiveTypes: MonsterType[]; 
  description: string;
  maxHp: number;
  currentHp: number;
  maxBp: number;
  currentBp: number;
  maxCombatAp: number; // New AP Stat
  currentCombatAp: number;
  attack: number;
  defense: number;
  speed: number;
  moves: Move[];
  imageUrl?: string;
  level: number;
  exp: number; 
  expToNextLevel: number; 
  gender: Gender;
  isPlayerOwned: boolean;
  fusionCount: number;
  instability: number;
  artStyle: string;
  evolutionStage: number; 
  isHighBudget: boolean; 
  fusionTrait?: string; 
  
  // Combat States
  whiffCount: number;
  burnoutStacks: number;
  isArmored: boolean;
  statuses: ActiveStatus[];
}

export interface DomeMaster {
  id: string;
  name: string;
  title: string;
  description: string;
  imageUrl?: string;
  team: Monster[]; 
  badgeName: string;
  aceMonster: Monster;
}

export interface Item {
    id: string;
    name: string;
    type: 'HEAL' | 'CAPTURE' | 'BUFF' | 'CURE' | 'KEY';
    description: string;
    value?: number;
    icon: string;
}

export interface Inventory {
  [key: string]: number; // Item ID -> Count
}

export interface AdventureNode {
  description: string; 
  imageUrl: string;
  choices: {
    id: string;
    text: string;
    type: 'FIGHT' | 'ITEM' | 'TALK' | 'CONTINUE';
    data?: any; 
  }[];
  npcName?: string;
  npcImage?: string;
  dialogue?: string; 
}

export interface EvolutionOption {
  id: string;
  name: string;
  description: string;
  typeHint?: MonsterType;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface PlayerProfile {
  name: string;
  gender: 'BOY' | 'GIRL' | 'NON_BINARY' | 'DONT_CARE';
  skinTone: string;
  hairStyle: string;
  expression: string;
  avatarUrl?: string;
}

export interface RivalState {
  name: string;
  imageUrl: string;
  team: Monster[];
  wins: number;
  losses: number;
  personality: 'AGGRESSIVE' | 'CALCULATING' | 'CHAOTIC';
  lastEncounterLocation?: string;
}

export interface Route {
  id: string;
  name: string;
  destination: string;
  difficulty: number;
  description: string;
  dangerLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  hazards: HazardType[];
}

export interface GameState {
  view: 'INTRO' | 'CHARACTER_CREATOR' | 'HUB' | 'SHOP' | 'BATTLE' | 'FUSION' | 'ADVENTURE' | 'STATS' | 'NURSERY' | 'RV_MAP' | 'EVOLUTION' | 'EVOLUTION_SELECT' | 'TRADE' | 'STARTER_SELECT' | 'ROUTE_SELECT' | 'INVENTORY';
  playerParty: Monster[];
  ribbons: string[];
  activeBattle?: BattleState;
  
  // Player Stats
  playerProfile?: PlayerProfile;
  playerLevel: number;
  currentAp: number;
  maxAp: number;
  
  // RV / Travel Stats
  gas: number;
  maxGas: number;
  currentLocation: string; // e.g., "New York, NY"

  // Rival
  rival?: RivalState;

  // Gym Progress
  gymProgress: number; 

  // Adventure State
  adventureNode?: AdventureNode;
  availableRoutes?: Route[];
  
  // Economy
  gold: number;
  inventory: Inventory;
  
  // Pending Evolutions
  evolutionQueue: string[]; 
  currentEvolutionOptions?: EvolutionOption[]; 
  evolvingMonsterId?: string;
}

export interface BattleState {
  playerMonster: Monster;
  opponentParty: Monster[]; 
  currentOpponentIndex: number;
  turn: number;
  log: string[];
  phase: 'PLAYER_INPUT' | 'ANIMATING' | 'ENDED';
  result?: 'WIN' | 'LOSS' | 'CAUGHT';
  isTrainerBattle: boolean;
  trainerName?: string;
  trainerImage?: string; 
  
  activeHazards: HazardType[];
  vulnerableEntity: 'PLAYER' | 'OPPONENT' | null; // For Whiff Punish
}

export interface MapEntity {
  id: string;
  type: 'PLAYER' | 'ENEMY' | 'NPC' | 'ITEM';
  x: number;
  y: number;
  speed: number;
  icon: string;
}

export interface LocationData {
  name: string;
  imageUrl: string;
}