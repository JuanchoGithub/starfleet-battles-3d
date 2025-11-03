
import React, { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Stars, Grid } from '@react-three/drei';
import { GameState, CameraView, Ship as ShipType, GameSpeed, ManeuverType, Decoy as DecoyType, Projectile } from '../types';
import { Ship } from './Ship';
import { RotationArc } from './RotationArc';
import { TargetReticule } from './TargetReticule';
import { getGameSpeedMultiplier, SHIELD_RECHARGE_EFFICIENCY, ENGINE_EFFICIENCY_FACTOR, SHIELD_DECAY_RATE, SHIELD_RADIUS } from '../constants';

interface GameCanvasProps {
  gameState: GameState;
  cameraView: CameraView;
  onSetTargetRotation: (rotation: number) => void;
  onSetTargetShipId: (id: number) => void;
  updateGameState: (updater: (prevState: GameState) => GameState) => void;
  gameSpeed: GameSpeed;
}

const Decoy: React.FC<{ decoyData: DecoyType }> = ({ decoyData }) => {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (meshRef.current) {
        meshRef.current.position.fromArray(decoyData.position);
    }
  });

  return (
    <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#ff7a00" emissive="#ff7a00" emissiveIntensity={2} toneMapped={false} />
    </mesh>
  );
};


const Scene: React.FC<GameCanvasProps> = ({ gameState, cameraView, onSetTargetRotation, onSetTargetShipId, updateGameState, gameSpeed }) => {
  const { camera } = useThree();
  const playerShipRef = useRef<THREE.Group>(null);
  const targetShipRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    // Game Loop - All game state logic is now centralized here
    const gameSpeedMultiplier = getGameSpeedMultiplier(gameSpeed);
    const effectiveDelta = delta * gameSpeedMultiplier;

    if (effectiveDelta > 0) {
        const now = state.clock.getElapsedTime();
        updateGameState(prev => {
          let newActiveManeuver = prev.activeManeuver;
          const playerShipOriginal = prev.ships.find(s => s.id === prev.selectedShipId);
          let tempNewProjectiles: Projectile[] = [];
          
          // --- Maneuver Charging ---
          if (newActiveManeuver && newActiveManeuver.status === 'charging' && playerShipOriginal) {
            const chargeThisFrame = playerShipOriginal.power.output * effectiveDelta;
            const newCharge = newActiveManeuver.charge + chargeThisFrame;
            if (newCharge >= newActiveManeuver.chargeNeeded) {
                newActiveManeuver = { ...newActiveManeuver, charge: newActiveManeuver.chargeNeeded, status: 'executing', startTime: now };

                const maneuverType = newActiveManeuver.type;
                if (maneuverType === ManeuverType.FAST_TURN_LEFT || 
                    maneuverType === ManeuverType.FAST_TURN_RIGHT ||
                    maneuverType === ManeuverType.FAST_180) {
                    
                    const currentRotation = playerShipOriginal.rotation[1];
                    newActiveManeuver.duration = 0.75; // Smooth turn over 0.75 seconds
                    newActiveManeuver.startRotation = currentRotation;

                    let targetAngleOffset = 0;
                    if (maneuverType === ManeuverType.FAST_TURN_LEFT) targetAngleOffset = -Math.PI / 2;
                    if (maneuverType === ManeuverType.FAST_TURN_RIGHT) targetAngleOffset = Math.PI / 2;
                    if (maneuverType === ManeuverType.FAST_180) targetAngleOffset = Math.PI;

                    newActiveManeuver.targetRotation = currentRotation + targetAngleOffset;
                }

            } else {
                newActiveManeuver = { ...newActiveManeuver, charge: newCharge };
            }
          }

          // --- Timed Maneuver Check (Fast Turn Free) ---
          if (newActiveManeuver && newActiveManeuver.type === ManeuverType.FAST_TURN_FREE && newActiveManeuver.status === 'executing') {
              const DURATION = 4; // 4 real-world seconds
              if (now - (newActiveManeuver.startTime || 0) > DURATION) {
                  newActiveManeuver = null; // End maneuver
              }
          }

          const ships = prev.ships.map(ship => {
            let updatedShip = { ...ship };
            const isPlayer = updatedShip.id === prev.selectedShipId;

            // --- AI Logic for non-player ships ---
            if (!isPlayer) {
              const player = prev.ships.find(s => s.id === prev.selectedShipId);
              if (player) {
                  const activeDecoy = prev.decoys.find(d => d.ownerId === player.id);
                  const isPlayerVulnerable = player.currentSpeed / player.maxSpeed > 0.8 || player.weapons.some(w => now - w.lastFired < 2);
                  
                  let targetPosition: [number, number, number] = player.position;
                  if(activeDecoy && !isPlayerVulnerable){
                      targetPosition = activeDecoy.position;
                  }

                  const distVec = new THREE.Vector3().fromArray(targetPosition).sub(new THREE.Vector3().fromArray(ship.position));
                  const distance = distVec.length();
                  
                  if(distance > 30) updatedShip.destination = targetPosition;
                  else { // Orbit target
                      const orbitAngle = now * 0.3;
                      updatedShip.destination = [
                          targetPosition[0] + Math.cos(orbitAngle) * 20,
                          targetPosition[1],
                          targetPosition[2] + Math.sin(orbitAngle) * 20,
                      ] as [number, number, number];
                  }

                  // AI Firing
                   updatedShip.weapons = updatedShip.weapons.map(weapon => {
                      if (now > weapon.lastFired + 1 / weapon.fireRate) {
                          if (distance < weapon.range) {
                              const forward = new THREE.Vector3(Math.sin(updatedShip.rotation[1]), 0, Math.cos(updatedShip.rotation[1]));
                              if (forward.dot(distVec.clone().normalize()) > 0.98) { // Facing target
                                  // FIX: The result of toArray() is not assignable to a tuple. Deconstruct the vector to ensure type safety.
                                  const velocityVec = forward.multiplyScalar(30);
                                  tempNewProjectiles.push({
                                      id: Date.now() + Math.random(),
                                      position: [...updatedShip.position],
                                      velocity: [velocityVec.x, velocityVec.y, velocityVec.z],
                                      damage: weapon.damage,
                                      range: weapon.range,
                                      traveled: 0,
                                      ownerId: updatedShip.id
                                  });
                                  return { ...weapon, lastFired: now };
                              }
                          }
                      }
                      return weapon;
                  });
              }
            }

            // --- Maneuver Execution ---
            if (isPlayer && newActiveManeuver && newActiveManeuver.status === 'executing') {
              const maneuverType = newActiveManeuver.type;

              if (maneuverType === ManeuverType.FAST_TURN_LEFT ||
                  maneuverType === ManeuverType.FAST_TURN_RIGHT ||
                  maneuverType === ManeuverType.FAST_180) {
                  
                  const elapsed = now - (newActiveManeuver.startTime || now);
                  const duration = newActiveManeuver.duration || 0.75;
                  const progress = Math.min(1, elapsed / duration);
                  
                  const easedProgress = 1 - Math.pow(1 - progress, 5);

                  if (newActiveManeuver.startRotation !== undefined && newActiveManeuver.targetRotation !== undefined) {
                      updatedShip.rotation[1] = THREE.MathUtils.lerp(
                          newActiveManeuver.startRotation,
                          newActiveManeuver.targetRotation,
                          easedProgress
                      );
                  }
                  
                  updatedShip.targetRotation = null;

                  if (progress >= 1) {
                      updatedShip.rotation[1] = newActiveManeuver.targetRotation!;
                      newActiveManeuver = null;
                  }

              } else if (maneuverType === ManeuverType.EMERGENCY_STOP) {
                  updatedShip.currentSpeed = 0;
                  updatedShip.desiredSpeed = 0;
                  newActiveManeuver = null;
              }
            }

            // --- Energy Management Logic ---
            const isChargingManeuver = isPlayer && newActiveManeuver?.status === 'charging';
            let availablePower = updatedShip.power.output;
            let powerForSystems = availablePower;

            if (isChargingManeuver) {
                powerForSystems = 0;
                if (updatedShip.isErratic) updatedShip.isErratic = false;
            } else if (updatedShip.isErratic) {
                const ERRATIC_COST_PER_SECOND = 6;
                const energyCost = ERRATIC_COST_PER_SECOND * effectiveDelta;
                if (powerForSystems >= energyCost) {
                    powerForSystems -= energyCost;
                } else {
                    updatedShip.isErratic = false;
                }
            }
            
            const { engines, shields, weapons } = updatedShip;
            let totalAllocation = engines.energyAllocation + shields.reduce((s, c) => s + c.energyAllocation, 0) + weapons.reduce((s, c) => s + c.energyAllocation, 0);
            const energyPerAllocationPoint = totalAllocation > 0 ? powerForSystems / totalAllocation : 0;
            
            updatedShip.shields = shields.map(shield => {
                const newShield = { ...shield };
                const decayAmount = SHIELD_DECAY_RATE * effectiveDelta;
                newShield.current -= decayAmount;
                if (energyPerAllocationPoint > 0 && newShield.energyAllocation > 0) {
                    const rechargeAmount = newShield.energyAllocation * energyPerAllocationPoint * effectiveDelta * SHIELD_RECHARGE_EFFICIENCY;
                    newShield.current = Math.min(newShield.max * 1.5, newShield.current + rechargeAmount);
                }
                return { ...newShield, current: Math.max(0, newShield.current) };
            });

            updatedShip.weapons = weapons.map(weapon => {
                if (weapon.type === 'energy' && weapon.currentCharge < weapon.maxCharge && weapon.energyAllocation > 0 && energyPerAllocationPoint > 0) {
                    const energyToWeapon = weapon.energyAllocation * energyPerAllocationPoint * effectiveDelta;
                    return { ...weapon, currentCharge: Math.min(weapon.maxCharge, weapon.currentCharge + energyToWeapon) };
                }
                return weapon;
            });

            // --- Physics & Rotation Logic ---
            let maxSpeed = updatedShip.maxSpeed;
            if (updatedShip.isErratic) {
                maxSpeed *= 0.75; // 25% speed reduction
            }
            const desiredSpeed = Math.min(updatedShip.desiredSpeed, maxSpeed);

            const enginePowerBonus = 1 + (updatedShip.engines.energyAllocation * ENGINE_EFFICIENCY_FACTOR);
            const effectiveAcceleration = updatedShip.acceleration * enginePowerBonus;

            const speedDiff = desiredSpeed - updatedShip.currentSpeed;
            if (Math.abs(speedDiff) > 0.01) {
                const change = effectiveAcceleration * effectiveDelta;
                updatedShip.currentSpeed += Math.min(change, Math.abs(speedDiff)) * Math.sign(speedDiff);
            } else {
                updatedShip.currentSpeed = desiredSpeed;
            }
            
            let turnRate = updatedShip.turnRate;
            if (isPlayer && newActiveManeuver?.type === ManeuverType.FAST_TURN_FREE && newActiveManeuver.status === 'executing') {
                turnRate *= 5;
            }
            
            const isExecutingSmoothTurn = isPlayer && newActiveManeuver?.status === 'executing' && newActiveManeuver.duration !== undefined;
            
            let finalTargetRotation = isPlayer ? updatedShip.targetRotation : null;
            
            // Intercept logic overrides manual targetRotation for player ship
            if (isPlayer && updatedShip.isIntercepting) {
              const targetShipForIntercept = prev.ships.find(s => s.id === prev.targetShipId);
              if (targetShipForIntercept) {
                const targetVector = new THREE.Vector3(...targetShipForIntercept.position);
                const currentPosition = new THREE.Vector3(...updatedShip.position);
                const direction = targetVector.clone().sub(currentPosition);
                if (direction.lengthSq() > 0.1) {
                  finalTargetRotation = Math.atan2(direction.x, direction.z);
                }
              } else {
                updatedShip.isIntercepting = false; // Auto-disable if target is lost
              }
            }


            if (!isExecutingSmoothTurn) {
                if (isPlayer && finalTargetRotation !== null) {
                    const angleDiff = THREE.MathUtils.damp(updatedShip.rotation[1], finalTargetRotation, turnRate, effectiveDelta) - updatedShip.rotation[1];
                    updatedShip.rotation[1] += angleDiff;
                    // Only clear manual target rotation. Intercept target is continuous.
                    if (!updatedShip.isIntercepting && Math.abs(finalTargetRotation - updatedShip.rotation[1]) < 0.01) {
                        updatedShip.targetRotation = null;
                    }
                } else if (!isPlayer && updatedShip.destination) {
                    const targetVector = new THREE.Vector3(...updatedShip.destination);
                    const currentPosition = new THREE.Vector3(...updatedShip.position);
                    const direction = targetVector.clone().sub(currentPosition);
                    if (direction.length() > 0.5) {
                        const targetAngle = Math.atan2(direction.x, direction.z);
                        const currentAngle = updatedShip.rotation[1];
                        let angleDiff = targetAngle - currentAngle;
                        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
                        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
                        const turnAmount = turnRate * effectiveDelta;
                        updatedShip.rotation[1] += Math.min(turnAmount, Math.abs(angleDiff)) * Math.sign(angleDiff);
                    }
                }
            }
            
            // --- Movement and Erratic Maneuvers ---
            updatedShip.visualRotationOffsetY = 0; // Reset visual effect

            if (updatedShip.currentSpeed > 0) {
                const moveDirection = new THREE.Vector3(Math.sin(updatedShip.rotation[1]), 0, Math.cos(updatedShip.rotation[1]));
                let totalVelocity = moveDirection.clone().multiplyScalar(updatedShip.currentSpeed);

                if (updatedShip.isErratic) {
                    const SWERVE_FREQUENCY = 8;
                    const LATERAL_AMPLITUDE = 3.0; // How far it moves side-to-side
                    const YAW_AMPLITUDE_RAD = Math.PI / 12; // 15 degrees max yaw

                    const swerveStrength = updatedShip.currentSpeed / updatedShip.maxSpeed;

                    const rightVector = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), moveDirection).normalize();
                    const lateralVelocity = rightVector.multiplyScalar(Math.cos(now * SWERVE_FREQUENCY) * LATERAL_AMPLITUDE * swerveStrength);
                    totalVelocity.add(lateralVelocity);

                    const yawOffset = Math.sin(now * SWERVE_FREQUENCY) * YAW_AMPLITUDE_RAD * swerveStrength;
                    updatedShip.visualRotationOffsetY = yawOffset;
                }

                const newPositionVec = new THREE.Vector3(...updatedShip.position).add(totalVelocity.multiplyScalar(effectiveDelta));
                // FIX: The result of toArray() is not assignable to a tuple. Deconstruct the vector to ensure type safety.
                updatedShip.position = [newPositionVec.x, newPositionVec.y, newPositionVec.z];
            }
            
            return updatedShip;
          });

          // --- Projectile & Defense Logic ---
          let newProjectiles = [...prev.projectiles, ...tempNewProjectiles];
          let updatedShips = [...ships];

          const playerShipForDefense = updatedShips.find(s => s.id === prev.selectedShipId);
          let capturedByTractors = 0;

          const remainingProjectiles = newProjectiles.filter(proj => {
              if (playerShipForDefense && proj.ownerId !== playerShipForDefense.id) {
                  const projPos = new THREE.Vector3(...proj.position);
                  const playerPos = new THREE.Vector3(...playerShipForDefense.position);
                  const distanceToPlayer = projPos.distanceTo(playerPos);

                  // 1. Tractor Beams
                  if (playerShipForDefense.tractorBeams.defensiveAllocation > capturedByTractors && distanceToPlayer < 15) {
                      capturedByTractors++;
                      return false; // Projectile destroyed
                  }

                  // 2. Point Defense
                  if (playerShipForDefense.pointDefenseActive && distanceToPlayer < 30) {
                      const pdChance = 0.05; 
                      if (Math.random() < pdChance) {
                          return false; // Projectile destroyed
                      }
                  }

                  // 3. Collision
                  if (distanceToPlayer < SHIELD_RADIUS) {
                       const hitShipIndex = updatedShips.findIndex(s => s.id === prev.selectedShipId);
                       if (hitShipIndex !== -1) {
                           const shipToDamage = { ...updatedShips[hitShipIndex] }; // Create a mutable copy
                           const shipToProj = projPos.clone().sub(playerPos).normalize();
                           const forward = new THREE.Vector3(0, 0, 1).applyEuler(new THREE.Euler(...shipToDamage.rotation, 'YXZ'));
                           let angle = Math.atan2(shipToProj.x, shipToProj.z) - Math.atan2(forward.x, forward.z);
                           angle = (angle + 2 * Math.PI) % (2 * Math.PI);
                           const angleDeg = angle * 180 / Math.PI;
                           let hitSegment = 0;
                            if (angleDeg > 330 || angleDeg <= 30) hitSegment = 0;
                            else if (angleDeg > 30 && angleDeg <= 90) hitSegment = 1;
                            else if (angleDeg > 90 && angleDeg <= 150) hitSegment = 2;
                            else if (angleDeg > 150 && angleDeg <= 210) hitSegment = 3;
                            else if (angleDeg > 210 && angleDeg <= 270) hitSegment = 4;
                            else if (angleDeg > 270 && angleDeg <= 330) hitSegment = 5;

                           const shield = shipToDamage.shields[hitSegment];
                           if (shield.current > proj.damage) {
                               shield.current -= proj.damage;
                           } else {
                               const overflowDamage = proj.damage - shield.current;
                               shield.current = 0;
                               shipToDamage.hull.current = Math.max(0, shipToDamage.hull.current - overflowDamage);
                           }
                           updatedShips[hitShipIndex] = shipToDamage;
                       }
                      return false; // Projectile is destroyed
                  }
              }
              return true;
          });

          const updatedProjectiles = remainingProjectiles.map(p => {
              const velocityVec = new THREE.Vector3(...p.velocity);
              const newPos = new THREE.Vector3(...p.position).add(velocityVec.clone().multiplyScalar(effectiveDelta));
              const traveled = p.traveled + velocityVec.length() * effectiveDelta;
              // FIX: The result of toArray() is not assignable to a tuple. Deconstruct the vector to ensure type safety.
              return { ...p, position: [newPos.x, newPos.y, newPos.z], traveled };
          }).filter(p => p.traveled < p.range);
          
          const updatedDecoys = prev.decoys.map(decoy => ({
              ...decoy,
              life: decoy.life - effectiveDelta,
          })).filter(d => d.life > 0);


          return { ...prev, ships: updatedShips, projectiles: updatedProjectiles, decoys: updatedDecoys, activeManeuver: newActiveManeuver };
        });
    }

    // Camera Logic - Runs every tick for smoothness
    const playerShip = gameState.ships.find(s => s.id === gameState.selectedShipId);
    const targetShip = gameState.ships.find(s => s.id === gameState.targetShipId);

    if (playerShip && playerShipRef.current) {
      const playerPos = new THREE.Vector3().fromArray(playerShip.position);
      const playerRot = new THREE.Euler(playerShip.rotation[0], playerShip.rotation[1], playerShip.rotation[2], 'YXZ');

      if (cameraView === CameraView.TARGET && targetShip) {
        const targetPos = new THREE.Vector3().fromArray(targetShip.position);
        const toTargetVector = targetPos.clone().sub(playerPos).normalize();
        const distance = 12;
        const height = 5;
        const offset = toTargetVector.clone().multiplyScalar(-distance);
        const desiredPosition = playerPos.clone().add(offset);
        desiredPosition.y = playerPos.y + height;
        camera.position.lerp(desiredPosition, 0.1);
        camera.lookAt(targetPos);
      } else if (cameraView === CameraView.CHASE) {
        const offset = new THREE.Vector3(0, 3, -8).applyEuler(playerRot);
        camera.position.lerp(playerPos.clone().add(offset), 0.1);
        const lookAtPos = new THREE.Vector3(0, 0, 20).applyEuler(playerRot).add(playerPos);
        camera.lookAt(lookAtPos);
      } else if (cameraView === CameraView.TOP_DOWN) {
        camera.position.lerp(new THREE.Vector3(playerPos.x, 80, playerPos.z), 0.1);
        camera.lookAt(playerPos);
      }
    }
  });
  
  const handleSetRotation = (e: any) => {
    const playerShip = gameState.ships.find(s => s.id === gameState.selectedShipId);
    if (!playerShip || playerShip.isIntercepting) return;

    // Free turn allows manual control
    const isFreeTurn = gameState.activeManeuver?.type === ManeuverType.FAST_TURN_FREE && gameState.activeManeuver.status === 'executing';
    if (!isFreeTurn && playerShip.targetRotation !== null) return; // Don't interrupt a normal turn unless free turning

    const playerPos = new THREE.Vector3().fromArray(playerShip.position);
    const clickPos = e.point;
    const direction = clickPos.clone().sub(playerPos);
    const targetAngle = Math.atan2(direction.x, direction.z);
    onSetTargetRotation(targetAngle);
  }

  const playerShip = gameState.ships.find(s => s.id === gameState.selectedShipId);
  const targetShip = gameState.ships.find(s => s.id === gameState.targetShipId);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 7.5]} intensity={1.5} />
      <Stars radius={200} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Grid
        args={[1000, 1000]}
        sectionColor={'#336b99'}
        cellColor={'#1a354d'}
        cellThickness={1}
        sectionThickness={1.5}
        fadeDistance={200}
        fadeStrength={1}
        infiniteGrid
        cellSize={10}
        sectionSize={100}
      />
      {gameState.ships.map(ship => {
        const ref = ship.id === gameState.selectedShipId ? playerShipRef : (ship.id === gameState.targetShipId ? targetShipRef : null);
        return <Ship key={ship.id} shipData={ship} onSetTargetShipId={onSetTargetShipId} ref={ref} />;
      })}
      {gameState.decoys.map(decoy => (
        <Decoy key={decoy.id} decoyData={decoy} />
      ))}
      {playerShip && <RotationArc ship={playerShip} />}
      {targetShip && <TargetReticule targetShip={targetShip} />}
      <mesh rotation={[-Math.PI / 2, 0, 0]} onPointerDown={handleSetRotation}>
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </>
  );
};

export const GameCanvas: React.FC<GameCanvasProps> = (props) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full">
      <Canvas camera={{ position: [0, 80, 0], fov: 75 }}>
        <Scene {...props} />
      </Canvas>
    </div>
  );
};
