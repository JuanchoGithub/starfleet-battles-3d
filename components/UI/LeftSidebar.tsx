
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
    <div className="h-full w-full flex flex-col gap-2">
      {/* Main MFD Block */}
      <div className="flex-1 min-h-0">
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
      
      {/* Mini Status Panels at bottom of sidebar */}
      <div className="h-48 flex flex-col gap-2 shrink-0">
        <ShieldPanel playerShip={playerShip} onSetEnergyAllocation={onSetEnergyAllocation} />
        {/* Optionally put TargetInfo here if not on the right */}
      </div>
    </div>
  );
};
