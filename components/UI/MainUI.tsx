
import React from 'react';
import { Ship, CameraView, AlertLevel, GameSpeed, ActiveManeuver, ManeuverType } from '../../types';
import { LeftSidebar } from './LeftSidebar';
import { TopBar } from './TopBar';
import { TopHUD } from './TopHUD';
import { BottomBar } from './BottomBar';


interface MainUIProps {
    playerShip: Ship;
    targetShip?: Ship;
    cameraView: CameraView;
    setCameraView: (view: CameraView) => void;
    onSetDesiredSpeed: (speed: number) => void;
    onSetAlertLevel: (level: AlertLevel) => void;
    onSetEnergyAllocation: (componentType: 'engines' | 'shield' | 'weapon', index: number, value: number) => void;
    gameSpeed: GameSpeed;
    onSetGameSpeed: (speed: GameSpeed) => void;
    activeManeuver: ActiveManeuver | null;
    onInitiateManeuver: (maneuverType: ManeuverType) => void;
    onCancelManeuver: () => void;
    onToggleErraticManeuvers: () => void;
    onToggleIntercept: () => void;
    onTogglePointDefense: () => void;
    onSetDefensiveTractors: (count: number) => void;
    onLaunchDecoy: () => void;
}

export const MainUI: React.FC<MainUIProps> = (props) => {
    const { 
        playerShip, targetShip, cameraView, setCameraView, onSetDesiredSpeed, onSetAlertLevel, 
        onSetEnergyAllocation, gameSpeed, onSetGameSpeed, activeManeuver, onInitiateManeuver,
        onCancelManeuver, onToggleErraticManeuvers, onToggleIntercept, onTogglePointDefense,
        onSetDefensiveTractors, onLaunchDecoy
    } = props;
    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none text-sm">
            <TopBar cameraView={cameraView} setCameraView={setCameraView} />
            <TopHUD playerShip={playerShip} targetShip={targetShip} activeManeuver={activeManeuver} />
            <LeftSidebar 
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
            <BottomBar 
                playerShip={playerShip}
                onSetDesiredSpeed={onSetDesiredSpeed}
                onSetAlertLevel={onSetAlertLevel}
                gameSpeed={gameSpeed}
                onSetGameSpeed={onSetGameSpeed}
            />
        </div>
    );
};
