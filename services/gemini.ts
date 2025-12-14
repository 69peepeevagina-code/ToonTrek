import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Monster, MonsterType, Move, DomeMaster, Gender, AdventureNode, EvolutionOption, PlayerProfile, RivalState, Route, HazardType, StatusEffect } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ART_STYLES = [
  "Nano Banana Aesthetic", // Forced high weight
  "Nano Banana Aesthetic",
  "Hyper-saturated Cel Shaded",
  "Neon Graffiti Vector",
  "DDR Extreme Background Style",
  "Jet Set Radio Future Style"
];

// --- MASSIVE THEME DATABASE (200+ Themes) ---
const WORLD_THEMES = [
  // Sci-Fi / Futurism
  "Cyberpunk Ghetto", "Solarpunk Utopia", "Dieselpunk Warfront", "Atompunk 1950s", "Cassette Futurism", 
  "Biopunk Laboratory", "Nanotech Hive", "Space Opera", "Alien Invasion", "Post-Apocalyptic Wasteland", 
  "Robot Uprising", "Galactic Federation", "Time Travel Paradox", "Virtual Reality Glitch", "Dystopian Megacity", 
  "Lunar Colony", "Mars Terraform", "Underwater City", "Cloud City", "Space Western", "Mecha Hangar", 
  "Genetic Experiment", "AI Singularity", "Holographic Mall", "Cryostasis Vault", "Junk Planet", 
  "Neon Noir", "Retro-Futurism", "Steampunk Victorian", "Clockwork Automaton",

  // Fantasy / Magic
  "High Fantasy Kingdom", "Dark Souls Grimdark", "Urban Fantasy", "Isekai Anime", "Wuxia Martial Arts", 
  "Xianxia Cultivation", "Eldritch Horror", "Cosmic Horror", "Lovecraftian Fishing Hamlet", "Vampire Masquerade", 
  "Werewolf Pack", "Fae Court", "Magical Girl Academy", "Dungeon Crawler", "Necromancer's Crypt", 
  "Dragon's Hoard", "Floating Islands", "Crystal Spire", "Enchanted Forest", "Cursed Swamp", 
  "Haunted Castle", "Ghost Town", "Alchemist's Lab", "Wizard Tower", "Druid Grove", "Goblin Market", 
  "Orc Stronghold", "Elven Sanctum", "Dwarven Forge", "Elemental Plane",

  // Historical / Cultural
  "Wild West Frontier", "Feudal Japan", "Victorian London", "Ancient Egypt", "Classical Rome", 
  "Spartan Battlefield", "Viking Saga", "Aztec Temple", "Mayan Jungle", "Incan Peaks", 
  "Pirate Caribbean", "Roaring 20s", "Great Depression Hobo", "Cold War Spy", "Renaissance Faire", 
  "French Revolution", "Mongol Horde", "Samurai Showdown", "Ninja Village", "Knight's Tournament", 
  "Gladiator Arena", "Prehistoric Jungle", "Ice Age Tundra", "Bronze Age Collapse", "Industrial Revolution",

  // Modern / Urban
  "Corporate Office", "Suburban Horror", "Abandoned Mall", "Liminal Space", "Backrooms", 
  "Fast Food Empire", "Arcade Alley", "Subway Station", "Skyscraper Rooftop", "Ghetto Basketball Court", 
  "High School Drama", "University Campus", "Hospital Ward", "Construction Site", "Junkyard", 
  "Sewer System", "Nightclub District", "Casino Floor", "Museum Heist", "Zoo Breakout", 
  "Amusement Park", "Circus Tent", "Trailer Park", "Luxury Yacht", "Airport Terminal", 
  "Highway Rest Stop", "Gas Station at Night", "Convenience Store", "Pawn Shop", "Dive Bar",

  // Abstract / Weird
  "Vaporwave Plaza", "Dreamcore", "Weirdcore", "Glitchcore", "Surrealist Painting", 
  "Abstract Geometry", "Non-Euclidean Space", "Psychedelic Trip", "Fever Dream", "Rubberhose Cartoon", 
  "Paper Mario Style", "Claymation Horror", "Puppet Show", "Origami World", "Voxel Block World", 
  "ASCII Art Realm", "Deep Fried Meme", "Internet Culture", "Cursed Image", "Analog Horror", 
  "VHS Static", "Found Footage", "Creepypasta", "SCP Containment", "Cryptid Hunt",

  // Nature / Biomes
  "Radioactive Wasteland", "Toxic Jungle", "Frozen Tundra", "Volcanic Ashlands", "Deep Sea Trench", 
  "Coral Reef", "Mushroom Forest", "Crystal Cavern", "Sandstorm Desert", "Oasis", 
  "Rainforest Canopy", "Savannah Plains", "Mountain Peak", "Underground Lake", "Salt Flats", 
  "Geyser Field", "Tar Pits", "Petrified Forest", "Giant Insect Hive", "Bioluminescent Bay",

  // Specific Aesthetics / Tropes
  "Goth Club", "Emo Band", "Skater Park", "Hip Hop Studio", "Heavy Metal Concert", 
  "Rave Party", "Lucha Libre", "Pro Wrestling", "Kaiju Battle", "Super Sentai / Power Rangers", 
  "Magical Girl Transformation", "Shonen Anime Tournament", "Slice of Life Anime", "Noir Detective", "Hardboiled Crime", 
  "Spy Thriller", "Zombie Apocalypse", "Battle Royale", "Hunger Games", "Mad Max Road Warrior", 
  "Fallout Shelter", "Matrix Simulation", "Truman Show", "Toy Story Living Toys", "Lego World", 
  "Card Game Anime", "Beyblade Spinner", "Pokemon Clone", "Digimon Digital World", "Tamagotchi Pet",

  // Food / Objects
  "Candy Kingdom", "Food Court Battle", "Grocery Store Wars", "Toy Factory", "Furniture Store", 
  "Garden Centre", "Library of Alexandria", "Art Gallery", "Music Festival", "Cinema Screen", 
  "Drive-In Theater", "Bowling Alley", "Skating Rink", "Water Park", "Ski Resort", 
  "Golf Course", "Tennis Court", "Football Stadium", "Boxing Ring", "Dojo",

  // Concepts
  "Gravity Shift", "Time Loop", "Parallel Universe", "Mirror World", "Shadow Realm", 
  "Light Dimension", "Sound Wave World", "Data Stream", "Memory Lane", "Subconscious Mind", 
  "Nightmare Fuel", "Happy Tree Friends", "Looney Tunes Logic", "Fourth Wall Break", "Meta Narrative", 
  "Speedrun Glitch", "Developer Room", "Beta Test Level", "Corrupted Save File", "DLC Content"
];

// --- Helper Types for Schema ---
const MoveSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    type: { type: Type.STRING, enum: Object.values(MonsterType) },
    power: { type: Type.INTEGER },
    accuracy: { type: Type.INTEGER },
    description: { type: Type.STRING },
    bpCost: { type: Type.INTEGER },
    tier: { type: Type.STRING, enum: ['LIGHT', 'MEDIUM', 'HEAVY', 'SPECIAL', 'TACTICAL'] },
    isFakeout: { type: Type.BOOLEAN },
    statusEffect: { type: Type.STRING, enum: Object.values(StatusEffect) }
  },
  required: ['name', 'type', 'power', 'accuracy', 'description', 'bpCost', 'tier']
};

const MonsterSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    dominantTypes: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING, enum: Object.values(MonsterType) }
    },
    recessiveTypes: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING, enum: Object.values(MonsterType) }
    },
    description: { type: Type.STRING },
    maxHp: { type: Type.INTEGER },
    attack: { type: Type.INTEGER },
    defense: { type: Type.INTEGER },
    speed: { type: Type.INTEGER },
    gender: { type: Type.STRING, enum: Object.values(Gender) },
    moves: {
      type: Type.ARRAY,
      items: MoveSchema
    },
    fusionTrait: { type: Type.STRING }
  },
  required: ['name', 'dominantTypes', 'recessiveTypes', 'description', 'maxHp', 'attack', 'defense', 'speed', 'moves', 'gender']
};

// --- Retry Logic ---
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function callWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimit = error?.message?.includes('429') || 
                        error?.status === 429 || 
                        error?.message?.toLowerCase().includes('quota') ||
                        error?.message?.toLowerCase().includes('resource exhausted');
    
    if (retries > 0 && isRateLimit) {
      console.warn(`Rate limited. Retrying in ${delay}ms... (${retries} retries left)`);
      await wait(delay);
      return callWithRetry(fn, retries - 1, delay * 2); // Exponential backoff
    }
    throw error;
  }
}

// --- Generators ---

export const generateMonster = async (level: number, typeOverride?: MonsterType, isMeme: boolean = false): Promise<Monster> => {
  const model = 'gemini-2.5-flash';
  
  // 5% Chance for High Budget (Shiny)
  const isHighBudget = Math.random() < 0.05;
  const theme = WORLD_THEMES[Math.floor(Math.random() * WORLD_THEMES.length)];
  const artStyle = "Nano Banana Aesthetic: Hyper-saturated, thick outlines, smear frames, DDR Extreme style.";

  // Scale Max BP with level: Starts at 10, +1 every 10 levels
  const maxBp = 10 + Math.floor(level / 10);

  const prompt = `Generate a Creature/Monster for a 2025 satirical RPG.
  Level: ${level}.
  Core Aesthetic: ${theme}.
  Visual Style: NANO BANANA (Neon, Loud, Thick Outlines, Motion-focused).
  
  NAMING RULE (STRICT): The name must be EXACTLY ONE WORD, TWO SYLLABLES. 
  It must be a portmanteau (e.g., "Rugroach", "Inkott", "Slimefal").
  NO spaces, NO hyphens.
  
  IMPORTANT: Generate Moveset with specific tiers. Moves MUST inflict status effects if possible.
  - Move 1: LIGHT tier (Low power, BP Cost 2)
  - Move 2: MEDIUM tier (Mid power, BP Cost 4)
  - Move 3: HEAVY tier (High power, BP Cost 6)
  - Move 4: SPECIAL tier (Ultimate, BP Cost 12+) OR TACTICAL (BP Cost 3)
  
  Available Status Effects: POISON, SLEEP, SHOOK, DRUNK, HORNY, BURN, FROZEN, PARALYZED, CONFUSED, BLEED, STUNNED, PANICKED, CHARMED, ROTTED, HYPED, EXHAUSTED, FOCUSED, CURSED, SLICKED, ENRAGED.

  Constraints:
  1. Gender: Assign MALE, FEMALE, GENDERLESS, or INTERSEX.
  2. Total types (Dominant + Recessive) must not exceed 4.
  ${typeOverride ? `Must have ${typeOverride} as a Dominant Type.` : ''}
  ${isMeme ? `CRITICAL: This is a "Meme/Fail" monster. Make it pathetic, weird, or useless (e.g., a damp sock, a literal loading spinner). Stats should be low.` : ''}
  
  Stats scale with level (approx 30 + level*6 for base stats).`;

  const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: MonsterSchema,
      temperature: 1.3, // Higher temperature for more variety
    },
  }));

  const text = response.text || "{}";
  const data = JSON.parse(text);
  
  const moves: Move[] = data.moves.map((m: any) => ({
    ...m,
    power: m.power || 40,
    accuracy: m.accuracy || 100,
    bpCost: m.bpCost || 2,
    tier: m.tier || 'LIGHT',
    isFakeout: m.isFakeout || false
  }));

  // Apply Meme Nerf or High Budget Buff
  let finalHp = data.maxHp;
  let finalAtk = data.attack;
  let finalDef = data.defense;
  let finalSpd = data.speed;

  if (isMeme) {
      finalHp = Math.floor(finalHp * 0.5);
      finalAtk = Math.floor(finalAtk * 0.5);
      finalDef = Math.floor(finalDef * 0.5);
      finalSpd = Math.floor(finalSpd * 0.5);
  }

  if (isHighBudget) {
      finalHp = Math.floor(finalHp * 1.3);
      finalAtk = Math.floor(finalAtk * 1.3);
      finalDef = Math.floor(finalDef * 1.3);
      finalSpd = Math.floor(finalSpd * 1.3);
  }

  return {
    id: crypto.randomUUID(),
    ...data,
    dominantTypes: (data.dominantTypes || [MonsterType.MELEE]).slice(0, 2),
    recessiveTypes: (data.recessiveTypes || [MonsterType.MUTANT]).slice(0, 3),
    moves,
    maxHp: finalHp,
    attack: finalAtk,
    defense: finalDef,
    speed: finalSpd,
    currentHp: finalHp,
    maxBp: maxBp,
    currentBp: maxBp,
    maxCombatAp: 10,
    currentCombatAp: 10,
    level,
    exp: 0,
    expToNextLevel: level * 100,
    gender: data.gender || Gender.GENDERLESS,
    isPlayerOwned: false,
    fusionCount: 0,
    instability: 0,
    artStyle,
    evolutionStage: 0,
    isHighBudget,
    whiffCount: 0,
    burnoutStacks: 0,
    isArmored: false,
    statuses: []
  };
};

export const generateEvolutionOptions = async (baseMonster: Monster): Promise<EvolutionOption[]> => {
    let contextPrompt = "";
    if (baseMonster.instability > 60 || baseMonster.fusionCount > 2) {
        contextPrompt = "CRITICAL: The monster's DNA is unstable due to excessive fusion. Include at least one 'Eldritch', 'Glitch', or 'Mutated' horror evolution path.";
    } else {
        contextPrompt = "Standard biological evolution.";
    }

    const theme = WORLD_THEMES[Math.floor(Math.random() * WORLD_THEMES.length)];

    const prompt = `Generate 3 distinct evolution paths for ${baseMonster.name} (${baseMonster.dominantTypes.join('/')}).
    Current Desc: ${baseMonster.description}.
    Current Stats - Atk: ${baseMonster.attack}, Def: ${baseMonster.defense}, Spd: ${baseMonster.speed}.
    Evolution Theme: ${theme}.
    Context: ${contextPrompt}
    
    NAMING RULE: Names must be strict portmanteaus, 2 syllables, 1 word.
    
    Path 1: A natural progression (Adult form).
    Path 2: A specialized path focusing on its highest stat or secondary type.
    Path 3: A divergent path based on the theme '${theme}'.
    
    Return JSON array of 3 options.`;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "Name of the evolution form (e.g. WarGreymon)" },
                description: { type: Type.STRING, description: "Brief flavor text of this form" },
                typeHint: { type: Type.STRING, enum: Object.values(MonsterType) },
                riskLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] }
            },
            required: ['name', 'description', 'riskLevel']
        }
    };

    const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: schema }
    }));

    const data = JSON.parse(response.text || "[]");
    return data.map((d: any) => ({ ...d, id: crypto.randomUUID() }));
};

export const evolveMonster = async (baseMonster: Monster, evolutionOption: EvolutionOption): Promise<Monster> => {
  const prompt = `Evolve this monster: ${baseMonster.name} into ${evolutionOption.name}.
  Path Description: ${evolutionOption.description}.
  Previous Description: ${baseMonster.description}.
  Risk Level: ${evolutionOption.riskLevel}.
  
  Task: Create the stats for this evolution.
  - Theme: ${evolutionOption.name}.
  - Stats: Increase base stats by about 40%.
  - Moves: Keep best moves, add new ones fitting the new form. Ensure moves have tiers (LIGHT, MEDIUM, HEAVY, SPECIAL).
  `;

  const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: MonsterSchema,
    },
  }));

  const data = JSON.parse(response.text || "{}");
  const moves: Move[] = data.moves.map((m: any) => ({
      ...m,
      power: m.power || 60,
      accuracy: m.accuracy || 100,
      bpCost: m.bpCost || 2,
      tier: m.tier || 'LIGHT',
      isFakeout: false
  }));

  // Evolution increases Max BP slightly
  const newMaxBp = baseMonster.maxBp + 2;

  return {
    ...baseMonster, // Keep ID, gender, art style
    ...data, // Overwrite stats, name, desc
    dominantTypes: (data.dominantTypes || baseMonster.dominantTypes).slice(0, 2),
    recessiveTypes: (data.recessiveTypes || baseMonster.recessiveTypes).slice(0, 3),
    moves,
    currentHp: data.maxHp,
    maxBp: newMaxBp,
    currentBp: newMaxBp,
    maxCombatAp: 10,
    currentCombatAp: 10,
    exp: 0,
    expToNextLevel: (baseMonster.level + 1) * 100 * 1.5,
    evolutionStage: baseMonster.evolutionStage + 1,
    isHighBudget: baseMonster.isHighBudget,
    whiffCount: 0,
    burnoutStacks: 0,
    isArmored: false,
    statuses: []
  };
};

export const generateImage = async (prompt: string, type: 'MONSTER' | 'NPC' | 'LOCATION' | 'PLAYER'): Promise<string> => {
  let stylePrompt = '';
  if (type === 'MONSTER') {
      stylePrompt = 'isolated on white background, high quality character design, dynamic pose, full body, NANO BANANA style: thick outlines, neon colors, smear frames.';
  } else if (type === 'NPC' || type === 'PLAYER') {
      stylePrompt = 'Photorealistic, Unreal Engine 5 render, 8k resolution, cinematic lighting, shot on 85mm lens, highly detailed face, human character portrait. Style: Neon Cyberpunk meets Looney Tunes.';
  } else {
      stylePrompt = 'Concept art of a real-life city location in 2025. Atmospheric, detailed background art. 16:9 aspect ratio. Neon lights, high contrast.';
  }

  const finalPrompt = `${prompt} ${stylePrompt}`;

  try {
    const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: finalPrompt,
    }));

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (e) {
    console.error("Image generation failed", e);
  }
  return 'https://picsum.photos/400/300';
};

export const generateMonsterImage = async (monster: Monster): Promise<string> => {
  const specificStyle = monster.artStyle || "Nano Banana Aesthetic";
  const shinyPrompt = monster.isHighBudget ? "Epic Cinematic Lighting, Lens Flare, Glowing Aura, High Budget Movie Poster quality." : "";
  return generateImage(`${monster.name}: ${monster.description}. Art Style: ${specificStyle}. ${shinyPrompt}`, 'MONSTER');
};

export const generatePlayerAvatar = async (profile: PlayerProfile): Promise<string> => {
    const prompt = `Portrait of a generic RPG Protagonist. 
    Name: ${profile.name}.
    Gender: ${profile.gender}.
    Skin Tone: ${profile.skinTone}.
    Hair: ${profile.hairStyle}.
    Expression: ${profile.expression}.
    Wearing modern 2025 streetwear.`;
    
    return generateImage(prompt, 'PLAYER');
};

export const generateTradeOffer = async (playerMon: Monster): Promise<Monster> => {
    // Generate a monster of similar level
    const mon = await generateMonster(playerMon.level, undefined, false);
    return mon;
}

export const generateAvailableRoutes = async (currentLocation: string, level: number): Promise<Route[]> => {
    const theme1 = WORLD_THEMES[Math.floor(Math.random() * WORLD_THEMES.length)];
    const theme2 = WORLD_THEMES[Math.floor(Math.random() * WORLD_THEMES.length)];
    const theme3 = WORLD_THEMES[Math.floor(Math.random() * WORLD_THEMES.length)];

    const prompt = `Generate 3 travel routes departing from ${currentLocation}.
    Level context: ${level}.
    
    Route 1 Theme: ${theme1}.
    Route 2 Theme: ${theme2}.
    Route 3 Theme: ${theme3}.
    
    Routes should vary in difficulty.
    Include environmental HAZARDS (Fog, Wind, Heat, etc) that might affect combat based on the theme.
    
    Return JSON array.`;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                destination: { type: Type.STRING },
                difficulty: { type: Type.NUMBER },
                description: { type: Type.STRING },
                dangerLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
                hazards: { type: Type.ARRAY, items: { type: Type.STRING, enum: Object.values(HazardType) } }
            },
            required: ['name', 'destination', 'difficulty', 'description', 'dangerLevel', 'hazards']
        }
    };

    const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: schema }
    }));

    const data = JSON.parse(response.text || "[]");
    return data.map((r: any) => ({ ...r, id: crypto.randomUUID() }));
};

export const generateAdventureNode = async (level: number, locationContext?: string): Promise<AdventureNode> => {
    const theme = WORLD_THEMES[Math.floor(Math.random() * WORLD_THEMES.length)];
    
    const prompt = `Generate a text adventure encounter in ${locationContext || "a Modern 2025 City"}.
    Theme: ${theme}.
    
    The scenario can be:
    1. A friendly NPC offering items.
    2. A Challenger wanting to battle.
    3. A wild monster.
    
    Return JSON with description, locationName, type, npcName, npcDesc, dialogue.`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            description: { type: Type.STRING },
            locationName: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['FRIENDLY', 'HOSTILE', 'WILD'] },
            npcName: { type: Type.STRING },
            npcDesc: { type: Type.STRING },
            dialogue: { type: Type.STRING }
        },
        required: ['description', 'locationName', 'type']
    };

    const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: schema }
    }));

    const data = JSON.parse(response.text || "{}");
    const imageUrl = await generateImage(`${data.locationName}. ${data.description}. Theme: ${theme}`, 'LOCATION');

    const choices: AdventureNode['choices'] = [];
    let npcImage = undefined;

    if (data.type !== 'WILD') {
       npcImage = await generateImage(`Portrait of ${data.npcName}, ${data.npcDesc}. Theme: ${theme}`, 'NPC');
    }

    if (data.type === 'FRIENDLY') {
        choices.push({ id: 'gift', text: 'Accept Gift', type: 'TALK', data: { name: data.npcName } });
        choices.push({ id: 'leave', text: 'Walk Away', type: 'CONTINUE' });
    } else if (data.type === 'HOSTILE') {
        const teamSize = Math.floor(Math.random() * 3) + 1; 
        const team = [];
        for(let i=0; i<teamSize; i++) {
            team.push(await generateMonster(level));
        }
        choices.push({ id: 'fight', text: 'Battle!', type: 'FIGHT', data: { team, trainerName: data.npcName, trainerImage: npcImage } });
    } else {
        const mon = await generateMonster(level);
        mon.imageUrl = await generateMonsterImage(mon);
        choices.push({ id: 'wild_fight', text: `Fight ${mon.name}`, type: 'FIGHT', data: { team: [mon] } });
        choices.push({ id: 'run', text: 'Sneak away', type: 'CONTINUE' });
    }

    return {
        description: data.description,
        imageUrl,
        choices,
        npcName: data.npcName,
        npcImage: npcImage,
        dialogue: data.dialogue
    };
};

export const generateRoadTrip = async (start: string, end: string, level: number): Promise<AdventureNode> => {
    // Re-use logic but force prompt context
    return generateAdventureNode(level, `the road between ${start} and ${end}`);
};

export const fuseMonsters = async (mon1: Monster, mon2: Monster): Promise<Monster> => {
    // Enhanced fusion logic with risk calculation
    const newFusionCount = Math.max(mon1.fusionCount, mon2.fusionCount) + 1;
    const baseInstability = (mon1.instability + mon2.instability) / 2;
    const addedInstability = (newFusionCount * 15) + (Math.random() * 10);
    const newInstability = Math.min(100, Math.floor(baseInstability + addedInstability));
    
    let statMultiplier = 1.3; 
    let typeMutation = false;

    // Risk Check
    if (newInstability > 50) {
        if (Math.random() > 0.6) {
             statMultiplier = 0.8; // Stat Decay
        } else {
             statMultiplier = 1.6; // High Roll
        }
        if (newInstability > 75) typeMutation = true;
    }

    const level = Math.floor((mon1.level + mon2.level) / 2);
    const maxHp = Math.floor(((mon1.maxHp + mon2.maxHp) / 2) * statMultiplier);
    
    // BP Scaling
    const maxBp = Math.max(mon1.maxBp, mon2.maxBp);

    // Prompt reflects the stability
    let prompt = `Fuse these two monsters into a portmanteau creature: ${mon1.name} and ${mon2.name}.
    Parent 1 Types: ${mon1.dominantTypes.join(',')}.
    Parent 2 Types: ${mon2.dominantTypes.join(',')}.
    
    NAMING RULE: Strict Portmanteau, 1 word, 2 syllables (e.g. "Catdog").
    
    Fusion Trait: Generate a 'Fusion Trait' - a special passive ability description.
    Moves: Ensure moves have specific tiers (LIGHT, MEDIUM, HEAVY).

    If Instability (${newInstability}%) is > 70, make the result mutated, glitchy, or terrifying.
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            moves: { type: Type.ARRAY, items: MoveSchema },
            mutatedType: { type: Type.STRING, enum: Object.values(MonsterType) },
            fusionTrait: { type: Type.STRING, description: "Passive ability description" }
        },
        required: ['name', 'description', 'moves', 'fusionTrait']
    };

    const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: schema }
    }));

    const text = response.text || "{}";
    const data = JSON.parse(text);
    
    // Determine types
    let domTypes = mon1.dominantTypes;
    if (typeMutation && data.mutatedType) {
        domTypes = [data.mutatedType as MonsterType];
    } else if (newInstability > 90) {
        domTypes = [MonsterType.MUTANT];
    }
    
    // Standardize Moves
    const moves: Move[] = data.moves.map((m: any) => ({
      ...m,
      power: m.power || 40,
      accuracy: m.accuracy || 100,
      bpCost: m.bpCost || 2,
      tier: m.tier || 'LIGHT',
      isFakeout: false
    }));

    return {
        id: crypto.randomUUID(),
        ...data,
        dominantTypes: domTypes,
        recessiveTypes: mon2.dominantTypes,
        maxHp, currentHp: maxHp,
        maxBp, currentBp: maxBp,
        maxCombatAp: 10,
        currentCombatAp: 10,
        attack: Math.floor(((mon1.attack + mon2.attack)/2) * statMultiplier),
        defense: Math.floor(((mon1.defense + mon2.defense)/2) * statMultiplier),
        speed: Math.floor(((mon1.speed + mon2.speed)/2) * statMultiplier),
        level,
        exp: 0,
        expToNextLevel: level * 100,
        gender: mon1.gender,
        isPlayerOwned: true,
        fusionCount: newFusionCount,
        instability: newInstability,
        artStyle: mon1.artStyle, // Inherits art style
        evolutionStage: 0,
        isHighBudget: mon1.isHighBudget || mon2.isHighBudget,
        fusionTrait: data.fusionTrait,
        moves,
        whiffCount: 0,
        burnoutStacks: 0,
        isArmored: false,
        statuses: []
    };
};

export const generateDomeMaster = async (index: number): Promise<DomeMaster> => {
   const theme = WORLD_THEMES[Math.floor(Math.random() * WORLD_THEMES.length)];
   const prompt = `Generate a Gym Leader #${index + 1}. Theme: ${theme} in 2025. Ace Monster must use a Fakeout move.`;
   const schema = {
     type: Type.OBJECT,
     properties: {
       name: { type: Type.STRING },
       title: { type: Type.STRING },
       description: { type: Type.STRING },
       badgeName: { type: Type.STRING }
     },
     required: ['name', 'title', 'description', 'badgeName']
   };
   const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { responseMimeType: "application/json", responseSchema: schema }
  }));
  const data = JSON.parse(response.text || "{}");
  const imageUrl = await generateImage(`Portrait of ${data.name}, ${data.description}. Theme: ${theme}`, 'NPC');
  
  const ace = await generateMonster((index + 1) * 10);
  // Inject Fakeout
  ace.moves[3] = { 
      name: "Master's Feint", type: MonsterType.MELEE, power: 0, accuracy: 100, 
      description: "A tricky move to bait defenses.", bpCost: 4, tier: 'TACTICAL', isFakeout: true 
  };
  ace.imageUrl = await generateMonsterImage(ace);

  return { id: crypto.randomUUID(), ...data, imageUrl, team: [ace], aceMonster: ace };
};

export const breedMonsters = async (mon1: Monster, mon2: Monster): Promise<Monster> => {
    // Simple breeding logic: Child takes avg stats + variance, lowest level (1 or 5), mix of types.
    const type1 = mon1.dominantTypes[0];
    const type2 = mon2.dominantTypes[0];
    
    const prompt = `Generate a baby monster offspring of ${mon1.name} (${type1}) and ${mon2.name} (${type2}).
    It should be Level 1.
    Mix their themes.
    Name: 1 word, 2 syllables.
    Stats: Low (baby).
    Moves: Only 1 basic move.
    `;
    
    const schema = {
         type: Type.OBJECT,
         properties: {
             name: { type: Type.STRING },
             description: { type: Type.STRING },
             dominantTypes: { type: Type.ARRAY, items: { type: Type.STRING, enum: Object.values(MonsterType) } },
             moves: { type: Type.ARRAY, items: MoveSchema },
         },
         required: ['name', 'description', 'dominantTypes', 'moves']
    };

    const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: schema }
    }));

    const data = JSON.parse(response.text || "{}");
    
    const moves: Move[] = (data.moves || []).map((m: any) => ({
      ...m,
      power: 20,
      accuracy: 100,
      bpCost: 2,
      tier: 'LIGHT',
      isFakeout: false
    }));

    const baseStat = 20;

    return {
        id: crypto.randomUUID(),
        name: data.name,
        dominantTypes: (data.dominantTypes || [type1]).slice(0, 2),
        recessiveTypes: [type2],
        description: data.description,
        maxHp: 40, currentHp: 40,
        maxBp: 10, currentBp: 10,
        maxCombatAp: 10, currentCombatAp: 10,
        attack: baseStat + Math.floor(Math.random()*10),
        defense: baseStat + Math.floor(Math.random()*10),
        speed: baseStat + Math.floor(Math.random()*10),
        moves,
        level: 1,
        exp: 0,
        expToNextLevel: 100,
        gender: Math.random() > 0.5 ? Gender.MALE : Gender.FEMALE,
        isPlayerOwned: true,
        fusionCount: 0,
        instability: 0,
        artStyle: mon1.artStyle,
        evolutionStage: 0,
        isHighBudget: false,
        whiffCount: 0,
        burnoutStacks: 0,
        isArmored: false,
        statuses: []
    };
};

export const generateRival = async (): Promise<RivalState> => {
    const prompt = `Generate a Rival Character for a 2025 RPG.
    Name: Edgy/Cool name.
    Personality: AGGRESSIVE, CALCULATING, or CHAOTIC.
    Description: Visual description for an image generator.
    Return JSON.`;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            personality: { type: Type.STRING, enum: ['AGGRESSIVE', 'CALCULATING', 'CHAOTIC'] },
            description: { type: Type.STRING }
        },
        required: ['name', 'personality', 'description']
    };

    const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: schema }
    }));
    
    const data = JSON.parse(response.text || "{}");
    const imageUrl = await generateImage(`Anime Rival Character, ${data.name}, ${data.description}`, 'NPC');
    
    const starter = await generateMonster(5);
    starter.imageUrl = await generateMonsterImage(starter);

    return {
        name: data.name,
        imageUrl,
        personality: data.personality,
        team: [starter],
        wins: 0,
        losses: 0
    };
};

export const updateRivalTeam = async (rival: RivalState, playerLevel: number, playerWon: boolean): Promise<RivalState> => {
    const targetLevel = playerLevel + (playerWon ? 2 : 1);
    const teamSize = Math.min(6, rival.team.length + (Math.random() > 0.7 ? 1 : 0));
    
    const newTeam: Monster[] = [];
    
    for (let i=0; i<teamSize; i++) {
        if (i < rival.team.length) {
            const oldMon = { ...rival.team[i] };
            const levelDiff = targetLevel - oldMon.level;
            if (levelDiff > 0) {
                 oldMon.level = targetLevel;
                 oldMon.maxHp += levelDiff * 5;
                 oldMon.attack += levelDiff * 2;
                 oldMon.defense += levelDiff * 2;
                 oldMon.speed += levelDiff * 2;
                 oldMon.currentHp = oldMon.maxHp;
            }
            newTeam.push(oldMon);
        } else {
            const newMon = await generateMonster(targetLevel);
            newMon.imageUrl = await generateMonsterImage(newMon);
            newTeam.push(newMon);
        }
    }
    
    return {
        ...rival,
        team: newTeam,
        wins: playerWon ? rival.wins : rival.wins + 1,
        losses: playerWon ? rival.losses + 1 : rival.losses
    };
};