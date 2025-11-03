
import React from 'react';
import { Ship, ManeuverType, ActiveManeuver } from '../../types';
import { ManagementPanel } from './ManagementPanel';
import { ShipInfoPanel } from './ShipInfoPanel';
import { TargetInfo } from './TargetInfo';
import { ShieldPanel } from './ShieldPanel';

interface LeftSidebarProps {
  playerShip: Ship;
  targetShip?: Ship;
  onSetEnergyAllocation: (componentType: 'engines' | 'shield' | 'weapon', index: number, value: number) => void;
  onInitiateManeuver: (maneuverType: ManeuverType) => void;
  activeManeuver: ActiveManeuver | null;
  onCancelManeuver: () => void;
  onToggleErraticManeuvers: () => void;
  onToggleIntercept: () => void;
  onTogglePointDefense: () => void;
  onSetDefensiveTractors: (count: number) => void;
  onLaunchDecoy: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ 
    playerShip, targetShip, onSetEnergyAllocation, onInitiateManeuver, activeManeuver, 
    onCancelManeuver, onToggleErraticManeuvers, onToggleIntercept, onTogglePointDefense,
    onSetDefensiveTractors, onLaunchDecoy,
}) => {
  return (
    <div className="absolute top-0 left-0 h-screen w-80 flex flex-col p-2 gap-2 pointer-events-auto">
      <div className="h-[40%]">
        <ManagementPanel 
            playerShip={playerShip} 
            targetShip={targetShip}
            onSetEnergyAllocation={onSetEnergyAllocation} 
            onInitiateManeuver={onInitiateManeuver}
            activeManeuver={activeManeuver}
            onCancelManeuver={onCancelManeuver}
            onToggleErraticManeuvers={onToggleErraticManeuvers}
            onToggleIntercept={onToggleIntercept}
            onTogglePointDefense={onTogglePointDefense}
            onSetDefensiveTractors={onSetDefensiveTractors}
            onLaunchDecoy={onLaunchDecoy}
        />
      </div>
      <div className="h-[25%]">
        <ShipInfoPanel playerShip={playerShip} />
      </div>
      <div className="h-[20%]">
        {targetShip && <TargetInfo targetShip={targetShip} playerShip={playerShip} />}
      </div>
      <div className="h-[15%]">
        <ShieldPanel playerShip={playerShip} onSetEnergyAllocation={onSetEnergyAllocation} />
      </div>
    </div>
  );
};
