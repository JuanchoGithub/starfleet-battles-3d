import React from 'react';
import { Ship, Weapon } from '../../types';

const WeaponArc: React.FC<{ weapon: Weapon, index: number }> = ({ weapon, index }) => {
    const arc = 45; // degrees
    const arcRad = arc * (Math.PI / 180);
    const range = weapon.range * 1.5; // Scale range for display

    const startAngle = -arcRad / 2;
    const endAngle = arcRad / 2;

    const x1 = 50 + range * Math.sin(startAngle);
    const y1 = 50 - range * Math.cos(startAngle);
    const x2 = 50 + range * Math.sin(endAngle);
    const y2 = 50 - range * Math.cos(endAngle);
    
    const largeArcFlag = arc > 180 ? 1 : 0;
    
    // Simple alternating colors for clarity if multiple arcs overlap
    const color = index % 2 === 0 ? "rgba(0, 242, 255, 0.2)" : "rgba(0, 242, 255, 0.3)";

    const pathData = `M 50 50 L ${x1} ${y1} A ${range} ${range} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    return <path d={pathData} fill={color} />;
}

export const ShipInfoPanel: React.FC<{ playerShip: Ship }> = ({ playerShip }) => {
  return (
    <div className="h-full p-2 bg-black/30 backdrop-blur-sm border-2 border-cyber-cyan/30 flex flex-col">
        <h2 className="text-center font-bold uppercase tracking-widest text-xs mb-2">Ship Systems</h2>
        <div className="relative w-full aspect-square">
            <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Background grid */}
                <defs>
                    <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0, 242, 255, 0.05)" strokeWidth="0.5"/>
                    </pattern>
                    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                        <rect width="50" height="50" fill="url(#smallGrid)"/>
                        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(0, 242, 255, 0.1)" strokeWidth="1"/>
                    </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />

                {/* Weapon Arcs */}
                {playerShip.weapons.map((w, i) => <WeaponArc key={i} weapon={w} index={i} />)}
                
                {/* Ship Icon */}
                <polygon points="50,40 55,60 45,60" fill="rgba(0, 242, 255, 0.8)" />
            </svg>
        </div>
        <div className="text-xs mt-2">
            <h3 className="font-bold uppercase">Armaments</h3>
            {playerShip.weapons.map((w, i) => (
                <p key={i} className="truncate">{w.name}</p>
            ))}
        </div>
    </div>
  );
};
