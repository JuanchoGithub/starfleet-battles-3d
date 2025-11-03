
import React, { useState, useEffect, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { MainUI } from './components/UI/MainUI';
import { Ship, GameState, CameraView, ShipType, Faction, AlertLevel, GameSpeed, ManeuverType, Decoy } from './types';
import { initialShips } from './constants';
import * as THREE from 'three';


const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    ships: initialShips,
    projectiles: [],
    decoys: [],
    selectedShipId: 1,
    targetShipId: 2,
    activeManeuver: null,
  });
  const [cameraView, setCameraView] = useState<CameraView>(CameraView.TARGET);
  const [gameSpeed, setGameSpeed] = useState<GameSpeed>(GameSpeed.PLAY);

  const handleSetTargetRotation = useCallback((targetRotation: number) => {
    setGameState(prev => ({
      ...prev,
      ships: prev.ships.map(ship => 
        ship.id === prev.selectedShipId ? { ...ship, targetRotation } : ship
      ),
    }));
  }, []);

  const handleSetTargetShipId = useCallback((id: number) => {
    setGameState(prev => ({
      ...prev,
      targetShipId: id,
    }));
  }, []);
  
  const handleSetDesiredSpeed = useCallback((speed: number) => {
    setGameState(prev => ({
      ...prev,
      ships: prev.ships.map(ship => 
        ship.id === prev.selectedShipId ? { ...ship, desiredSpeed: speed } : ship
      ),
    }));
  }, []);

  const handleSetAlertLevel = useCallback((level: AlertLevel) => {
    setGameState(prev => ({
      ...prev,
      ships: prev.ships.map(ship => 
        ship.id === prev.selectedShipId ? { ...ship, alertLevel: level } : ship
      ),
    }));
  }, []);

  const handleSetEnergyAllocation = useCallback((componentType: 'engines' | 'shield' | 'weapon', index: number, value: number) => {
    setGameState(prev => {
        const ships = prev.ships.map(ship => {
            if (ship.id === prev.selectedShipId) {
                // Create deep enough copies to avoid mutation
                const newShip = { 
                    ...ship, 
                    shields: ship.shields.map(s => ({...s})), 
                    weapons: ship.weapons.map(w => ({...w})) 
                };

                if (componentType === 'engines') {
                    newShip.engines = { ...newShip.engines, energyAllocation: value };
                } else if (componentType === 'shield' && newShip.shields[index]) {
                    newShip.shields[index].energyAllocation = value;
                } else if (componentType === 'weapon' && newShip.weapons[index]) {
                    newShip.weapons[index].energyAllocation = value;
                }
                return newShip;
            }
            return ship;
        });
        return { ...prev, ships };
    });
  }, []);

  const handleInitiateManeuver = useCallback((maneuverType: ManeuverType) => {
    setGameState(prev => {
        if (prev.activeManeuver) return prev; // Don't start a new one if one is active
        const playerShip = prev.ships.find(s => s.id === prev.selectedShipId);
        if (playerShip?.isErratic || playerShip?.isIntercepting) return prev; // Can't start while doing other helm actions
        return {
            ...prev,
            activeManeuver: {
                type: maneuverType,
                charge: 0,
                chargeNeeded: 50,
                status: 'charging',
            }
        };
    });
  }, []);

  const handleCancelManeuver = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      activeManeuver: null,
    }));
  }, []);

  const handleToggleErraticManeuvers = useCallback(() => {
    setGameState(prev => {
      const playerShip = prev.ships.find(s => s.id === prev.selectedShipId);
      if (!playerShip) return prev;
      
      if (!playerShip.isErratic && prev.activeManeuver) {
          return prev;
      }
      return {
          ...prev,
          ships: prev.ships.map(ship => {
              if (ship.id === prev.selectedShipId) {
                  const newIsErratic = !ship.isErratic;
                  return {
                      ...ship,
                      isErratic: newIsErratic,
                      isIntercepting: newIsErratic ? false : ship.isIntercepting // Turn off intercept if erratic is on
                  };
              }
              return ship;
          }),
      };
    });
  }, []);

  const handleToggleIntercept = useCallback(() => {
    setGameState(prev => {
      const playerShip = prev.ships.find(s => s.id === prev.selectedShipId);
      if (!playerShip || prev.activeManeuver) return prev;
      
      const isCurrentlyIntercepting = playerShip.isIntercepting;
      if (!isCurrentlyIntercepting && !prev.targetShipId) return prev; // Can't turn on without a target

      return {
          ...prev,
          ships: prev.ships.map(ship => {
              if (ship.id === prev.selectedShipId) {
                  const newIsIntercepting = !ship.isIntercepting;
                  return { 
                      ...ship, 
                      isIntercepting: newIsIntercepting,
                      isErratic: newIsIntercepting ? false : ship.isErratic, // Turn off erratic if intercepting
                      targetRotation: null // Always clear manual rotation target when toggling
                  };
              }
              return ship;
          }),
      };
    });
  }, []);

  const handleTogglePointDefense = useCallback(() => {
    setGameState(prev => ({
        ...prev,
        ships: prev.ships.map(ship => 
            ship.id === prev.selectedShipId ? { ...ship, pointDefenseActive: !ship.pointDefenseActive } : ship
        ),
    }));
  }, []);

  const handleSetDefensiveTractors = useCallback((count: number) => {
    setGameState(prev => ({
      ...prev,
      ships: prev.ships.map(ship => 
        ship.id === prev.selectedShipId ? { ...ship, tractorBeams: {...ship.tractorBeams, defensiveAllocation: count } } : ship
      ),
    }));
  }, []);
  
  const handleLaunchDecoy = useCallback(() => {
    setGameState(prev => {
        const playerShip = prev.ships.find(s => s.id === prev.selectedShipId);
        if (!playerShip || playerShip.decoys.available <= 0) return prev;

        const forwardVec = new THREE.Vector3(0, 0, 1).applyEuler(new THREE.Euler(...playerShip.rotation, 'YXZ'));
        const launchPos = new THREE.Vector3(...playerShip.position).add(forwardVec.multiplyScalar(-8)); // launch 8 units behind

        const newDecoy: Decoy = {
            id: Date.now(),
            position: launchPos.toArray(),
            life: 30, // 30 seconds
            startTime: 0,
            ownerId: playerShip.id,
        };

        const updatedShips = prev.ships.map(s => 
            s.id === playerShip.id 
            ? { ...s, decoys: { ...s.decoys, available: s.decoys.available - 1 } } 
            : s
        );

        return {
            ...prev,
            ships: updatedShips,
            decoys: [...prev.decoys, newDecoy],
        };
    });
  }, []);

  const updateGameState = useCallback((updater: (prevState: GameState) => GameState) => {
    setGameState(updater);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F1') setCameraView(CameraView.TOP_DOWN);
      if (event.key === 'F2') setCameraView(CameraView.CHASE);
      if (event.key === 'F3') setCameraView(CameraView.TARGET);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const playerShip = gameState.ships.find(s => s.id === gameState.selectedShipId);
  const targetShip = gameState.ships.find(s => s.id === gameState.targetShipId);

  return (
    <div className="w-screen h-screen overflow-hidden">
      <GameCanvas 
        gameState={gameState} 
        cameraView={cameraView} 
        onSetTargetRotation={handleSetTargetRotation}
        onSetTargetShipId={handleSetTargetShipId}
        updateGameState={updateGameState}
        gameSpeed={gameSpeed}
      />
      {playerShip && (
        <MainUI 
          playerShip={playerShip}
          targetShip={targetShip}
          cameraView={cameraView}
          setCameraView={setCameraView}
          onSetDesiredSpeed={handleSetDesiredSpeed}
          onSetAlertLevel={handleSetAlertLevel}
          onSetEnergyAllocation={handleSetEnergyAllocation}
          gameSpeed={gameSpeed}
          onSetGameSpeed={setGameSpeed}
          activeManeuver={gameState.activeManeuver}
          onInitiateManeuver={handleInitiateManeuver}
          onCancelManeuver={handleCancelManeuver}
          onToggleErraticManeuvers={handleToggleErraticManeuvers}
          onToggleIntercept={handleToggleIntercept}
          onTogglePointDefense={handleTogglePointDefense}
          onSetDefensiveTractors={handleSetDefensiveTractors}
          onLaunchDecoy={handleLaunchDecoy}
        />
      )}
    </div>
  );
};

export default App;
