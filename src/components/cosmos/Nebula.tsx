'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Subtle nebula cloud effect — a large, semi-transparent textured sphere
 * positioned in the background to add depth.
 */
export default function Nebula() {
  const nebulae = useMemo(() => [
    { position: [15, 8, -30] as [number, number, number], color: '#4C1D95', scale: 20, opacity: 0.04 },
    { position: [-20, -5, -25] as [number, number, number], color: '#1E3A5F', scale: 18, opacity: 0.03 },
    { position: [5, -15, -35] as [number, number, number], color: '#831843', scale: 22, opacity: 0.025 },
  ], []);

  return (
    <group>
      {nebulae.map((nebula, i) => (
        <mesh key={i} position={nebula.position}>
          <sphereGeometry args={[nebula.scale, 16, 16]} />
          <meshBasicMaterial
            color={nebula.color}
            transparent
            opacity={nebula.opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
