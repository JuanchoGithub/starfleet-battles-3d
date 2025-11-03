
import React, { useRef, useMemo, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { Ship as ShipType, AlertLevel } from '../types';
import { SHIELD_RADIUS } from '../constants';

interface ShipProps {
  shipData: ShipType;
  onSetTargetShipId: (id: number) => void;
}

export const Ship = forwardRef<THREE.Group, ShipProps>(({ shipData, onSetTargetShipId }, ref) => {
  const meshRef = useRef<THREE.Group>(null);
  
  // This useFrame is now only for synchronizing the visual representation
  // with the game state calculated in the main game loop (GameCanvas).
  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.position.fromArray(shipData.position);

    const finalRotation = [...shipData.rotation] as [number, number, number];
    if (shipData.visualRotationOffsetY) {
        finalRotation[1] += shipData.visualRotationOffsetY;
    }
    
    meshRef.current.quaternion.setFromEuler(new THREE.Euler(...finalRotation, 'YXZ'));
  });

  const shieldLines = useMemo(() => {
    if (shipData.alertLevel === AlertLevel.GREEN) return [];

    return shipData.shields.map((segment, i) => {
        const angle1 = (120 - i * 60) * Math.PI / 180;
        const angle2 = (60 - i * 60) * Math.PI / 180;
        
        const start = new THREE.Vector3(Math.cos(angle1) * SHIELD_RADIUS, 0, Math.sin(angle1) * SHIELD_RADIUS);
        const end = new THREE.Vector3(Math.cos(angle2) * SHIELD_RADIUS, 0, Math.sin(angle2) * SHIELD_RADIUS);
        
        const strength = segment.current / segment.max;
        if (strength <= 0) return null;

        const lines: { start: THREE.Vector3; end: THREE.Vector3; thickness: number; color: string; key: string }[] = [];
        let color = '';
        const minThickness = 0.5;

        if (strength <= 0.333) {
            color = '#ff4444'; // Red
            const normalizedStrength = strength / 0.333;
            const thickness = minThickness + normalizedStrength * 2.5;
            lines.push({ start, end, thickness, color, key: `${i}-1`});
        } else if (strength <= 0.666) {
            color = '#ffff00'; // Yellow
            const normalizedStrength = (strength - 0.333) / 0.333;
            const thickness = minThickness + normalizedStrength * 2.0;
            lines.push({ start, end, thickness, color, key: `${i}-1`});
            lines.push({ start: start.clone().multiplyScalar(1.05), end: end.clone().multiplyScalar(1.05), thickness, color, key: `${i}-2`});
        } else { // strength > 0.666 (Green and Overcharged)
            color = '#00ff00'; // Green
            const normalizedStrength = (strength - 0.666) / 0.334;
            // Thickness will now increase past the 100% mark. Capped at 5 for sanity.
            const thickness = Math.min(5, minThickness + normalizedStrength * 1.5);
            lines.push({ start, end, thickness, color, key: `${i}-1`});
            lines.push({ start: start.clone().multiplyScalar(1.05), end: end.clone().multiplyScalar(1.05), thickness, color, key: `${i}-2`});
            lines.push({ start: start.clone().multiplyScalar(1.1), end: end.clone().multiplyScalar(1.1), thickness, color, key: `${i}-3`});
            
            // If overcharged, add a 4th, distinct line.
            if (strength > 1) {
                const overchargeColor = '#00f2ff'; // Cyber cyan
                // The 4th line's thickness is proportional to the overcharge amount. Capped at 3.
                const overchargedThickness = Math.min(3, 1 + (strength - 1) * 4);
                lines.push({
                    start: start.clone().multiplyScalar(1.15),
                    end: end.clone().multiplyScalar(1.15),
                    thickness: overchargedThickness,
                    color: overchargeColor,
                    key: `${i}-4`
                });
            }
        }

        return lines.map(line => <Line points={[line.start, line.end]} color={line.color} lineWidth={line.thickness} key={line.key} />);
    }).flat().filter(Boolean);
  }, [shipData.shields, shipData.alertLevel]);

  const handlePointerDown = (e: any) => {
      e.stopPropagation();
      if (shipData.id !== 1) { // Assuming player ship is ID 1
          onSetTargetShipId(shipData.id);
      }
  };

  return (
    <group ref={ref as React.Ref<THREE.Group>}>
        <group ref={meshRef}>
            {shieldLines}
            <group onPointerDown={handlePointerDown}>
                <mesh scale={shipData.scale} rotation={[-Math.PI / 2, 0, 0]}>
                    <coneGeometry args={[1, 3, 6]} />
                    <meshStandardMaterial color={shipData.id === 1 ? 'royalblue' : 'indianred'} />
                </mesh>
            </group>
        </group>
    </group>
  );
});