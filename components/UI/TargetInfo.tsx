import React from 'react';
import { Ship } from '../../types';
import * as THREE from 'three';

interface TargetInfoProps {
    targetShip: Ship;
    playerShip: Ship;
}

const ThreatIndicator: React.FC<{ playerShip: Ship, targetShip: Ship }> = ({ playerShip, targetShip }) => {
    const playerPos = new THREE.Vector3(...playerShip.position);
    const targetPos = new THREE.Vector3(...targetShip.position);
    const playerForward = new THREE.Vector3(0, 0, 1).applyEuler(new THREE.Euler(...playerShip.rotation, 'YXZ'));

    const toTarget = targetPos.clone().sub(playerPos).normalize();
    
    let angle = Math.atan2(toTarget.x, toTarget.z) - Math.atan2(playerForward.x, playerForward.z);
    
    // Normalize angle to 0-2PI range relative to ship's forward
    angle = (angle + 2 * Math.PI) % (2 * Math.PI);
    
    // Convert to degrees and adjust for hexagon segments
    const angleDeg = angle * 180 / Math.PI;

    // Segment definitions for a flat-top hexagon (relative to forward)
    let hitSegment = 0; // Front (-30 to 30 deg)
    if (angleDeg > 30 && angleDeg <= 90) hitSegment = 1; // Front-right
    else if (angleDeg > 90 && angleDeg <= 150) hitSegment = 2; // Rear-right
    else if (angleDeg > 150 && angleDeg <= 210) hitSegment = 3; // Rear
    else if (angleDeg > 210 && angleDeg <= 270) hitSegment = 4; // Rear-left
    else if (angleDeg > 270 && angleDeg <= 330) hitSegment = 5; // Front-left
    
    const hexPoints = "13,5 39,5 52,30 39,55 13,55 0,30";
    const segmentPoints = [
      "13,5 39,5",     // 0: Front
      "39,5 52,30",    // 1: Front-Right
      "52,30 39,55",   // 2: Rear-Right
      "39,55 13,55",   // 3: Rear
      "13,55 0,30",    // 4: Rear-Left
      "0,30 13,5",     // 5: Front-Left
    ];

    return (
      <div className="flex flex-col items-center my-2">
        <p className="text-xs uppercase mb-1">Incoming Vector</p>
        <svg width="52" height="60" viewBox="-1 -1 54 62">
            <polygon points={hexPoints} fill="none" stroke="rgba(255, 122, 0, 0.3)" strokeWidth="1"/>
            <line 
                points={segmentPoints[hitSegment]} 
                stroke="#ff7a00" 
                strokeWidth="3"
                x1={segmentPoints[hitSegment].split(' ')[0].split(',')[0]}
                y1={segmentPoints[hitSegment].split(' ')[0].split(',')[1]}
                x2={segmentPoints[hitSegment].split(' ')[1].split(',')[0]}
                y2={segmentPoints[hitSegment].split(' ')[1].split(',')[1]}
            />
        </svg>
      </div>
    );
}

export const TargetInfo: React.FC<TargetInfoProps> = ({ targetShip, playerShip }) => {
    const hullPercentage = (targetShip.hull.current / targetShip.hull.max) * 100;
    const totalShields = targetShip.shields.reduce((acc, s) => acc + s.current, 0);
    const maxShields = targetShip.shields.reduce((acc, s) => acc + s.max, 0);
    const shieldPercentage = maxShields > 0 ? (totalShields / maxShields) * 100 : 0;
    
    const baseShieldDisplayPercentage = Math.min(100, shieldPercentage);
    const overchargeShieldDisplayPercentage = Math.min(100, Math.max(0, shieldPercentage - 100));

    const playerPos = new THREE.Vector3(...playerShip.position);
    const targetPos = new THREE.Vector3(...targetShip.position);
    const distance = playerPos.distanceTo(targetPos);

    return (
        <div className="h-full p-2 bg-black/30 backdrop-blur-sm border-2 border-plasma-orange/30 flex flex-col">
            <h2 className="font-bold text-plasma-orange text-center uppercase tracking-widest text-xs">Target Info</h2>
            <div className="flex-1 flex flex-col justify-around">
                <div>
                    <p className="font-bold text-plasma-orange text-base truncate">{targetShip.name}</p>
                    <p className="text-xs uppercase">DIST: {distance.toFixed(0)}m</p>
                </div>
                <div>
                    <div className="flex justify-between text-xs"><span>HULL</span><span>{targetShip.hull.current}/{targetShip.hull.max}</span></div>
                    <div className="w-full h-2 bg-space-blue-800 border border-plasma-orange/50">
                        <div className="h-full bg-plasma-orange" style={{ width: `${hullPercentage}%` }}></div>
                    </div>
                </div>
                 <div>
                    <div className="flex justify-between text-xs"><span>SHIELD</span><span>{Math.round(totalShields)}/{maxShields}</span></div>
                     <div className="w-full h-2 bg-space-blue-800 border border-cyber-cyan/50 relative">
                        <div
                            className="h-full bg-cyber-cyan"
                            style={{
                                width: `${baseShieldDisplayPercentage}%`,
                                transition: 'width 0.2s ease-out'
                            }}
                        ></div>
                        {overchargeShieldDisplayPercentage > 0 && (
                            <div
                                className="absolute top-0 left-0 h-full bg-white"
                                style={{
                                    width: `${overchargeShieldDisplayPercentage}%`,
                                    transition: 'width 0.2s ease-out'
                                }}
                            ></div>
                        )}
                    </div>
                </div>
                 <ThreatIndicator playerShip={playerShip} targetShip={targetShip} />
            </div>
        </div>
    );
};