

import React from 'react';
import { Ship, ActiveManeuver } from '../../types';

interface TopHUDProps {
    playerShip: Ship;
    targetShip?: Ship;
    activeManeuver: ActiveManeuver | null;
}

const StatusBar: React.FC<{ label: string; current: number; max: number; color: string; }> = ({ label, current, max, color }) => {
    const percentage = max > 0 ? (current / max) * 100 : 0;
    const barColor = color === 'cyan' ? 'bg-cyber-cyan' : 'bg-plasma-orange';
    const borderColor = color === 'cyan' ? 'border-cyber-cyan/50' : 'border-plasma-orange/50';
    const textColor = color === 'cyan' ? 'text-cyber-cyan' : 'text-plasma-orange';

    return (
        <div className="w-64">
            <div className={`flex justify-between text-xs font-bold ${textColor}`}>
                <span>{label}</span>
                <span>{Math.round(current)}/{max}</span>
            </div>
            <div className={`w-full h-2 bg-space-blue-800 border ${borderColor}`}>
                <div className={`h-full ${barColor}`} style={{ width: `${percentage}%`, transition: 'width 0.2s ease-out' }}></div>
            </div>
        </div>
    );
};

export const TopHUD: React.FC<TopHUDProps> = ({ playerShip, targetShip, activeManeuver }) => {
    const maneuverChargePercent = activeManeuver ? (activeManeuver.charge / activeManeuver.chargeNeeded) * 100 : 0;
    
    return (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl p-2 pointer-events-auto">
            <div className="flex items-center justify-center gap-8 bg-black/30 backdrop-blur-sm px-6 py-2 border-2 border-space-blue-700/80 rounded-b-lg">
                {/* Player Hull */}
                <StatusBar 
                    label="PLAYER HULL"
                    current={playerShip.hull.current}
                    max={playerShip.hull.max}
                    color="cyan"
                />

                {/* Target Hull */}
                {targetShip ? (
                     <StatusBar 
                        label="TARGET HULL"
                        current={targetShip.hull.current}
                        max={targetShip.hull.max}
                        color="orange"
                    />
                ) : (
                    <div className="w-64">
                        <div className="text-xs font-bold text-plasma-orange/50 text-center py-4">NO TARGET</div>
                    </div>
                )}
            </div>
            {activeManeuver && activeManeuver.status === 'charging' && (
                 <div className="absolute top-full mt-2 w-full max-w-md left-1/2 -translate-x-1/2 bg-black/30 backdrop-blur-sm p-2 border-2 border-plasma-orange/50">
                    <div className="flex justify-between items-center text-xs text-plasma-orange mb-1">
                        <span className="font-bold uppercase tracking-widest">{activeManeuver.type}</span>
                        <span>CHARGING...</span>
                    </div>
                    <div className="w-full h-2 bg-space-blue-800 border border-plasma-orange/30">
                        <div className="h-full bg-plasma-orange" style={{ width: `${maneuverChargePercent}%`, transition: 'width 100ms linear' }}></div>
                    </div>
                 </div>
            )}
        </div>
    );
};
