'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const STAR_COUNT = 3000;
const FIELD_RADIUS = 150;

export default function StarField() {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(STAR_COUNT * 3);
    const col = new Float32Array(STAR_COUNT * 3);
    const siz = new Float32Array(STAR_COUNT);

    const color = new THREE.Color();

    for (let i = 0; i < STAR_COUNT; i++) {
      // Distribute in a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = FIELD_RADIUS * Math.cbrt(Math.random()); // uniform volume distribution

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      // Subtle slate/gray color for light mode background reference grid
      const shade = 0.8 + Math.random() * 0.1; // 0.8 to 0.9 (light grays to slate)
      color.setHSL(0.6, 0.1, shade);
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;

      siz[i] = 0.05 + Math.random() * 0.15;
    }

    return [pos, col, siz];
  }, []);

  // Subtle twinkle animation
  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const geometry = pointsRef.current.geometry;
    const sizeAttr = geometry.getAttribute('size') as THREE.BufferAttribute;
    const time = clock.elapsedTime;

    for (let i = 0; i < STAR_COUNT; i++) {
      const baseSize = sizes[i];
      sizeAttr.array[i] =
        baseSize * (0.7 + 0.3 * Math.sin(time * (0.5 + i * 0.001) + i));
    }
    sizeAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        vertexColors
        vertexShader={`
          attribute float size;
          varying vec3 vColor;
          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (200.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          varying vec3 vColor;
          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
            alpha = pow(alpha, 1.5);
            gl_FragColor = vec4(vColor, alpha);
          }
        `}
      />
    </points>
  );
}
