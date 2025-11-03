import React, { useRef } from 'react';
import { Billboard, Ring, Torus } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Ship } from '../types';

interface TargetReticuleProps {
  targetShip: Ship;
}

const RETICULE_COLOR = '#ff7a00'; // Plasma Orange to match target UI

export const TargetReticule: React.FC<TargetReticuleProps> = ({ targetShip }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const billboardRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Animate the reticle's rotation
    const time = state.clock.getElapsedTime();
    if(billboardRef.current) {
        billboardRef.current.rotation.z = time * 0.5;
    }
    
    // Smoothly follow the target ship
    const targetPosition = new THREE.Vector3(...targetShip.position);
    groupRef.current.position.lerp(targetPosition, 0.15);
  });

  const radius = targetShip.scale * 3.5;

  return (
    <group ref={groupRef}>
      {/* Ground plane ring */}
      <Ring
        args={[radius * 0.95, radius, 64]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <meshBasicMaterial color={RETICULE_COLOR} transparent opacity={0.5} side={THREE.DoubleSide}/>
      </Ring>
      
      {/* Billboarding brackets that face the camera */}
      <Billboard>
        <group ref={billboardRef}>
            {/* Top-right bracket */}
            <Torus args={[radius, 0.08, 16, 32, Math.PI / 2]} rotation={[0, 0, Math.PI / 4]}>
                <meshStandardMaterial color={RETICULE_COLOR} emissive={RETICULE_COLOR} emissiveIntensity={1.5} toneMapped={false} />
            </Torus>
            {/* Top-left bracket */}
            <Torus args={[radius, 0.08, 16, 32, Math.PI / 2]} rotation={[0, 0, (3 * Math.PI) / 4]}>
                <meshStandardMaterial color={RETICULE_COLOR} emissive={RETICULE_COLOR} emissiveIntensity={1.5} toneMapped={false} />
            </Torus>
            {/* Bottom-left bracket */}
            <Torus args={[radius, 0.08, 16, 32, Math.PI / 2]} rotation={[0, 0, (5 * Math.PI) / 4]}>
                <meshStandardMaterial color={RETICULE_COLOR} emissive={RETICULE_COLOR} emissiveIntensity={1.5} toneMapped={false} />
            </Torus>
            {/* Bottom-right bracket */}
            <Torus args={[radius, 0.08, 16, 32, Math.PI / 2]} rotation={[0, 0, (7 * Math.PI) / 4]}>
                <meshStandardMaterial color={RETICULE_COLOR} emissive={RETICULE_COLOR} emissiveIntensity={1.5} toneMapped={false} />
            </Torus>
        </group>
      </Billboard>
    </group>
  );
};