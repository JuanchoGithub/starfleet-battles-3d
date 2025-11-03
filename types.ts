
export enum ShipType {
  FIGHTER = 'FIGHTER',
}

export enum Faction {
  TERRAN = 'TERRAN',
  XENOS = 'XENOS',
}

export enum AlertLevel {
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  RED = 'RED',
}

export enum CameraView {
  TOP_DOWN = 'Top Down',
  CHASE = 'Chase',
  TARGET = 'Target',
}

export enum GameSpeed {
  PAUSED = 'PAUSED',
  SLOW = 'SLOW',
  PLAY = 'PLAY',
  FAST = 'FAST',
}

export enum ManeuverType {
  EMERGENCY_STOP = 'Emergency Stop',
  FAST_TURN_LEFT = 'Fast Turn 90 Left',
  FAST_TURN_RIGHT = 'Fast Turn 90 Right',
  FAST_180 = 'Fast Turn 180',
  FAST_TURN_FREE = 'Fast Turn Free',
}

export interface ActiveManeuver {
  type: ManeuverType;
  charge: number;
  chargeNeeded: number;
  status: 'charging' | 'executing';
  startTime?: number; // For timed maneuvers
  startRotation?: number; // For smooth turn maneuvers
  targetRotation?: number; // For smooth turn maneuvers
  duration?: number; // For smooth turn maneuvers
}

export interface Decoy {
    id: number;
    position: [number, number, number];
    life: number; // seconds
    startTime: number;
    ownerId: number;
}


export interface ShieldSegment {
  current: number;
  max: number;
  energyAllocation: number; // Player-set value, e.g., 0-10
}

export interface Weapon {
  name: string;
  type: 'energy' | 'projectile';
  damage: number; // Base damage at optimal charge
  range: number; // Base range at optimal charge
  fireRate: number;
  lastFired: number;
  
  // New energy properties for 'energy' type weapons
  energyAllocation: number; // Player-set value
  currentCharge: number;
  minChargeToFire: number;
  optimalCharge: number;
  maxCharge: number;
}

export interface Engines {
    energyAllocation: number;
}

export interface PowerPlant {
    output: number; // Energy units per second
}

export interface Ship {
  id: number;
  name:string;
  type: ShipType;
  faction: Faction;
  position: [number, number, number];
  rotation: [number, number, number];
  targetRotation: number | null;
  destination: [number, number, number] | null;
  maxSpeed: number;
  currentSpeed: number;
  desiredSpeed: number;
  acceleration: number; // Base acceleration
  turnRate: number;
  hull: { current: number; max: number };
  
  power: PowerPlant;
  engines: Engines;
  shields: ShieldSegment[];
  weapons: Weapon[];
  
  modelPath: string;
  scale: number;
  alertLevel: AlertLevel;
  isErratic: boolean;
  visualRotationOffsetY?: number;
  isIntercepting: boolean;

  // New defensive properties
  pointDefenseActive: boolean;
  tractorBeams: {
      total: number;
      defensiveAllocation: number;
  };
  decoys: {
      available: number;
      max: number;
  };
}

export interface Projectile {
    id: number;
    position: [number, number, number];
    velocity: [number, number, number];
    damage: number;
    range: number;
    traveled: number;
    ownerId: number;
}

export interface GameState {
  ships: Ship[];
  projectiles: Projectile[];
  decoys: Decoy[];
  selectedShipId: number;
  targetShipId: number | null;
  activeManeuver: ActiveManeuver | null;
}
