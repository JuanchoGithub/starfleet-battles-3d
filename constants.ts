
import { Ship, ShipType, Faction, AlertLevel, GameSpeed, Screen } from './types';

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
    turnRate: Math.PI / 2,
    hull: { current: 100, max: 100 },
    power: { output: 50, batteries: 10, batteryOutput: 0 },
    engines: { energyAllocation: 4 },
    ew: { ecm: 0, eccm: 0, rating: 6 },
    shields: [
      { current: 50, max: 50, energyAllocation: 2 }, { current: 50, max: 50, energyAllocation: 2 },
      { current: 50, max: 50, energyAllocation: 2 }, { current: 50, max: 50, energyAllocation: 2 },
      { current: 50, max: 50, energyAllocation: 2 }, { current: 50, max: 50, energyAllocation: 2 },
    ],
    weapons: [
      { 
        name: 'Pulse Laser', type: 'energy', group: 1, mode: 'NORMAL', damage: 5, range: 40, fireRate: 2, lastFired: 0,
        energyAllocation: 4, currentCharge: 0, minChargeToFire: 5, optimalCharge: 10, maxCharge: 15
      },
      { 
        name: 'Gatling Gun', type: 'projectile', group: 2, mode: 'NORMAL', damage: 2, range: 30, fireRate: 8, lastFired: 0,
        energyAllocation: 0, currentCharge: 0, minChargeToFire: 0, optimalCharge: 0, maxCharge: 0
      },
    ],
    modelPath: '/models/arrow.glb',
    scale: 1,
    alertLevel: AlertLevel.YELLOW,
    isErratic: false,
    isIntercepting: false,
    pointDefenseActive: false,
    tractorBeams: { total: 2, defensiveAllocation: 0, holding: false },
    decoys: { available: 3, max: 3 },
    fleetId: 'ALPHA',
    formation: 'LOOSE',
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
    turnRate: Math.PI,
    hull: { current: 80, max: 80 },
    power: { output: 60, batteries: 5, batteryOutput: 0 },
    engines: { energyAllocation: 5 },
    ew: { ecm: 0, eccm: 0, rating: 5 },
    shields: [
      { current: 40, max: 40, energyAllocation: 2 }, { current: 40, max: 40, energyAllocation: 2 },
      { current: 40, max: 40, energyAllocation: 2 }, { current: 40, max: 40, energyAllocation: 2 },
      { current: 40, max: 40, energyAllocation: 2 }, { current: 40, max: 40, energyAllocation: 2 },
    ],
    weapons: [
      { 
        name: 'Plasma Cannon', type: 'energy', group: 1, mode: 'NORMAL', damage: 8, range: 35, fireRate: 1.5, lastFired: 0,
        energyAllocation: 6, currentCharge: 0, minChargeToFire: 8, optimalCharge: 15, maxCharge: 20
      },
    ],
    modelPath: '/models/stinger.glb',
    scale: 0.8,
    alertLevel: AlertLevel.RED,
    isErratic: false,
    isIntercepting: false,
    pointDefenseActive: false,
    tractorBeams: { total: 0, defensiveAllocation: 0, holding: false },
    decoys: { available: 0, max: 0 },
    fleetId: 'BETA',
    formation: 'LOOSE',
  },
];

export const SHIELD_RADIUS = 3;
export const SHIELD_SEGMENT_ANGLE = Math.PI / 3;

export const SHIELD_RECHARGE_EFFICIENCY = 0.8;
export const SHIELD_DECAY_RATE = 2;
export const ENGINE_EFFICIENCY_FACTOR = 0.1;

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
        case GameSpeed.SLOW: return PLAY_SPEED_BASE / 4;
        case GameSpeed.PLAY: return PLAY_SPEED_BASE;
        case GameSpeed.FAST: return PLAY_SPEED_BASE * 2;
        case GameSpeed.PAUSED:
        default:
             return 0;
    }
};
