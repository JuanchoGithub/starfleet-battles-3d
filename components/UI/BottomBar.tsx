
import React from 'react';
import { Ship, AlertLevel, GameSpeed } from '../../types';

interface BottomBarProps {
    playerShip: Ship;
    onSetDesiredSpeed: (speed: number) => void;
    onSetAlertLevel: (level: AlertLevel) => void;
    gameSpeed: GameSpeed;
    onSetGameSpeed: (speed: GameSpeed) => void;
}

const AlertButton: React.FC<{
    level: AlertLevel,
    currentLevel: AlertLevel,
    onClick: () => void,
    color: string,
    label: string
}> = ({ level, currentLevel, onClick, color, label }) => {
    const isActive = level === currentLevel;
    return (
        <button
            onClick={onClick}
            className={`w-16 h-8 rounded-full text-xs font-bold uppercase transition-all duration-200 ${
                isActive 
                ? `${color} text-space-blue-900 shadow-lg`
                : 'bg-black/30 border-2 border-space-blue-700/80 text-gray-400 hover:border-gray-400'
            }`}
        >
            {label}
        </button>
    );
};

const TimeControlButton: React.FC<{
    title: string;
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
}> = ({ title, isActive, onClick, children }) => {
    return (
        <button
            onClick={onClick}
            title={title}
            className={`w-10 h-8 flex items-center justify-center transition-all duration-200 rounded ${
                isActive 
                ? 'bg-cyber-cyan text-space-blue-900 shadow-lg'
                : 'bg-black/30 border-2 border-space-blue-700/80 text-gray-400 hover:border-gray-400'
            }`}
        >
            {children}
        </button>
    );
};

export const BottomBar: React.FC<BottomBarProps> = ({ playerShip, onSetDesiredSpeed, onSetAlertLevel, gameSpeed, onSetGameSpeed }) => {
    
    const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const sliderValue = parseInt(e.target.value, 10);
        const newSpeed = (sliderValue / 20) * playerShip.maxSpeed;
        onSetDesiredSpeed(newSpeed);
    };

    const speedSliderValue = playerShip.maxSpeed > 0 ? (playerShip.desiredSpeed / playerShip.maxSpeed) * 20 : 0;
    const currentSpeedPercentage = playerShip.maxSpeed > 0 ? (playerShip.currentSpeed / playerShip.maxSpeed) * 100 : 0;

    return (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl p-2 pointer-events-auto">
            <div className="flex items-center justify-center gap-6 bg-black/30 backdrop-blur-sm px-6 py-3 border-2 border-space-blue-700/80 rounded-t-lg">
                
                {/* Time Controls */}
                <div className="flex items-center gap-2">
                    <TimeControlButton title="Pause" isActive={gameSpeed === GameSpeed.PAUSED} onClick={() => onSetGameSpeed(GameSpeed.PAUSED)}>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                        </svg>
                    </TimeControlButton>
                    <TimeControlButton title="Slow" isActive={gameSpeed === GameSpeed.SLOW} onClick={() => onSetGameSpeed(GameSpeed.SLOW)}>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11 18V6l-8.5 6 8.5 6zm.5-6 8.5 6V6l-8.5 6z"/>
                        </svg>
                    </TimeControlButton>
                    <TimeControlButton title="Play" isActive={gameSpeed === GameSpeed.PLAY} onClick={() => onSetGameSpeed(GameSpeed.PLAY)}>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </TimeControlButton>
                    <TimeControlButton title="Fast" isActive={gameSpeed === GameSpeed.FAST} onClick={() => onSetGameSpeed(GameSpeed.FAST)}>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="m4 18 8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/>
                        </svg>
                    </TimeControlButton>
                </div>
                
                {/* Speed Control */}
                <div className="flex-1 flex items-center gap-4">
                    <span className="font-bold text-xs uppercase w-20 text-right">Speed</span>
                    <div className="w-full">
                        <div className="relative h-4 flex items-center">
                            {/* Background track */}
                            <div className="absolute w-full h-2 bg-space-blue-800 rounded-lg"></div>
                            {/* Current speed fill */}
                            <div 
                                className="absolute h-2 bg-cyber-cyan/70 rounded-lg"
                                style={{ 
                                    width: `${currentSpeedPercentage}%`,
                                    transition: 'width 200ms linear'
                                }}
                            ></div>
                            {/* Desired speed slider */}
                            <input
                                type="range"
                                min="0"
                                max="20"
                                step="1"
                                value={speedSliderValue}
                                onChange={handleSpeedChange}
                                className="range-slider absolute w-full h-full bg-transparent appearance-none cursor-pointer"
                            />
                        </div>
                         <div className="flex justify-between text-xs mt-1">
                            <span>0</span>
                            <span>1/4</span>
                            <span>1/2</span>
                            <span>3/4</span>
                            <span>MAX</span>
                        </div>
                    </div>
                    <div className="text-center w-24">
                        <p className="font-bold text-lg">{playerShip.currentSpeed.toFixed(1)}</p>
                        <p className="text-xs text-gray-400">Current</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                    <button
                        className="w-24 h-12 bg-red-600/50 text-white font-bold text-lg uppercase border-2 border-red-500/80 rounded-md hover:bg-red-500/70 disabled:bg-gray-600/50 disabled:border-gray-500 flex items-center justify-center gap-2"
                        disabled={playerShip.alertLevel !== AlertLevel.RED}
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="22" y1="12" x2="18" y2="12"></line>
                            <line x1="6" y1="12" x2="2" y2="12"></line>
                            <line x1="12" y1="6" x2="12" y2="2"></line>
                            <line x1="12" y1="22" x2="12" y2="18"></line>
                        </svg>
                        <span>FIRE</span>
                    </button>

                    <div className="flex flex-col gap-1">
                        <AlertButton
                            level={AlertLevel.GREEN}
                            currentLevel={playerShip.alertLevel}
                            onClick={() => onSetAlertLevel(AlertLevel.GREEN)}
                            color="bg-green-500"
                            label="Green"
                        />
                         <AlertButton
                            level={AlertLevel.YELLOW}
                            currentLevel={playerShip.alertLevel}
                            onClick={() => onSetAlertLevel(AlertLevel.YELLOW)}
                            color="bg-yellow-500"
                            label="Yellow"
                        />
                         <AlertButton
                            level={AlertLevel.RED}
                            currentLevel={playerShip.alertLevel}
                            onClick={() => onSetAlertLevel(AlertLevel.RED)}
                            color="bg-red-500"
                            label="Red"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
