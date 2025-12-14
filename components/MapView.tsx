import React, { useEffect, useRef, useState } from 'react';
import { MapEntity, LocationData } from '../types';

interface MapViewProps {
  location: LocationData;
  entities: MapEntity[];
  onUpdateEntities: (entities: MapEntity[]) => void;
  onEncounter: (entityId: string) => void;
  onExit: () => void;
}

export const MapView: React.FC<MapViewProps> = ({ location, entities, onUpdateEntities, onEncounter, onExit }) => {
  const requestRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number | undefined>(undefined);
  const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set());

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeysPressed(prev => new Set(prev).add(e.code));
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      setKeysPressed(prev => {
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game Loop
  const updateGame = (time: number) => {
    if (lastTimeRef.current !== undefined) {
      const deltaTime = (time - lastTimeRef.current) / 16; // Normalizing to ~60fps
      
      let player = entities.find(e => e.type === 'PLAYER');
      const enemies = entities.filter(e => e.type === 'ENEMY');

      if (player) {
        // Player Movement
        const speed = player.speed * deltaTime;
        let dx = 0;
        let dy = 0;

        if (keysPressed.has('ArrowUp') || keysPressed.has('KeyW')) dy -= speed;
        if (keysPressed.has('ArrowDown') || keysPressed.has('KeyS')) dy += speed;
        if (keysPressed.has('ArrowLeft') || keysPressed.has('KeyA')) dx -= speed;
        if (keysPressed.has('ArrowRight') || keysPressed.has('KeyD')) dx += speed;

        // Normalize diagonal
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }

        player.x = Math.max(0, Math.min(95, player.x + dx));
        player.y = Math.max(0, Math.min(95, player.y + dy));

        // Enemy AI & Collision
        let encounterTriggered = false;

        enemies.forEach(enemy => {
          if (encounterTriggered) return;

          // Simple Chase Logic
          const dist = Math.hypot(player!.x - enemy.x, player!.y - enemy.y);
          const sightRadius = 30; // % of screen
          const collisionRadius = 5; // % of screen

          if (dist < collisionRadius) {
            encounterTriggered = true;
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            onEncounter(enemy.id);
            return;
          }

          if (dist < sightRadius) {
            // Chase
            const angle = Math.atan2(player!.y - enemy.y, player!.x - enemy.x);
            const enemySpeed = enemy.speed * deltaTime * (Math.random() * 0.5 + 0.5); // Randomize speed slightly
            enemy.x += Math.cos(angle) * enemySpeed;
            enemy.y += Math.sin(angle) * enemySpeed;
          } else {
            // Idle wander
            if (Math.random() < 0.02) {
                enemy.x += (Math.random() - 0.5) * enemy.speed;
                enemy.y += (Math.random() - 0.5) * enemy.speed;
            }
          }
          
          // Clamp enemy
          enemy.x = Math.max(0, Math.min(95, enemy.x));
          enemy.y = Math.max(0, Math.min(95, enemy.y));
        });

        if (!encounterTriggered) {
            onUpdateEntities([player, ...enemies]);
        }
      }
    }
    
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(updateGame);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateGame);
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [entities, keysPressed]); // Re-bind if entities change structure, though we mutate objects for perf in loop usually, react state pattern used here for simplicity

  return (
    <div className="relative w-full h-full overflow-hidden bg-black select-none">
        {/* Background Layer */}
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-80"
            style={{ backgroundImage: `url(${location.imageUrl})` }}
        />
        
        {/* Grid Overlay Effect */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-20 pointer-events-none" />

        {/* UI Overlay */}
        <div className="absolute top-4 left-4 z-20 bg-black/60 text-white p-2 rounded border border-white/50 backdrop-blur-sm">
            <h3 className="text-lg font-toon text-yellow-400">Wilderness</h3>
            <p className="text-xs">Use WASD / Arrows to move.</p>
            <p className="text-xs text-red-300">Avoid or chase the dust clouds!</p>
        </div>

        <button 
            onClick={onExit}
            className="absolute top-4 right-4 z-20 bg-red-600 text-white px-4 py-2 rounded font-bold border-2 border-red-800 hover:bg-red-500"
        >
            Retreat to Camp
        </button>

        {/* Entities */}
        {entities.map(entity => (
            <div
                key={entity.id}
                className="absolute w-12 h-12 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 transition-transform will-change-transform"
                style={{ 
                    left: `${entity.x}%`, 
                    top: `${entity.y}%`,
                    zIndex: entity.type === 'PLAYER' ? 10 : 5
                }}
            >
                <span className={`text-4xl filter drop-shadow-lg ${entity.type === 'ENEMY' ? 'animate-pulse' : ''}`}>
                    {entity.icon}
                </span>
                {entity.type === 'ENEMY' && (
                    <div className="absolute -bottom-2 w-full text-center">
                        <span className="text-[10px] bg-red-600 text-white px-1 rounded-full">!</span>
                    </div>
                )}
            </div>
        ))}
    </div>
  );
};