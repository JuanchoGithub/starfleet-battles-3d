
import React from 'react';
import { Ship, AlertLevel, GameSpeed, ActiveManeuver } from '../../types';

interface BottomBarProps {
    playerShip: Ship;
    targetShip?: Ship;
    onSetDesiredSpeed: (speed: number) => void;
    onSetAlertLevel: (level: AlertLevel) => void;
    gameSpeed: GameSpeed;
    onSetGameSpeed: (speed: GameSpeed) => void;
    activeManeuver: ActiveManeuver | null;
}

const StatusGauge: React.FC<{ label: string; current: number; max: number; color: string; unit?: string }> = ({ label, current, max, color, unit = '' }) => {
    const pct = Math.min(100, Math.max(0, (current / max) * 100));
    return (
        <div className="flex flex-col w-24">
            <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400 mb-0.5">
                <span>{label}</span>
                <span>{Math.round(current)}{unit}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full ${color}`} style={{ width: `${pct}%` }}></div>
            </div>
        </div>
    )
}

const AlertButton: React.FC<{
    level: AlertLevel,
    currentLevel: AlertLevel,
    onClick: () => void,
    colorClass: string,
    label: string
}> = ({ level, currentLevel, onClick, colorClass, label }) => {
    const isActive = level === currentLevel;
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1 text-[10px] font-bold uppercase border transition-all duration-200 rounded-sm ${
                isActive 
                ? `${colorClass} text-space-blue-900 border-transparent shadow-[0_0_10px_currentColor]`
                : 'bg-transparent border-gray-600 text-gray-500 hover:border-gray-400'
            }`}
        >
            {label}
        </button>
    );
};

export const BottomBar: React.FC<BottomBarProps> = ({ playerShip, targetShip, onSetDesiredSpeed, onSetAlertLevel, gameSpeed, onSetGameSpeed, activeManeuver }) => {
    
    const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const sliderValue = parseInt(e.target.value, 10);
        const newSpeed = (sliderValue / 20) * playerShip.maxSpeed;
        onSetDesiredSpeed(newSpeed);
    };

    const speedSliderValue = playerShip.maxSpeed > 0 ? (playerShip.desiredSpeed / playerShip.maxSpeed) * 20 : 0;
    
    // Derived Energy Stats
    const totalUsage = playerShip.engines.energyAllocation + 
                       playerShip.shields.reduce((a, b) => a + b.energyAllocation, 0) +
                       playerShip.weapons.reduce((a, b) => a + b.energyAllocation, 0);
    const powerOutput = playerShip.power.output;
    const isPowerCritical = totalUsage > powerOutput;

    return (
        <div className="w-full bg-black/80 backdrop-blur-md border-t border-cyber-cyan/30 p-2 flex items-stretch justify-between gap-4">
            
            {/* Left: Ship Vitality */}
            <div className="flex items-center gap-4 border-r border-gray-700 pr-4">
                <div className="flex flex-col gap-2">
                    <StatusGauge label="Hull Integrity" current={playerShip.hull.current} max={playerShip.hull.max} color="bg-cyber-cyan" />
                    <StatusGauge label="Power Output" current={powerOutput} max={powerOutput} color="bg-yellow-400" unit="/s" />
                </div>
                <div className="flex flex-col gap-2">
                     {/* Simplified Phaser Capacitor Visual based on first weapon charge for now */}
                     <StatusGauge label="Phaser Cap" current={playerShip.weapons[0]?.currentCharge || 0} max={playerShip.weapons[0]?.maxCharge || 1} color="bg-plasma-orange" />
                     <StatusGauge label="Sys Load" current={totalUsage} max={powerOutput} color={isPowerCritical ? 'bg-red-500' : 'bg-green-500'} />
                </div>
            </div>

            {/* Center: Flight Control & Alerts */}
            <div className="flex-1 flex items-center justify-center gap-8">
                 {/* Speed Control */}
                <div className="flex flex-col w-64">
                    <div className="flex justify-between text-xs text-cyber-cyan font-bold mb-1">
                        <span>IMPULSE: {playerShip.currentSpeed.toFixed(1)}</span>
                        <span>SET: {playerShip.desiredSpeed.toFixed(1)}</span>
                    </div>
                    <div className="relative h-6 bg-space-blue-800 rounded border border-cyber-cyan/30">
                        <div 
                            className="absolute top-0 left-0 h-full bg-cyber-cyan/30 transition-all duration-200" 
                            style={{ width: `${(playerShip.currentSpeed/playerShip.maxSpeed)*100}%` }}
                        />
                        <input
                            type="range"
                            min="0"
                            max="20"
                            step="1"
                            value={speedSliderValue}
                            onChange={handleSpeedChange}
                            className="range-slider absolute inset-0 opacity-0 cursor-pointer"
                        />
                        {/* Ticks */}
                        <div className="absolute top-1/2 w-full flex justify-between px-1 pointer-events-none">
                            {[0,1,2,3,4].map(i => <div key={i} className="w-px h-2 bg-cyber-cyan/50"></div>)}
                        </div>
                    </div>
                </div>

                {/* Alert Status */}
                <div className="flex flex-col gap-1">
                     <AlertButton level={AlertLevel.RED} currentLevel={playerShip.alertLevel} onClick={() => onSetAlertLevel(AlertLevel.RED)} colorClass="bg-red-600 border-red-600" label="Red Alert" />
                     <AlertButton level={AlertLevel.YELLOW} currentLevel={playerShip.alertLevel} onClick={() => onSetAlertLevel(AlertLevel.YELLOW)} colorClass="bg-yellow-500 border-yellow-500" label="Yellow Alert" />
                     <AlertButton level={AlertLevel.GREEN} currentLevel={playerShip.alertLevel} onClick={() => onSetAlertLevel(AlertLevel.GREEN)} colorClass="bg-green-500 border-green-500" label="Green Alert" />
                </div>

                {/* Fire Control */}
                <button 
                    className="h-12 w-32 bg-red-900/80 border-2 border-red-500 text-red-100 font-bold text-xl tracking-widest uppercase rounded hover:bg-red-600 hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all flex flex-col items-center justify-center"
                    title="Fire Selected Weapons"
                >
                    <span>FIRE</span>
                    <span className="text-[10px] tracking-normal opacity-70">ALL SELECTED</span>
                </button>
            </div>

            {/* Right: Target Info & Time */}
            <div className="flex items-center gap-4 border-l border-gray-700 pl-4">
                {targetShip ? (
                     <div className="flex flex-col w-32">
                        <p className="text-xs font-bold text-plasma-orange truncate mb-1">{targetShip.name}</p>
                        <StatusGauge label="Target Hull" current={targetShip.hull.current} max={targetShip.hull.max} color="bg-plasma-orange" />
                        <StatusGauge label="Shields" current={targetShip.shields.reduce((a,b)=>a+b.current,0)} max={targetShip.shields.reduce((a,b)=>a+b.max,0)} color="bg-white" />
                    </div>
                ) : (
                    <div className="w-32 text-center text-xs text-gray-600 font-bold">NO TARGET</div>
                )}
                
                <div className="flex flex-col gap-1">
                     <button onClick={() => onSetGameSpeed(gameSpeed === GameSpeed.PAUSED ? GameSpeed.PLAY : GameSpeed.PAUSED)} className={`w-12 py-1 text-[10px] font-bold border rounded ${gameSpeed === GameSpeed.PAUSED ? 'bg-yellow-500 text-black' : 'border-gray-600 text-gray-400'}`}>
                        {gameSpeed === GameSpeed.PAUSED ? 'RESUME' : 'PAUSE'}
                     </button>
                     <div className="text-[10px] text-gray-500 text-center uppercase">
                         {activeManeuver ? <span className="text-plasma-orange animate-pulse">Maneuver Active</span> : 'Normal Flight'}
                     </div>
                </div>
            </div>
        </div>
    );
};
