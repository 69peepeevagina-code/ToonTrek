import React, { useState, useEffect } from 'react';
import { GameState, Monster, DomeMaster, Inventory, AdventureNode, MonsterType, EvolutionOption, PlayerProfile, Route } from './types';
import { generateMonster, generateMonsterImage, generateDomeMaster, fuseMonsters, generateAdventureNode, breedMonsters, generateImage, evolveMonster, generateRoadTrip, generateEvolutionOptions, generatePlayerAvatar, generateTradeOffer, generateAvailableRoutes, generateRival, updateRivalTeam } from './services/gemini';
import { BattleView } from './components/BattleView';
import { MonsterCard } from './components/MonsterCard';
import { Button } from './components/Button';
import { VisualNovelOverlay } from './components/VisualNovelOverlay';
import { RVTravelView } from './components/RVTravelView';
import { EvolutionView } from './components/EvolutionView';
import { CharacterCreator } from './components/CharacterCreator';
import { TradeView } from './components/TradeView';
import { StarterSelectionView } from './components/StarterSelectionView';
import { FusionView } from './components/FusionView';
import { RouteSelectView } from './components/RouteSelectView';
import { InventoryMenu } from './components/InventoryMenu';

const INITIAL_STATE: GameState = {
  view: 'INTRO',
  playerParty: [],
  ribbons: [],
  gold: 500,
  inventory: { net: 5, crate: 2, orb: 1, potion: 3 },
  playerLevel: 1,
  currentAp: 10,
  maxAp: 10,
  gas: 500,
  maxGas: 500,
  currentLocation: "New York City, NY",
  gymProgress: 0,
  evolutionQueue: []
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [domeMasters, setDomeMasters] = useState<DomeMaster[]>([]);
  const [fusionSelected, setFusionSelected] = useState<string[]>([]);
  const [starterCandidates, setStarterCandidates] = useState<Monster[]>([]);
  
  // Dr. Phao Xi Image Persistance
  const [phaoXiImage, setPhaoXiImage] = useState<string>('');

  const [vnState, setVnState] = useState<{
      active: boolean;
      name: string;
      image: string;
      dialogue: string;
      onFinish: () => void;
      options?: any[];
  } | null>(null);

  // --- SAVE / LOAD SYSTEM ---
  const saveGame = () => {
      const data = { gameState, domeMasters, phaoXiImage };
      localStorage.setItem('toontrek_save', JSON.stringify(data));
      alert("Game Saved!");
  };

  const loadGame = () => {
      const saved = localStorage.getItem('toontrek_save');
      if (saved) {
          try {
              const parsed = JSON.parse(saved);
              setGameState(parsed.gameState);
              setDomeMasters(parsed.domeMasters);
              if (parsed.phaoXiImage) setPhaoXiImage(parsed.phaoXiImage);
              alert("Game Loaded!");
          } catch (e) {
              alert("Save file corrupted.");
          }
      } else {
          alert("No save found.");
      }
  };

  // --- Logic Helpers ---
  const consumeAp = (amount: number) => {
      if (gameState.currentAp < amount) return false;
      setGameState(prev => ({ ...prev, currentAp: prev.currentAp - amount }));
      return true;
  };

  const restoreAp = () => {
      setGameState(prev => ({ ...prev, currentAp: prev.maxAp, gas: prev.maxGas }));
  };

  const grantExp = (amount: number) => {
      const newParty = [...gameState.playerParty];
      const activeMon = newParty[0]; // Active monster gets exp
      
      if (!activeMon) return;

      activeMon.exp += amount;
      
      let leveledUp = false;
      while (activeMon.exp >= activeMon.expToNextLevel) {
          activeMon.level++;
          activeMon.exp -= activeMon.expToNextLevel;
          activeMon.expToNextLevel = Math.floor(activeMon.expToNextLevel * 1.2);
          
          // Stat Growth
          activeMon.maxHp += Math.floor(Math.random() * 5 + 2);
          activeMon.attack += Math.floor(Math.random() * 3 + 1);
          activeMon.defense += Math.floor(Math.random() * 3 + 1);
          activeMon.speed += Math.floor(Math.random() * 3 + 1);
          activeMon.currentHp = activeMon.maxHp; // Full heal
          
          leveledUp = true;
          alert(`${activeMon.name} grew to Level ${activeMon.level}!`);

          // Evolution Check (Every 5 levels for simplicity)
          if (activeMon.level % 5 === 0) {
              setGameState(prev => ({
                  ...prev,
                  evolutionQueue: [...prev.evolutionQueue, activeMon.id]
              }));
          }
      }

      setGameState(prev => ({ ...prev, playerParty: newParty }));
      
      // Check if we need to switch to evolution view immediately
      if (leveledUp && activeMon.level % 5 === 0) {
          prepareEvolution(activeMon.id);
      }
  };

  // Step 1: Prepare Options
  const prepareEvolution = async (monId: string) => {
      const mon = gameState.playerParty.find(m => m.id === monId);
      if (!mon) return;

      setLoading(true);
      setLoadingMsg("Analyzing DNA Sequences...");
      try {
          const options = await generateEvolutionOptions(mon);
          setGameState(prev => ({
              ...prev,
              view: 'EVOLUTION_SELECT',
              currentEvolutionOptions: options,
              evolvingMonsterId: monId
          }));
      } catch (e) {
          console.error(e);
          alert("Evolution sequence failed.");
      }
      setLoading(false);
  };

  // Step 2: Execute
  const handleEvolutionSelect = async (option: EvolutionOption) => {
      if (!gameState.evolvingMonsterId) return;
      
      setLoading(true);
      setLoadingMsg(`Mutating into ${option.name}...`);
      
      const monId = gameState.evolvingMonsterId;
      const mon = gameState.playerParty.find(m => m.id === monId);
      
      if (mon) {
          try {
              const evolvedMon = await evolveMonster(mon, option);
              evolvedMon.imageUrl = await generateMonsterImage(evolvedMon);
              
              setGameState(prev => {
                  const newParty = prev.playerParty.map(m => m.id === monId ? evolvedMon : m);
                  const newQueue = prev.evolutionQueue.filter(id => id !== monId);
                  return { 
                      ...prev, 
                      playerParty: newParty, 
                      evolutionQueue: newQueue,
                      view: 'HUB',
                      currentEvolutionOptions: undefined,
                      evolvingMonsterId: undefined
                  };
              });
              alert(`Evolution Complete: ${evolvedMon.name}!`);
          } catch(e) {
              console.error(e);
          }
      }
      setLoading(false);
  };

  const startIntro = async () => {
      setLoading(true);
      setLoadingMsg("Booting System...");
      let drImage = phaoXiImage;
      if (!drImage) {
          drImage = await generateImage("Portrait of Dr. Phao Xi, a quirky Chinese scientist with round glasses and a lab coat. Photorealistic, 8k.", "NPC");
          setPhaoXiImage(drImage);
      }
      setLoading(false);

      setVnState({
          active: true,
          name: "Dr. Phao Xi",
          image: drImage,
          dialogue: "Ah, hello! Welcome to Metro City! I am Dr. Phao Xi. Here, we collect Digital Pocket Monsters. Very trendy! Before we begin... I need to register your citizenship.",
          onFinish: () => {
              setVnState(null);
              setGameState(prev => ({ ...prev, view: 'CHARACTER_CREATOR' }));
          }
      });
  };

  const handleCharacterCreated = async (profile: PlayerProfile) => {
      setGameState(prev => ({ ...prev, playerProfile: profile }));
      setLoading(true);
      setLoadingMsg("Printing ID Card...");
      const avatar = await generatePlayerAvatar(profile);
      setGameState(prev => ({ ...prev, playerProfile: { ...profile, avatarUrl: avatar } }));
      setLoading(false);

      // Continue Intro
      setVnState({
          active: true,
          name: "Dr. Phao Xi",
          image: phaoXiImage,
          dialogue: `Excellent, ${profile.name}. Your ID is valid. Now, I have prepared three rare specimens for you to choose from!`,
          onFinish: () => offerStarters()
      });
  };

  const offerStarters = async () => {
      setVnState(null);
      setLoading(true);
      setLoadingMsg("Synthesizing Starter Candidates...");

      try {
          // Generate 3 known starters
          const [grass, fire, water] = await Promise.all([
              generateMonster(5, MonsterType.GRASS),
              generateMonster(5, MonsterType.FIRE),
              generateMonster(5, MonsterType.WATER)
          ]);

          setLoadingMsg("Rendering Visuals...");
          
          // Generate images
          await Promise.all([
              (async () => grass.imageUrl = await generateMonsterImage(grass))(),
              (async () => fire.imageUrl = await generateMonsterImage(fire))(),
              (async () => water.imageUrl = await generateMonsterImage(water))()
          ]);

          setStarterCandidates([grass, fire, water]);
          setGameState(prev => ({ ...prev, view: 'STARTER_SELECT' }));
          
      } catch (e) {
          console.error("Starter generation failed", e);
          alert("Error generating starters. Retrying...");
          offerStarters(); // Retry
      }
      setLoading(false);
  };

  const handleStarterSelected = async (index: number) => {
      setLoading(true);
      
      let starter: Monster;
      if (index === 3) {
          // Mystery Box
          setLoadingMsg("Opening Mystery Crate...");
          const isMeme = Math.random() < 0.3;
          starter = await generateMonster(5, undefined, isMeme);
          starter.imageUrl = await generateMonsterImage(starter);
          if (isMeme) alert("BZZZT! It's a Meme Monster! Unlucky!");
          else alert("JACKPOT! You got a mystery monster!");
      } else {
          starter = starterCandidates[index];
      }

      starter.isPlayerOwned = true;
      
      // Initialize Rival
      const rival = await generateRival();
      
      // Preserve profile when resetting state
      setGameState(prev => ({
          ...INITIAL_STATE,
          playerProfile: prev.playerProfile,
          playerParty: [starter],
          view: 'HUB',
          rival
      }));
      setLoading(false);
  };

  // --- Adventure Mode ---
  const prepareRouteSelection = async () => {
      if (!consumeAp(1)) {
           alert("Not enough AP to scan routes!");
           return;
      }
      setLoading(true);
      setLoadingMsg("Scanning local area...");
      const routes = await generateAvailableRoutes(gameState.currentLocation, gameState.playerLevel);
      setGameState(prev => ({ ...prev, availableRoutes: routes, view: 'ROUTE_SELECT' }));
      setLoading(false);
  };

  const handleRouteSelect = async (route: Route) => {
      setLoading(true);
      setLoadingMsg(`Travelling to ${route.destination}...`);
      
      // Determine if encounter happens (Wild or Rival)
      const roll = Math.random();
      
      // 20% Chance of Rival Encounter if Rival exists
      if (gameState.rival && roll < 0.2) {
          setLoadingMsg("WARNING: RIVAL DETECTED!");
          
          // Update Rival Team to be competitive
          const updatedRival = await updateRivalTeam(gameState.rival, gameState.playerLevel, false);
          
          setGameState(prev => ({
              ...prev,
              rival: updatedRival,
              view: 'BATTLE',
              activeBattle: {
                  playerMonster: prev.playerParty[0],
                  opponentParty: updatedRival.team,
                  currentOpponentIndex: 0,
                  turn: 1,
                  log: [`Rival ${updatedRival.name} intercepted you!`],
                  phase: 'PLAYER_INPUT',
                  isTrainerBattle: true,
                  trainerName: updatedRival.name,
                  trainerImage: updatedRival.imageUrl,
                  activeHazards: route.hazards, // Route Hazards apply
                  vulnerableEntity: null
              }
          }));
          setLoading(false);
          return;
      }

      // Standard Adventure Node logic but context aware of route
      const node = await generateAdventureNode(gameState.playerLevel, route.name);
      
      setGameState(prev => ({
          ...prev,
          currentLocation: route.destination, // Update location
          view: 'ADVENTURE',
          adventureNode: node
      }));
      setLoading(false);
  };

  // --- RV Logic ---
  const handleRVTravel = async (destination: string) => {
      setGameState(prev => ({ ...prev, gas: prev.gas - 100 }));
      setLoading(true);
      setLoadingMsg(`Driving to ${destination}...`);
      
      const node = await generateRoadTrip(gameState.currentLocation, destination, gameState.playerLevel);
      
      setGameState(prev => ({
          ...prev,
          currentLocation: destination,
          view: 'ADVENTURE',
          adventureNode: node
      }));
      setLoading(false);
  };

  const handleAdventureChoice = async (choice: AdventureNode['choices'][0]) => {
      if (choice.type === 'FIGHT') {
          setGameState(prev => ({
              ...prev,
              view: 'BATTLE',
              activeBattle: {
                  playerMonster: prev.playerParty[0],
                  opponentParty: choice.data.team,
                  currentOpponentIndex: 0,
                  turn: 1,
                  log: [],
                  phase: 'PLAYER_INPUT',
                  isTrainerBattle: !!choice.data.trainerName,
                  trainerName: choice.data.trainerName,
                  trainerImage: choice.data.trainerImage,
                  activeHazards: [],
                  vulnerableEntity: null
              }
          }));
      } else if (choice.type === 'TALK') {
          const reward = Math.floor(Math.random() * 50) + 20;
          alert(`You received ${reward} credits!`);
          setGameState(prev => ({ ...prev, gold: prev.gold + reward, view: 'HUB' }));
      } else {
          setGameState(prev => ({ ...prev, view: 'HUB' }));
      }
  };

  const handleDomeChallenge = async () => {
      setLoading(true);
      setLoadingMsg('Entering District...');
      
      const currentRibbons = gameState.ribbons.length;
      if (currentRibbons >= 8) {
          alert("You are the Grand Champion!");
          setLoading(false);
          return;
      }

      // 3 Challengers logic
      if (gameState.gymProgress < 3) {
          if (!consumeAp(3)) {
            alert("Need 3 AP for battle!");
            setLoading(false);
            return;
          }

          const challengerTeam = [
              await generateMonster((currentRibbons + 1) * 5),
              await generateMonster((currentRibbons + 1) * 6)
          ];
          for (const m of challengerTeam) m.imageUrl = await generateMonsterImage(m);

          setGameState(prev => ({
              ...prev,
              activeBattle: {
                  playerMonster: prev.playerParty[0],
                  opponentParty: challengerTeam,
                  currentOpponentIndex: 0,
                  turn: 1,
                  log: [`Challenger #${prev.gymProgress + 1} wants to battle!`],
                  phase: 'PLAYER_INPUT',
                  isTrainerBattle: true,
                  trainerName: "District Challenger",
                  activeHazards: [],
                  vulnerableEntity: null
              },
              view: 'BATTLE'
          }));
      } else {
          // Fight Leader
          let master = domeMasters[currentRibbons];
          if (!master) {
              master = await generateDomeMaster(currentRibbons);
              for (const m of master.team) m.imageUrl = await generateMonsterImage(m);
              setDomeMasters(prev => {
                  const newMasters = [...prev];
                  newMasters[currentRibbons] = master;
                  return newMasters;
              });
          }
          
          setLoading(false);
          setVnState({
              active: true,
              name: master.name,
              image: master.imageUrl || 'https://via.placeholder.com/400',
              dialogue: `So you want the ${master.badgeName} Badge? You'll have to get through my ${master.aceMonster.name} first!`,
              onFinish: () => {
                  setVnState(null);
                  setGameState(prev => ({
                    ...prev,
                    activeBattle: {
                        playerMonster: prev.playerParty[0],
                        opponentParty: master.team,
                        currentOpponentIndex: 0,
                        turn: 1,
                        log: [`${master.name} sent out ${master.team[0].name}!`],
                        phase: 'PLAYER_INPUT',
                        isTrainerBattle: true,
                        trainerName: master.name,
                        trainerImage: master.imageUrl,
                        activeHazards: [],
                        vulnerableEntity: null
                    },
                    view: 'BATTLE'
                }));
              }
          });
          return;
      }
      setLoading(false);
  };

  const handleBattleEnd = async (result: 'WIN' | 'LOSS' | 'CAUGHT', survivor?: Monster) => {
      const newParty = [...gameState.playerParty];
      if (survivor) {
          const idx = newParty.findIndex(m => m.id === survivor.id);
          if (idx !== -1) newParty[idx] = survivor;
      }

      if (result === 'WIN') {
          const goldReward = 100;
          const expGain = 50 * gameState.playerLevel;
          grantExp(expGain);

          // Update Rival Stats if it was a rival battle
          if (gameState.activeBattle?.trainerName === gameState.rival?.name) {
               const updatedRival = await updateRivalTeam(gameState.rival, gameState.playerLevel, true); // Player won, so Rival lost
               setGameState(prev => ({ ...prev, rival: updatedRival }));
               alert("You defeated your Rival!");
          }

          if (gameState.activeBattle?.trainerName) {
             if (gameState.view === 'BATTLE' && gameState.activeBattle.isTrainerBattle && !gameState.activeBattle.trainerName.includes("Challenger") && !gameState.activeBattle.trainerName.includes(gameState.rival?.name || '')) {
                  // Leader Defeated
                  const earnedRibbon = domeMasters[gameState.ribbons.length].badgeName;
                  setGameState(prev => ({
                      ...prev,
                      playerParty: newParty,
                      ribbons: [...prev.ribbons, earnedRibbon],
                      gold: prev.gold + 1000,
                      view: 'HUB',
                      gymProgress: 0, 
                      activeBattle: undefined
                  }));
                  alert(`Earned ${earnedRibbon} Badge!`);
                  return;
             } else {
                 // Challenger or Rival Defeated
                 setGameState(prev => ({
                     ...prev,
                     playerParty: newParty,
                     gold: prev.gold + 150,
                     view: 'HUB',
                     gymProgress: prev.gymProgress + 1,
                     activeBattle: undefined
                 }));
                 return;
             }
          }
          
          setGameState(prev => ({
              ...prev,
              playerParty: newParty,
              gold: prev.gold + goldReward,
              view: 'HUB',
              activeBattle: undefined
          }));
          alert("Victory! Gained EXP.");

      } else if (result === 'CAUGHT' && gameState.activeBattle) {
          const caughtMon = gameState.activeBattle.opponentParty[gameState.activeBattle.currentOpponentIndex];
          caughtMon.isPlayerOwned = true;
          newParty.push(caughtMon);
          setGameState(prev => ({
             ...prev,
             playerParty: newParty,
             view: 'HUB',
             activeBattle: undefined
          }));
          alert(`Captured ${caughtMon.name}!`);
      } else {
          // Loss
          if (newParty[0]) newParty[0].currentHp = newParty[0].maxHp; 

           // Update Rival Stats if it was a rival battle
          if (gameState.activeBattle?.trainerName === gameState.rival?.name) {
               const updatedRival = await updateRivalTeam(gameState.rival!, gameState.playerLevel, false); // Player lost, Rival won
               setGameState(prev => ({ ...prev, rival: updatedRival }));
               alert("Your Rival mocks you as you retreat.");
          }

          setGameState(prev => ({
              ...prev,
              playerParty: newParty,
              view: 'HUB',
              activeBattle: undefined
          }));
          alert("Defeated! You retreated to the Hub.");
      }
  };

  const handleBreeding = async () => {
      if (fusionSelected.length !== 2) return;
      setLoading(true);
      setLoadingMsg('Incubating Egg...');
      
      const p1 = gameState.playerParty.find(m => m.id === fusionSelected[0]);
      const p2 = gameState.playerParty.find(m => m.id === fusionSelected[1]);

      if (p1 && p2) {
          try {
              const baby = await breedMonsters(p1, p2);
              baby.imageUrl = await generateMonsterImage(baby);
              setGameState(prev => ({
                  ...prev,
                  playerParty: [...prev.playerParty, baby],
                  view: 'HUB'
              }));
              setFusionSelected([]);
              alert(`An Egg hatched! It's a ${baby.name}!`);
          } catch (e: any) {
              alert(e.message || "Breeding failed.");
          }
      }
      setLoading(false);
  };
  
  const handleFusion = async () => {
    if (fusionSelected.length !== 2) return;
    setLoading(true);
    setLoadingMsg('Fusing Genomes...');
    
    const mon1 = gameState.playerParty.find(m => m.id === fusionSelected[0]);
    const mon2 = gameState.playerParty.find(m => m.id === fusionSelected[1]);
    
    if (mon1 && mon2) {
        try {
            const fused = await fuseMonsters(mon1, mon2);
            fused.imageUrl = await generateMonsterImage(fused);
            
            const newParty = gameState.playerParty.filter(m => !fusionSelected.includes(m.id));
            newParty.unshift(fused);
            
            setGameState(prev => ({ ...prev, playerParty: newParty, view: 'HUB', gold: prev.gold - 300 }));
            setFusionSelected([]);
            
            alert(`Fusion Successful! ${fused.name} created.`);
            if (fused.instability > 70) {
                alert("Warning: The resulting monster is extremely unstable!");
            }
        } catch(e) { console.error(e); }
    }
    setLoading(false);
  };

  const handleTrade = async (playerMonId: string, offeredMon: Monster) => {
      setLoading(true);
      setLoadingMsg("Transferring Data...");
      
      // Update Images before saving
      if (!offeredMonsterHasImage(offeredMon)) {
          offeredMon.imageUrl = await generateMonsterImage(offeredMon);
      }

      setGameState(prev => {
          const newParty = prev.playerParty.filter(m => m.id !== playerMonId);
          newParty.push(offeredMon);
          return { ...prev, playerParty: newParty, view: 'HUB' };
      });
      
      setLoading(false);
      alert("Trade Successful!");
  };
  
  const offeredMonsterHasImage = (mon: Monster) => !!mon.imageUrl;

  const handleMenuUseItem = (itemId: string, monId: string) => {
      setGameState(prev => {
          const newParty = [...prev.playerParty];
          const mon = newParty.find(m => m.id === monId);
          if (mon) {
             if (itemId === 'potion') {
                 mon.currentHp = Math.min(mon.maxHp, mon.currentHp + 30);
             }
             return {
                 ...prev,
                 playerParty: newParty,
                 inventory: {
                     ...prev.inventory,
                     [itemId]: Math.max(0, prev.inventory[itemId] - 1)
                 }
             };
          }
          return prev;
      });
      alert("Item Used!");
  };

  const usePotionOnMonster = (monId: string) => {
      handleMenuUseItem('potion', monId);
  };

  const handleUseItem = (itemId: keyof Inventory) => {
    setGameState(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        [itemId]: Math.max(0, prev.inventory[itemId] - 1)
      }
    }));
  };

  const renderLoading = () => (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-900/90 z-[100] fixed top-0 left-0 backdrop-blur-sm text-white">
          <div className="animate-spin text-6xl mb-4 text-indigo-500">🧬</div>
          <h2 className="text-2xl font-bold font-sans tracking-widest uppercase">{loadingMsg}</h2>
      </div>
  );

  return (
    <div className="h-full w-full max-w-4xl mx-auto bg-slate-50 shadow-2xl overflow-hidden flex flex-col relative font-sans text-slate-800">
      {loading && renderLoading()}
      
      {vnState && vnState.active && (
          <VisualNovelOverlay 
            characterName={vnState.name}
            characterImage={vnState.image}
            dialogue={vnState.dialogue}
            onAdvance={vnState.onFinish}
            options={vnState.options}
          />
      )}

      {/* Header */}
      <header className="bg-white/90 backdrop-blur text-slate-800 p-4 border-b border-slate-200 flex justify-between items-center shadow-sm z-10 sticky top-0">
        <div className="flex gap-4 items-center">
            {gameState.playerProfile?.avatarUrl && (
                <img src={gameState.playerProfile.avatarUrl} className="w-12 h-12 rounded-full border-2 border-indigo-500 object-cover" />
            )}
            <div>
                <h1 className="text-2xl font-black tracking-tighter text-indigo-600 font-toon">ToonTrek <span className="text-slate-400 text-sm font-sans font-normal">2025</span></h1>
                <div className="flex gap-4 text-xs font-mono font-bold text-slate-500 mt-1">
                    <span className="text-green-600">💵 {gameState.gold}c</span>
                    <span className="text-blue-600">⚡ AP: {gameState.currentAp}/{gameState.maxAp}</span>
                    <span className="text-orange-600">⛽ GAS: {gameState.gas}/{gameState.maxGas}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">📍 {gameState.currentLocation}</div>
            </div>
        </div>
        <div className="flex gap-2 items-center">
             <button onClick={saveGame} className="bg-emerald-500 hover:bg-emerald-400 text-white text-[10px] px-3 py-1 rounded-full font-bold">Save</button>
             <button onClick={loadGame} className="bg-sky-500 hover:bg-sky-400 text-white text-[10px] px-3 py-1 rounded-full font-bold">Load</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-slate-100">
        {gameState.view === 'INTRO' && (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20"></div>
                <div className="z-10 max-w-lg">
                    <h2 className="text-6xl font-toon text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-4 drop-shadow-lg">ToonTrek</h2>
                    <h3 className="text-xl tracking-widest uppercase text-slate-400 mb-8">Urban Legends 2025</h3>
                    <Button onClick={startIntro} className="w-full text-xl py-4 bg-gradient-to-r from-indigo-600 to-purple-600 border-none shadow-lg shadow-indigo-500/50">Start Game</Button>
                </div>
            </div>
        )}
        
        {gameState.view === 'CHARACTER_CREATOR' && (
            <CharacterCreator onComplete={handleCharacterCreated} />
        )}
        
        {gameState.view === 'STARTER_SELECT' && (
            <StarterSelectionView 
                candidates={starterCandidates} 
                onSelect={handleStarterSelected}
            />
        )}

        {gameState.view === 'HUB' && (
            <div className="h-full flex flex-col">
                <div className="h-48 md:h-64 w-full relative border-b border-slate-300 shrink-0 bg-slate-800 overflow-hidden group">
                     <div className="absolute inset-0 bg-[url('https://img.freepik.com/free-photo/night-city-skyscrapers_23-2147610486.jpg')] bg-cover bg-center opacity-60"></div>
                     <div className="absolute bottom-0 left-0 p-6 w-full pt-20 bg-gradient-to-t from-slate-900">
                        <h3 className="text-4xl font-black text-white tracking-tight">METRO CITY</h3>
                        <p className="text-sm font-sans text-indigo-300 uppercase tracking-widest">Main Hub</p>
                        <button onClick={restoreAp} className="mt-4 bg-emerald-500/80 hover:bg-emerald-500 text-white text-xs px-4 py-2 rounded-full backdrop-blur font-bold flex items-center gap-2 w-fit transition-all">
                            <span>💤</span> Sleep (Restore AP & Gas)
                        </button>
                     </div>
                </div>

                <div className="flex-1 p-6 bg-slate-100 flex flex-col gap-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <Button onClick={prepareRouteSelection} variant="action" className="h-24 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-blue-500 border-none shadow-lg shadow-indigo-200">
                            <span className="text-3xl mb-1">🗺️</span>
                            <span className="text-[10px] uppercase font-bold tracking-widest">Travel (-1 AP)</span>
                        </Button>
                        <Button onClick={() => setGameState({...gameState, view: 'RV_MAP'})} className="h-24 flex flex-col items-center justify-center bg-orange-500 text-white border-none shadow-lg shadow-orange-200">
                            <span className="text-3xl mb-1">🚐</span>
                            <span className="text-[10px] uppercase font-bold tracking-widest">RV Trip</span>
                        </Button>
                        <Button onClick={() => setGameState({...gameState, view: 'INVENTORY'})} className="h-24 flex flex-col items-center justify-center bg-white border border-slate-200 shadow-sm hover:shadow-md text-slate-800">
                            <span className="text-3xl mb-1">🎒</span>
                            <span className="text-[10px] uppercase font-bold tracking-widest">Bag</span>
                        </Button>
                        <Button onClick={() => setGameState({...gameState, view: 'FUSION'})} className="h-24 flex flex-col items-center justify-center bg-white border border-slate-200 shadow-sm hover:shadow-md text-slate-800">
                            <span className="text-3xl mb-1">🧬</span>
                            <span className="text-[10px] uppercase font-bold tracking-widest">Fusion</span>
                        </Button>
                        <Button onClick={() => setGameState({...gameState, view: 'NURSERY'})} className="h-24 flex flex-col items-center justify-center bg-white border border-slate-200 shadow-sm hover:shadow-md text-slate-800">
                            <span className="text-3xl mb-1">🥚</span>
                            <span className="text-[10px] uppercase font-bold tracking-widest">Nursery</span>
                        </Button>
                         <Button onClick={() => setGameState({...gameState, view: 'TRADE'})} className="h-24 flex flex-col items-center justify-center bg-white border border-slate-200 shadow-sm hover:shadow-md text-slate-800">
                            <span className="text-3xl mb-1">🤝</span>
                            <span className="text-[10px] uppercase font-bold tracking-widest">Trade</span>
                        </Button>
                    </div>
                    
                    <Button onClick={handleDomeChallenge} variant="danger" className="w-full h-20 flex items-center justify-center gap-4 bg-gradient-to-r from-rose-500 to-orange-500 border-none shadow-lg shadow-orange-200">
                         <span className="text-3xl">🏆</span>
                         <div className="text-left leading-tight">
                             <div className="font-black text-xl italic">CHALLENGE LEADER</div>
                             <div className="text-xs opacity-90 uppercase font-bold tracking-wide">Progress: {gameState.gymProgress}/3 defeated</div>
                         </div>
                    </Button>

                    <div className="flex-1 overflow-y-auto">
                        <h3 className="text-xs font-bold mb-4 text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Active Team</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
                            {gameState.playerParty.map((mon, i) => (
                                <MonsterCard key={mon.id} monster={mon} isPlayer compact={true} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {gameState.view === 'INVENTORY' && (
             <InventoryMenu 
                inventory={gameState.inventory}
                party={gameState.playerParty}
                onUseItem={handleMenuUseItem}
                onClose={() => setGameState(prev => ({ ...prev, view: 'HUB' }))}
             />
        )}

        {gameState.view === 'ROUTE_SELECT' && gameState.availableRoutes && (
            <RouteSelectView 
                currentLocation={gameState.currentLocation}
                routes={gameState.availableRoutes}
                onSelectRoute={handleRouteSelect}
                onCancel={() => setGameState(prev => ({ ...prev, view: 'HUB' }))}
            />
        )}

        {gameState.view === 'EVOLUTION_SELECT' && gameState.currentEvolutionOptions && gameState.evolvingMonsterId && (
            <EvolutionView 
                monster={gameState.playerParty.find(m => m.id === gameState.evolvingMonsterId)!}
                options={gameState.currentEvolutionOptions}
                onSelect={handleEvolutionSelect}
                onCancel={() => setGameState(prev => ({ ...prev, view: 'HUB', currentEvolutionOptions: undefined, evolvingMonsterId: undefined }))}
            />
        )}
        
        {gameState.view === 'TRADE' && (
            <TradeView 
                playerParty={gameState.playerParty} 
                onCancel={() => setGameState(prev => ({ ...prev, view: 'HUB' }))}
                onConfirmTrade={handleTrade}
                generateOffer={generateTradeOffer}
            />
        )}

        {gameState.view === 'RV_MAP' && (
            <RVTravelView 
                currentLocation={gameState.currentLocation}
                gas={gameState.gas}
                maxGas={gameState.maxGas}
                onTravel={handleRVTravel}
                onCancel={() => setGameState(prev => ({ ...prev, view: 'HUB' }))}
            />
        )}

        {gameState.view === 'ADVENTURE' && gameState.adventureNode && (
            <div className="h-full flex flex-col bg-slate-900 text-white relative">
                 <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${gameState.adventureNode.imageUrl})` }}></div>
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                 
                 <div className="z-10 flex-1 flex flex-col p-8 justify-end pb-20">
                     <div className="mb-8">
                         <h2 className="text-3xl font-black mb-2 text-indigo-400 drop-shadow-md">ENCOUNTER</h2>
                         <p className="text-xl leading-relaxed text-slate-200 border-l-4 border-indigo-500 pl-4 bg-black/30 p-4 rounded-r-xl backdrop-blur-sm">{gameState.adventureNode.description}</p>
                     </div>
                     <div className="grid gap-4 max-w-md">
                         {gameState.adventureNode.choices.map(choice => (
                             <Button key={choice.id} onClick={() => handleAdventureChoice(choice)} className="w-full py-4 text-lg bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-left px-6">
                                 ➤ {choice.text}
                             </Button>
                         ))}
                     </div>
                 </div>
            </div>
        )}

        {gameState.view === 'STATS' && (
            <div className="h-full flex flex-col bg-slate-100">
                <div className="p-4 bg-white border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">Team Stats</h2>
                    <Button onClick={() => setGameState({...gameState, view: 'HUB'})} variant="secondary" className="py-1 px-3 text-xs">Back [X]</Button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto grid gap-4">
                     <div className="bg-blue-100 p-2 rounded text-sm text-blue-800">
                         Potions Available: {gameState.inventory.potion} (Click 'Heal' to use)
                     </div>
                     {gameState.playerParty.map(mon => (
                         <div key={mon.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                             <div className="flex gap-4">
                                 <img src={mon.imageUrl} className="w-20 h-20 object-contain bg-slate-50 rounded" />
                                 <div className="flex-1">
                                     <div className="flex justify-between">
                                        <h3 className="font-bold text-lg">{mon.name}</h3>
                                        <span className="text-xs bg-slate-200 px-2 py-1 rounded">{mon.gender}</span>
                                     </div>
                                     <div className="text-xs text-slate-500 italic mb-2">{mon.artStyle}</div>
                                     <div className="text-xs text-slate-500 grid grid-cols-2 gap-2 mt-2 font-mono">
                                         <span>ATK: {mon.attack}</span>
                                         <span>DEF: {mon.defense}</span>
                                         <span>SPD: {mon.speed}</span>
                                         <span>LVL: {mon.level}</span>
                                     </div>
                                     {/* EXP BAR */}
                                     <div className="mt-2 w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                                        <div className="bg-blue-500 h-full" style={{ width: `${(mon.exp / mon.expToNextLevel) * 100}%` }}></div>
                                     </div>
                                     <div className="text-[10px] text-right text-slate-400">Next Level: {mon.expToNextLevel - mon.exp} EXP</div>

                                     <div className="mt-2 flex justify-between items-center">
                                         <span className="text-xs">{mon.currentHp}/{mon.maxHp} HP</span>
                                         <button 
                                            onClick={() => usePotionOnMonster(mon.id)}
                                            disabled={gameState.inventory.potion <= 0 || mon.currentHp >= mon.maxHp}
                                            className="bg-green-500 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                                         >
                                             Heal
                                         </button>
                                     </div>
                                     {/* Evolution Button Trigger if stuck */}
                                     {gameState.evolutionQueue.includes(mon.id) && (
                                         <button onClick={() => prepareEvolution(mon.id)} className="w-full mt-2 bg-purple-500 text-white text-xs font-bold py-1 rounded animate-pulse">
                                             EVOLUTION READY! (Press to View)
                                         </button>
                                     )}
                                     {mon.fusionTrait && (
                                         <div className="mt-2 p-1 bg-yellow-100 border border-yellow-300 rounded text-[10px] text-yellow-800">
                                             <strong>TRAIT:</strong> {mon.fusionTrait}
                                         </div>
                                     )}
                                 </div>
                             </div>
                         </div>
                     ))}
                </div>
            </div>
        )}

        {gameState.view === 'NURSERY' && (
            <div className="h-full flex flex-col bg-pink-50">
                 <div className="p-4 bg-white border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-pink-600">Breeding Nursery</h2>
                    <Button onClick={() => setGameState({...gameState, view: 'HUB'})} variant="secondary" className="py-1 px-3 text-xs">Back [X]</Button>
                </div>
                <div className="p-6 text-center">
                     <p className="mb-4 text-sm text-slate-600">Select two compatible monsters to breed.</p>
                     <div className="flex justify-center gap-4 mb-6">
                         {[0,1].map(idx => (
                             <div key={idx} className="w-24 h-24 border-2 border-dashed border-pink-300 rounded flex items-center justify-center bg-white">
                                 {fusionSelected[idx] ? 
                                     <img src={gameState.playerParty.find(m=>m.id === fusionSelected[idx])?.imageUrl} className="w-full h-full object-contain p-2" /> 
                                     : <span className="text-pink-300">Select</span>}
                             </div>
                         ))}
                     </div>
                     <Button onClick={handleBreeding} disabled={fusionSelected.length !== 2} className="bg-pink-500 hover:bg-pink-400 w-full shadow-lg shadow-pink-200">Breed Monsters</Button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 gap-4">
                     {gameState.playerParty.map(mon => (
                         <div 
                            key={mon.id} 
                            onClick={() => {
                                if (fusionSelected.includes(mon.id)) setFusionSelected(prev => prev.filter(id => id !== mon.id));
                                else if (fusionSelected.length < 2) setFusionSelected(prev => [...prev, mon.id]);
                            }}
                            className={`p-2 border-2 rounded cursor-pointer transition-all ${fusionSelected.includes(mon.id) ? 'border-pink-500 bg-pink-100 scale-105' : 'border-slate-200 bg-white'}`}
                         >
                             <img src={mon.imageUrl} className="w-full h-20 object-contain" />
                             <div className="text-center text-xs font-bold mt-1">{mon.name}</div>
                             <div className="text-center text-[10px] text-slate-500">{mon.gender}</div>
                         </div>
                     ))}
                </div>
            </div>
        )}

        {gameState.view === 'FUSION' && (
             <FusionView 
                party={gameState.playerParty}
                selectedIds={fusionSelected}
                onToggleSelect={(id) => {
                    if (fusionSelected.includes(id)) {
                        setFusionSelected(prev => prev.filter(mid => mid !== id));
                    } else if (fusionSelected.length < 2) {
                        setFusionSelected(prev => [...prev, id]);
                    }
                }}
                onFuse={handleFusion}
                onClose={() => {
                    setGameState(prev => ({ ...prev, view: 'HUB' }));
                    setFusionSelected([]);
                }}
                gold={gameState.gold}
             />
        )}

        {gameState.view === 'BATTLE' && gameState.activeBattle && (
            <BattleView 
                playerMonster={gameState.activeBattle.playerMonster}
                opponentParty={gameState.activeBattle.opponentParty}
                isTrainerBattle={gameState.activeBattle.isTrainerBattle}
                trainerName={gameState.activeBattle.trainerName}
                trainerImage={gameState.activeBattle.trainerImage}
                inventory={gameState.inventory}
                activeHazards={gameState.activeBattle.activeHazards}
                onBattleEnd={handleBattleEnd}
                onUseItem={handleUseItem}
            />
        )}
      </main>
      
      {/* Global Bottom Bar Hint */}
      {!vnState?.active && gameState.view !== 'INTRO' && (
          <div className="bg-slate-900 text-slate-500 text-[10px] p-1 text-center font-mono select-none">
              CONTROLS: [Z / ENTER] CONFIRM &bull; [X / ESC] BACK &bull; [ARROWS] NAVIGATE
          </div>
      )}
    </div>
  );
};

export default App;