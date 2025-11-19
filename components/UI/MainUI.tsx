
import React from 'react';
import { Ship, CameraView, AlertLevel, GameSpeed, ActiveManeuver, ManeuverType, Screen } from '../../types';
import { LeftSidebar } from './LeftSidebar';
import { TopBar } from './TopBar';
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
    onNavigate: (screen: Screen) => void;
}

export const MainUI: React.FC<MainUIProps> = (props) => {
    const { 
        playerShip, targetShip, cameraView, setCameraView, onSetDesiredSpeed, onSetAlertLevel, 
        onSetEnergyAllocation, gameSpeed, onSetGameSpeed, activeManeuver, onInitiateManeuver,
        onCancelManeuver, onToggleErraticManeuvers, onToggleIntercept, onTogglePointDefense,
        onSetDefensiveTractors, onLaunchDecoy, onNavigate
    } = props;
    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none text-sm flex flex-col justify-between">
            {/* Top Navigation and Camera Controls */}
            <div className="pointer-events-auto">
                <TopBar cameraView={cameraView} setCameraView={setCameraView} onNavigate={onNavigate} />
            </div>

            <div className="flex-1 flex relative overflow-hidden">
                {/* Left Modular Command Panels (MFDs) */}
                <div className="w-96 h-full pointer-events-auto pt-2 pb-2 pl-2">
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
                </div>
                
                {/* Center Area is transparent for 3D View */}
                <div className="flex-1"></div>

                {/* Right Side - Optional Secondary Info (Target?) */}
                 {/* Spec didn't mandate a right bar, but target info is useful there. Moving to Bottom Bar or overlay. */}
            </div>

            {/* Bottom Critical Data Dashboard */}
            <div className="pointer-events-auto">
                <BottomBar 
                    playerShip={playerShip}
                    targetShip={targetShip}
                    onSetDesiredSpeed={onSetDesiredSpeed}
                    onSetAlertLevel={onSetAlertLevel}
                    gameSpeed={gameSpeed}
                    onSetGameSpeed={onSetGameSpeed}
                    activeManeuver={activeManeuver}
                />
            </div>
        </div>
    );
};
