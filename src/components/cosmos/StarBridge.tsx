'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { ExoConnection } from '@/lib/types';
import { useCosmosStore } from '@/stores/cosmosStore';

interface StarBridgeProps {
  connection: ExoConnection;
}

export default function StarBridge({ connection }: StarBridgeProps) {
  const getNodeById = useCosmosStore((s) => s.getNodeById);
  const source = getNodeById(connection.source_id);
  const target = getNodeById(connection.target_id);

  const points = useMemo(() => {
    if (!source || !target) return null;

    const start = new THREE.Vector3(source.pos_x, source.pos_y, source.pos_z);
    const end = new THREE.Vector3(target.pos_x, target.pos_y, target.pos_z);

    // Create a gentle 2D curve between the two stars on the XY plane
    const mid = new THREE.Vector3()
      .addVectors(start, end)
      .multiplyScalar(0.5);
    // Add an orthogonal offset to make it a neat 2D arc
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    mid.x -= dy * 0.15;
    mid.y += dx * 0.15;

    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    return curve.getPoints(32);
  }, [source, target]);

  if (!points) return null;

  const opacity = connection.strength * 0.4;
  const colorHex = connection.type === 'ai_suggested' ? '#A78BFA'
    : connection.type === 'evolved' ? '#F59E0B'
    : connection.type === 'depends_on' ? '#3B82F6'
    : '#94A3B8';

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(points.flatMap((p) => [p.x, p.y, 0])), 3]} // Strict 2D
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={colorHex}
        transparent
        opacity={opacity}
        depthWrite={false}
        linewidth={1.5}
      />
    </line>
  );
}
