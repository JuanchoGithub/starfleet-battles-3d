
import { Ship, ShipType, Faction, AlertLevel, GameSpeed } from './types';

export const initialShips: Ship[] = [
  {
    id: 1,
    name: 'TCS Arrow',
    type: ShipType.FIGHTER,
    faction: Faction.TERRAN,
    position: [0, 0, 10],
    rotation: [0, Math.PI, 0],
    targetRotation: null,
    destination: null,
    maxSpeed: 5,
    currentSpeed: 0,
    desiredSpeed: 0,
    acceleration: 2,
    turnRate: Math.PI / 2, // 90 degrees per second
    hull: { current: 100, max: 100 },
    power: { output: 50 }, // 50 energy units per second
    engines: { energyAllocation: 4 },
    shields: [
      { current: 50, max: 50, energyAllocation: 2 }, { current: 50, max: 50, energyAllocation: 2 },
      { current: 50, max: 50, energyAllocation: 2 }, { current: 50, max: 50, energyAllocation: 2 },
      { current: 50, max: 50, energyAllocation: 2 }, { current: 50, max: 50, energyAllocation: 2 },
    ],
    weapons: [
      { 
        name: 'Pulse Laser', type: 'energy', damage: 5, range: 40, fireRate: 2, lastFired: 0,
        energyAllocation: 4, currentCharge: 0, minChargeToFire: 5, optimalCharge: 10, maxCharge: 15
      },
      { 
        name: 'Gatling Gun', type: 'projectile', damage: 2, range: 30, fireRate: 8, lastFired: 0,
        energyAllocation: 0, currentCharge: 0, minChargeToFire: 0, optimalCharge: 0, maxCharge: 0
      },
    ],
    modelPath: '/models/arrow.glb', // Placeholder path
    scale: 1,
    alertLevel: AlertLevel.YELLOW,
    isErratic: false,
    isIntercepting: false,
    // Defensive Systems
    pointDefenseActive: false,
    tractorBeams: { total: 2, defensiveAllocation: 0 },
    decoys: { available: 3, max: 3 },
  },
  {
    id: 2,
    name: 'XN Stinger',
    type: ShipType.FIGHTER,
    faction: Faction.XENOS,
    position: [10, 0, -10],
    rotation: [0, -Math.PI / 2, 0],
    targetRotation: null,
    destination: [0, 0, 10],
    maxSpeed: 6,
    currentSpeed: 3,
    desiredSpeed: 3,
    acceleration: 3,
    turnRate: Math.PI, // 180 degrees per second
    hull: { current: 80, max: 80 },
    power: { output: 60 },
    engines: { energyAllocation: 5 },
    shields: [
      { current: 40, max: 40, energyAllocation: 2 }, { current: 40, max: 40, energyAllocation: 2 },
      { current: 40, max: 40, energyAllocation: 2 }, { current: 40, max: 40, energyAllocation: 2 },
      { current: 40, max: 40, energyAllocation: 2 }, { current: 40, max: 40, energyAllocation: 2 },
    ],
    weapons: [
      { 
        name: 'Plasma Cannon', type: 'energy', damage: 8, range: 35, fireRate: 1.5, lastFired: 0,
        energyAllocation: 6, currentCharge: 0, minChargeToFire: 8, optimalCharge: 15, maxCharge: 20
      },
    ],
    modelPath: '/models/stinger.glb', // Placeholder path
    scale: 0.8,
    alertLevel: AlertLevel.RED,
    isErratic: false,
    isIntercepting: false,
    // Defensive Systems
    pointDefenseActive: false,
    tractorBeams: { total: 0, defensiveAllocation: 0 },
    decoys: { available: 0, max: 0 },
  },
];

export const SHIELD_RADIUS = 3;
export const SHIELD_SEGMENT_ANGLE = Math.PI / 3; // 60 degrees

// Constants for energy simulation
export const SHIELD_RECHARGE_EFFICIENCY = 0.8; // How many HP per unit of energy
export const SHIELD_DECAY_RATE = 2; // Shield points per second
export const ENGINE_EFFICIENCY_FACTOR = 0.1; // How much 1 allocation point boosts acceleration (+10%)

export const FACTION_COLORS = {
  [Faction.TERRAN]: {
    primary: 'cyber-cyan',
    secondary: 'blue-500',
    shield: '#00aaff',
  },
  [Faction.XENOS]: {
    primary: 'red-500',
    secondary: 'purple-500',
    shield: '#ff00aa',
  }
};

const PLAY_SPEED_BASE = 1 / 8;

export const getGameSpeedMultiplier = (speed: GameSpeed): number => {
    switch (speed) {
        case GameSpeed.SLOW: return PLAY_SPEED_BASE / 4; // 1/32
        case GameSpeed.PLAY: return PLAY_SPEED_BASE;     // 1/8
        case GameSpeed.FAST: return PLAY_SPEED_BASE * 2; // 1/4
        case GameSpeed.PAUSED:
        default:
             return 0;
    }
};
