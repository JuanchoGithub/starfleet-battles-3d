import React, { useState } from 'react';
import { Ship } from '../../types';

interface ShieldStatusProps {
    ship: Ship;
}

const ShieldSegmentDisplay: React.FC<{ angle: number; strength: number; overcharged: boolean }> = ({ angle, strength, overcharged }) => {
    const RADIUS = 45; 
    const SEGMENT_LENGTH = 2 * RADIUS * Math.tan(Math.PI / 6); 
    const THICKNESS = 4;

    const segmentStyle: React.CSSProperties = {
        position: 'absolute',
        width: `${SEGMENT_LENGTH}px`,
        height: `${THICKNESS}px`,
        transform: `rotate(${angle}deg) translateY(-${RADIUS}px)`,
        transformOrigin: 'center',
    };
    
    const backgroundStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--cyber-cyan-color, #00f2ff)',
        opacity: 0.15,
    };

    const fillStyle: React.CSSProperties = {
        position: 'absolute',
        left: '50%',
        top: 0,
        transform: 'translateX(-50%)',
        width: `${strength}%`,
        height: '100%',
        backgroundColor: 'var(--cyber-cyan-color, #00f2ff)',
        opacity: 0.8,
        transition: 'width 0.2s ease-out',
    };
    
    const overchargedStyle: React.CSSProperties = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '105%',
        height: `${THICKNESS + 2}px`,
        backgroundColor: '#ffffff',
        filter: 'blur(2px)',
        opacity: overcharged ? 0.9 : 0,
        transition: 'opacity 0.2s ease-out',
    };

    return (
        <div style={segmentStyle}>
            <div style={backgroundStyle} />
            <div style={fillStyle} />
            <div style={overchargedStyle} />
        </div>
    );
};

const ShieldStatusDisplay: React.FC<ShieldStatusProps> = ({ ship }) => {
    return (
        <div className="relative w-32 h-32 flex items-center justify-center mx-auto" style={{'--cyber-cyan-color': '#00f2ff'} as React.CSSProperties}>
             <div className="absolute text-center select-none">
                <p className="text-xl font-bold">{Math.round((ship.hull.current / ship.hull.max) * 100)}%</p>
                <p className="text-xs uppercase">Hull</p>
            </div>
            {ship.shields.map((segment, index) => {
                const percentage = Math.round((segment.current / segment.max) * 100);
                const angleDeg = index * 60;
                const angleRad = angleDeg * Math.PI / 180;
                const textRadius = 58; // Position text just outside the shield display
                const x = textRadius * Math.sin(angleRad);
                const y = -textRadius * Math.cos(angleRad);

                const textStyle: React.CSSProperties = {
                    position: 'absolute',
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: 'translate(-50%, -50%)',
                    color: segment.current > segment.max ? '#ffffff' : 'var(--cyber-cyan-color, #00f2ff)',
                    textShadow: segment.current > segment.max ? '0 0 4px #ffffff, 0 0 8px #00f2ff' : 'none',
                    transition: 'color 0.2s ease-out',
                };
                
                return (
                    <React.Fragment key={index}>
                        <ShieldSegmentDisplay
                            angle={angleDeg}
                            strength={Math.min(100, (segment.current / segment.max) * 100)}
                            overcharged={segment.current > segment.max}
                        />
                         <div style={textStyle} className="text-xs font-bold select-none w-10 text-center">
                            {percentage}%
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
};

const ShieldManagement: React.FC<{
    ship: Ship;
    onSetEnergyAllocation: (index: number, value: number) => void;
}> = ({ ship, onSetEnergyAllocation }) => {
    const [selected, setSelected] = useState<number[]>([]);

    const toggleSelection = (index: number) => {
        setSelected(prev => 
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const handleAllocationChange = (value: number) => {
        selected.forEach(index => {
            onSetEnergyAllocation(index, value);
        });
    };

    const reinforceAll = () => {
        ship.shields.forEach((_, index) => {
            onSetEnergyAllocation(index, 10);
        });
    };
    
    const segmentPaths = [
      "50,0 78,14 65,37 35,37 22,14",   // 0: Front
      "78,14 88,50 65,50 65,37",       // 1: Front-Right
      "65,50 88,50 78,86 65,63",       // 2: Rear-Right
      "65,63 35,63 22,86 50,100 78,86", // 3: Rear
      "35,50 12,50 22,86 35,63",       // 4: Rear-Left
      "22,14 12,50 35,50 35,37",       // 5: Front-Left
    ];

    const textPositions = [
        { x: 50, y: 20 }, // 0: Front
        { x: 76, y: 38 }, // 1: Front-Right
        { x: 76, y: 62 }, // 2: Rear-Right
        { x: 50, y: 83 }, // 3: Rear
        { x: 24, y: 62 }, // 4: Rear-Left
        { x: 24, y: 38 }, // 5: Front-Left
    ];

    const sliderValue = selected.length > 0 ? ship.shields[selected[0]].energyAllocation : 0;

    return (
        <div className="flex items-center justify-around h-full">
            <svg viewBox="-2 -2 104 104" className="w-28 h-28">
                <defs>
                    {ship.shields.map((shield, index) => {
                        const pos = textPositions[index];
                        const energyPercent = (shield.energyAllocation / 10) * 100;
                        return (
                            <radialGradient key={index} id={`shieldGrad${index}`} cx={pos.x} cy={pos.y} r="35" gradientUnits="userSpaceOnUse">
                                {/* A bright core whose intensity is tied to energy level */}
                                <stop offset="0%" stopColor="#aaffff" stopOpacity={0.1 + (energyPercent / 100) * 0.8} />
                                {/* The main glow color that expands its influence with energy */}
                                <stop offset={`${energyPercent}%`} stopColor="#00f2ff" stopOpacity={0.1 + (energyPercent / 100) * 0.5} />
                                {/* The outer edge, which is always dim, creating the falloff */}
                                <stop offset="100%" stopColor="rgba(0, 242, 255, 0.1)" />
                            </radialGradient>
                        );
                    })}
                </defs>
                {segmentPaths.map((path, logicalIndex) => {
                    const isSelected = selected.includes(logicalIndex);
                    const pos = textPositions[logicalIndex];
                    return (
                        <g key={logicalIndex} onClick={() => toggleSelection(logicalIndex)}>
                            <polygon
                                points={path}
                                fill={`url(#shieldGrad${logicalIndex})`}
                                stroke={isSelected ? '#ffffff' : 'rgba(0, 242, 255, 0.3)'}
                                strokeWidth={isSelected ? "2" : "1"}
                                className="cursor-pointer transition-all duration-150 hover:stroke-cyber-cyan"
                            />
                            <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
                                className="fill-white font-bold text-[10px] pointer-events-none select-none"
                                >
                                {ship.shields[logicalIndex].energyAllocation}
                            </text>
                        </g>
                    );
                })}
            </svg>
            <div className="flex flex-col gap-3 items-center w-24">
                 <div className="w-full">
                    <div className="flex justify-between items-center text-xs mb-1">
                        <label className="uppercase">Level</label>
                        <span className="font-bold text-white bg-black/30 px-2 py-0.5 rounded">{sliderValue}</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={sliderValue}
                        disabled={selected.length === 0}
                        onChange={(e) => handleAllocationChange(parseInt(e.target.value, 10))}
                        className="w-full h-1 bg-space-blue-800 rounded-lg appearance-none cursor-pointer range-thumb:bg-cyber-cyan disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                 </div>
                <button onClick={reinforceAll} className="px-2 py-1 text-xs uppercase bg-cyber-cyan/20 border border-cyber-cyan/50 rounded w-full">Reinforce All</button>
            </div>
        </div>
    );
}

interface ShieldPanelProps {
    playerShip: Ship;
    onSetEnergyAllocation: (componentType: 'engines' | 'shield' | 'weapon', index: number, value: number) => void;
}

export const ShieldPanel: React.FC<ShieldPanelProps> = ({ playerShip, onSetEnergyAllocation }) => {
    const [view, setView] = useState<'status' | 'manage'>('status');

    return (
        <div className="h-full bg-black/30 backdrop-blur-sm border-2 border-cyber-cyan/30 flex flex-col">
            <div className="flex">
                <button onClick={() => setView('status')} className={`flex-1 text-center font-bold uppercase tracking-widest text-xs py-1 ${view === 'status' ? 'bg-cyber-cyan/20' : 'bg-black/20 text-cyber-cyan/60'}`}>Status</button>
                <button onClick={() => setView('manage')} className={`flex-1 text-center font-bold uppercase tracking-widest text-xs py-1 ${view === 'manage' ? 'bg-cyber-cyan/20' : 'bg-black/20 text-cyber-cyan/60'}`}>Manage</button>
            </div>
            <div className="flex-1 p-1">
                {view === 'status' ? (
                    <ShieldStatusDisplay ship={playerShip} />
                ) : (
                    <ShieldManagement 
                        ship={playerShip} 
                        onSetEnergyAllocation={(index, value) => onSetEnergyAllocation('shield', index, value)} 
                    />
                )}
            </div>
        </div>
    );
};