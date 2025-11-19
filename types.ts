
export enum ShipType {
  FIGHTER = 'FIGHTER',
  FRIGATE = 'FRIGATE',
  CRUISER = 'CRUISER',
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
  TOP_DOWN = 'Top Down (F1)',
  CHASE = 'Chase (F2)',
  TARGET = 'Target (F3)',
  TACTICAL = 'Tactical (F4)',
  COCKPIT = 'Cockpit (F5)',
}

export enum GameSpeed {
  PAUSED = 'PAUSED',
  SLOW = 'SLOW',
  PLAY = 'PLAY',
  FAST = 'FAST',
}

export enum Screen {
  MAIN_MENU = 'MAIN_MENU',
  CAMPAIGN = 'CAMPAIGN',
  LOBBY = 'LOBBY',
  TACTICAL = 'TACTICAL',
}

export enum ManeuverType {
  EMERGENCY_STOP = 'Emergency Stop',
  FAST_TURN_LEFT = 'Fast Turn 90 Left',
  FAST_TURN_RIGHT = 'Fast Turn 90 Right',
  FAST_180 = 'Fast Turn 180',
  FAST_TURN_FREE = 'Fast Turn Free',
  HET = 'High Energy Turn',
  ERRATIC = 'Erratic Maneuvers',
}

export interface ActiveManeuver {
  type: ManeuverType;
  charge: number;
  chargeNeeded: number;
  status: 'charging' | 'executing';
  startTime?: number;
  startRotation?: number;
  targetRotation?: number;
  duration?: number;
}

export interface Decoy {
    id: number;
    position: [number, number, number];
    life: number;
    startTime: number;
    ownerId: number;
}

export interface ShieldSegment {
  current: number;
  max: number;
  energyAllocation: number;
}

export interface Weapon {
  name: string;
  type: 'energy' | 'projectile';
  group: number; // 1-4
  mode: 'NORMAL' | 'OVERLOAD' | 'PROXIMITY';
  damage: number;
  range: number;
  fireRate: number;
  lastFired: number;
  energyAllocation: number;
  currentCharge: number;
  minChargeToFire: number;
  optimalCharge: number;
  maxCharge: number;
}

export interface Engines {
    energyAllocation: number;
}

export interface PowerPlant {
    output: number;
    batteries: number;
    batteryOutput: number;
}

export interface EWSystem {
    ecm: number; // 0-10
    eccm: number; // 0-10
    rating: number; // Max combined
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
  acceleration: number;
  turnRate: number;
  
  hull: { current: number; max: number };
  power: PowerPlant;
  engines: Engines;
  shields: ShieldSegment[];
  weapons: Weapon[];
  ew: EWSystem;
  
  modelPath: string;
  scale: number;
  alertLevel: AlertLevel;
  isErratic: boolean;
  visualRotationOffsetY?: number;
  isIntercepting: boolean;
  
  // Defensive Systems
  pointDefenseActive: boolean;
  tractorBeams: {
      total: number;
      defensiveAllocation: number;
      holding: boolean;
  };
  decoys: {
      available: number;
      max: number;
  };
  
  // Fleet
  fleetId?: string;
  formation?: 'LINE' | 'CHEVRON' | 'LOOSE';
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
  screen: Screen;
  ships: Ship[];
  projectiles: Projectile[];
  decoys: Decoy[];
  selectedShipId: number;
  targetShipId: number | null;
  activeManeuver: ActiveManeuver | null;
}
