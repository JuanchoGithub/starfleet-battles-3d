
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { Ship } from '../types';

interface RotationArcProps {
  ship: Ship;
}

export const RotationArc: React.FC<RotationArcProps> = ({ ship }) => {
  const points = useMemo(() => {
    if (!ship || ship.targetRotation === null) return [];

    const currentAngle = ship.rotation[1];
    const targetAngle = ship.targetRotation;

    let angleDiff = targetAngle - currentAngle;
    while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
    while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;

    // Don't draw if the difference is negligible
    if (Math.abs(angleDiff) < 0.02) return [];

    // THREE.ArcCurve angles are measured from the positive X axis, but our world is Y-up
    // with 0 rotation along the positive Z axis. We adjust by -PI/2.
    const start = -currentAngle + Math.PI / 2;
    const end = -(currentAngle + angleDiff) + Math.PI / 2;

    const clockwise = angleDiff < 0;

    const curve = new THREE.ArcCurve(0, 0, 5, start, end, clockwise);
    return curve.getPoints(32);
  }, [ship.rotation, ship.targetRotation]);

  if (points.length === 0) return null;

  return (
    <group position={ship.position} rotation={[Math.PI / 2, 0, 0]}>
      <Line 
        points={points} 
        color="#00f2ff" 
        lineWidth={2} 
        dashed 
        dashSize={0.2} 
        gapSize={0.1} 
      />
    </group>
  );
};
