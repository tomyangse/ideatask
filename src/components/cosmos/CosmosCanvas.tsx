'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import StarSystem from './StarSystem';
import StarBridge from './StarBridge';
import CameraController from './CameraController';
import { useCosmosStore } from '@/stores/cosmosStore';
import { useUIStore } from '@/stores/uiStore';

function CosmosScene() {
  const nodes = useCosmosStore((s) => s.nodes);
  const connections = useCosmosStore((s) => s.connections);
  const deselectNode = useUIStore((s) => s.deselectNode);
  const focusedSystemId = useUIStore((s) => s.focusedSystemId);

  return (
    <>
      {/* Simple flat lighting for 2D whiteboard */}
      <ambientLight intensity={0.8} />

      {/* Orbital Systems */}
      {(() => {
        // If a non-root node is focused (e.g. idea inside a project), render it as its own StarSystem
        const focusedNode = focusedSystemId ? nodes.find(n => n.id === focusedSystemId) : null;
        const focusedIsNonRoot = focusedNode && focusedNode.parent_id;

        if (focusedIsNonRoot) {
          return (
            <StarSystem
              key={focusedNode.id}
              rootNode={focusedNode}
              isFocused={true}
              overrideOrigin={true}
            />
          );
        }

        return nodes.filter(n => !n.parent_id).map((rootNode) => {
          const isFocused = focusedSystemId === rootNode.id;
          // When a system is focused, hide all other systems
          if (focusedSystemId && !isFocused) return null;
          return (
            <StarSystem 
              key={rootNode.id} 
              rootNode={rootNode} 
              isFocused={isFocused}
            />
          );
        });
      })()}

      {/* Connections between independent nodes (if any) */}
      {connections.filter(c => !nodes.find(n => n.id === c.target_id && n.parent_id === c.source_id)).map((conn) => (
        <StarBridge key={conn.id} connection={conn} />
      ))}

      {/* Camera Controller */}
      <CameraController />

      {/* Click on void to deselect */}
      <mesh
        visible={false}
        position={[0, 0, -1]}
        onClick={() => deselectNode()}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  );
}

export default function CosmosCanvas() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#f8fafc' }}>
      <Canvas
        orthographic
        camera={{ 
          position: [0, 0, 100], 
          zoom: 1,
          near: 0.1, 
          far: 500 
        }}
        gl={{
          antialias: true,
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <CosmosScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
